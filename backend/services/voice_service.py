import numpy as np
import librosa
import io
from typing import Dict, Any

import subprocess

# Get imageio-ffmpeg bundled binary path (no system PATH required)
_FFMPEG_EXE = None
try:
    import imageio_ffmpeg
    _FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:
    pass


def _to_wav_bytes(audio_bytes: bytes) -> bytes:
    """
    Convert any browser audio (WebM, Opus, OGG, MP3, MP4) → 16-bit mono WAV
    using ffmpeg via subprocess. Returns original bytes if conversion fails.
    """
    if not _FFMPEG_EXE:
        return audio_bytes
    # If already WAV, skip conversion
    if audio_bytes[:4] == b'RIFF':
        return audio_bytes
    try:
        proc = subprocess.Popen(
            [
                _FFMPEG_EXE,
                '-y',                    # overwrite without asking
                '-i', 'pipe:0',          # read from stdin
                '-f', 'wav',             # output format WAV
                '-acodec', 'pcm_s16le',  # 16-bit PCM
                '-ar', '22050',          # sample rate to match librosa default
                '-ac', '1',              # mono
                'pipe:1',                # write to stdout
            ],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        wav_bytes, _ = proc.communicate(input=audio_bytes, timeout=30)
        if proc.returncode == 0 and len(wav_bytes) > 44:
            return wav_bytes
    except Exception:
        pass
    return audio_bytes  # fall back to original bytes



def extract_voice_features(audio_bytes: bytes, sample_rate: int = 22050) -> Dict[str, Any]:
    """
    Extract clinically-validated voice biomarkers for Parkinson's detection.
    Based on the MDVP (Multi-Dimensional Voice Program) feature set used in
    Little et al. 2009 and the UCI Parkinson's dataset.
    """
    # Convert WebM/Opus (browser format) → WAV first
    wav_bytes = _to_wav_bytes(audio_bytes)
    audio_buffer = io.BytesIO(wav_bytes)
    try:
        y, sr = librosa.load(audio_buffer, sr=sample_rate, mono=True)
    except Exception:
        # Fallback: try without resampling
        audio_buffer.seek(0)
        y, sr = librosa.load(audio_buffer, sr=None, mono=True)
        if sr != sample_rate:
            y = librosa.resample(y, orig_sr=sr, target_sr=sample_rate)
            sr = sample_rate

    # Trim silence from start/end
    y, _ = librosa.effects.trim(y, top_db=20)

    if len(y) < sr * 0.5:   # Less than 0.5 s after trim
        raise ValueError("Recording too short after silence removal. Please speak for at least 5 seconds.")

    duration = librosa.get_duration(y=y, sr=sr)
    features = {}

    # ── MFCC (13 coefficients) ────────────────────────────────────────────────
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13, n_fft=2048, hop_length=512)
    features['mfcc'] = np.mean(mfcc, axis=1).tolist()

    # ── Pitch / F0 ────────────────────────────────────────────────────────────
    f0, voiced_flag, _ = librosa.pyin(
        y,
        fmin=librosa.note_to_hz('C2'),   # ~65 Hz
        fmax=librosa.note_to_hz('C7'),   # ~2093 Hz
        sr=sr
    )
    f0_voiced = f0[~np.isnan(f0) & voiced_flag]
    if len(f0_voiced) > 1:
        features['pitch_mean'] = float(np.mean(f0_voiced))
        features['pitch_std']  = float(np.std(f0_voiced))
    else:
        features['pitch_mean'] = 0.0
        features['pitch_std']  = 0.0

    # ── Jitter (local, %) — cycle-to-cycle pitch period variation ────────────
    if len(f0_voiced) > 2:
        periods   = 1.0 / (f0_voiced + 1e-10)
        abs_diffs = np.abs(np.diff(periods))
        jitter    = float(np.mean(abs_diffs) / np.mean(periods) * 100)
        features['jitter'] = round(min(jitter, 30.0), 4)
    else:
        features['jitter'] = 0.0

    # ── Shimmer (local, %) — amplitude variation ──────────────────────────────
    rms_frames = librosa.feature.rms(y=y, frame_length=2048, hop_length=512)[0]
    rms_frames = rms_frames[rms_frames > 1e-6]   # voiced frames only
    if len(rms_frames) > 2:
        amp_diffs = np.abs(np.diff(rms_frames))
        shimmer   = float(np.mean(amp_diffs) / (np.mean(rms_frames) + 1e-10) * 100)
        features['shimmer'] = round(min(shimmer, 30.0), 4)
    else:
        features['shimmer'] = 0.0

    # ── Harmonic-to-Noise Ratio (HNR) ────────────────────────────────────────
    harmonic, percussive = librosa.effects.hpss(y, margin=4.0)
    h_power = np.sum(harmonic ** 2)
    p_power = np.sum(percussive ** 2)
    if p_power > 1e-12:
        hnr = float(10 * np.log10(h_power / p_power))
    else:
        hnr = 30.0
    features['hnr'] = round(float(np.clip(hnr, -10, 40)), 3)

    # ── Zero Crossing Rate ────────────────────────────────────────────────────
    zcr = librosa.feature.zero_crossing_rate(y, frame_length=2048, hop_length=512)
    features['zero_crossing_rate'] = round(float(np.mean(zcr)), 5)

    # ── Spectral features ─────────────────────────────────────────────────────
    spec_centroid   = librosa.feature.spectral_centroid(y=y, sr=sr, n_fft=2048, hop_length=512)
    spec_bandwidth  = librosa.feature.spectral_bandwidth(y=y, sr=sr, n_fft=2048, hop_length=512)
    features['spectral_centroid']  = round(float(np.mean(spec_centroid)), 2)
    features['spectral_bandwidth'] = round(float(np.mean(spec_bandwidth)), 2)

    # ── RMS Energy ────────────────────────────────────────────────────────────
    features['rms_energy'] = round(float(np.mean(rms_frames)), 5)

    return {
        'features': features,
        'duration': round(float(duration), 2),
        'sample_rate': int(sr)
    }


def normalize_voice_features(features: Dict[str, Any]) -> np.ndarray:
    """Convert features dict → fixed-length numpy array (22 elements)."""
    base = [
        features.get('jitter', 0.0),
        features.get('shimmer', 0.0),
        features.get('pitch_mean', 0.0),
        features.get('pitch_std', 0.0),
        features.get('hnr', 0.0),
        features.get('zero_crossing_rate', 0.0),
        features.get('spectral_centroid', 0.0),
        features.get('spectral_bandwidth', 0.0),
        features.get('rms_energy', 0.0),
    ]
    mfcc = features.get('mfcc', [0.0] * 13)
    if len(mfcc) < 13:
        mfcc = mfcc + [0.0] * (13 - len(mfcc))
    return np.array(base + list(mfcc[:13]), dtype=np.float64)
