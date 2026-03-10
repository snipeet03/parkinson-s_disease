import numpy as np
from typing import List, Dict, Any


def extract_typing_features(keystrokes, target_text: str, typed_text: str) -> Dict[str, Any]:
    """
    Extract keystroke dynamics features for Parkinson's motor biomarker analysis.
    Implements the feature set from Giancardo et al. 2016 and Kumar et al. 2023.
    """
    if len(keystrokes) < 5:
        return _default_typing_features()

    press_times   = np.array([k.press_time for k in keystrokes], dtype=np.float64)
    release_times = np.array([k.release_time for k in keystrokes], dtype=np.float64)
    keys          = [k.key for k in keystrokes]

    # ── Dwell time (key hold duration = release - press) ─────────────────────
    dwell_times = release_times - press_times
    dwell_times = dwell_times[(dwell_times > 0) & (dwell_times < 2000)]   # 0–2000 ms valid
    mean_dwell  = float(np.mean(dwell_times)) if len(dwell_times) > 0 else 0.0
    std_dwell   = float(np.std(dwell_times))  if len(dwell_times) > 1 else 0.0

    # ── Flight time (time between key release[i] and press[i+1]) ─────────────
    flights = []
    for i in range(len(press_times) - 1):
        ft = press_times[i + 1] - release_times[i]
        if 0 < ft < 3000:    # Ignore pauses > 3 s (likely intentional)
            flights.append(ft)
    flights     = np.array(flights) if flights else np.array([0.0])
    mean_flight = float(np.mean(flights))
    std_flight  = float(np.std(flights)) if len(flights) > 1 else 0.0

    # ── Typing speed ──────────────────────────────────────────────────────────
    total_ms = float(press_times[-1] - press_times[0]) if len(press_times) > 1 else 0.0
    if total_ms > 0:
        cpm = len(keys) / (total_ms / 1000.0 / 60.0)
        wpm = cpm / 5.0
    else:
        cpm, wpm = 0.0, 0.0

    # ── Error metrics ─────────────────────────────────────────────────────────
    backspace_count = sum(1 for k in keys if k in ('Backspace', 'Delete'))
    total_keys      = len(keys)
    backspace_rate  = backspace_count / total_keys if total_keys > 0 else 0.0
    edit_dist       = _levenshtein(typed_text, target_text)
    error_rate      = edit_dist / max(len(target_text), 1)

    # ── Pause analysis ────────────────────────────────────────────────────────
    pause_threshold = 500    # ms
    pause_count     = int(np.sum(flights > pause_threshold)) if len(flights) > 0 else 0

    # ── Rhythm consistency (1 - CoV of inter-key intervals) ──────────────────
    inter_key = np.diff(press_times)
    inter_key = inter_key[inter_key < 3000]   # exclude long pauses
    if len(inter_key) > 1 and np.mean(inter_key) > 0:
        cov              = np.std(inter_key) / np.mean(inter_key)
        rhythm_consistency = float(np.clip(1.0 - cov / 2.0, 0.0, 1.0))
    else:
        rhythm_consistency = 0.5

    return {
        'mean_dwell_time':    round(mean_dwell, 2),
        'std_dwell_time':     round(std_dwell, 2),
        'mean_flight_time':   round(mean_flight, 2),
        'std_flight_time':    round(std_flight, 2),
        'typing_speed_wpm':   round(float(wpm), 1),
        'typing_speed_cpm':   round(float(cpm), 1),
        'error_rate':         round(float(error_rate), 4),
        'backspace_rate':     round(float(backspace_rate), 4),
        'pause_count':        pause_count,
        'rhythm_consistency': round(rhythm_consistency, 4),
    }


def _levenshtein(s1: str, s2: str) -> int:
    if abs(len(s1) - len(s2)) > 50:
        return abs(len(s1) - len(s2))   # Fast-path for very different lengths
    m, n = len(s1), len(s2)
    row = list(range(n + 1))
    for i in range(1, m + 1):
        prev, row[0] = row[0], i
        for j in range(1, n + 1):
            prev, row[j] = row[j], prev if s1[i-1] == s2[j-1] else 1 + min(prev, row[j], row[j-1])
    return row[n]


def _default_typing_features() -> Dict[str, Any]:
    return {k: 0.0 for k in [
        'mean_dwell_time', 'std_dwell_time', 'mean_flight_time', 'std_flight_time',
        'typing_speed_wpm', 'typing_speed_cpm', 'error_rate', 'backspace_rate',
        'pause_count', 'rhythm_consistency'
    ]}


def normalize_typing_features(features: Dict[str, Any]) -> np.ndarray:
    """Convert features dict → fixed-length numpy array (9 elements)."""
    return np.array([
        features.get('mean_dwell_time', 0.0),
        features.get('std_dwell_time', 0.0),
        features.get('mean_flight_time', 0.0),
        features.get('std_flight_time', 0.0),
        features.get('typing_speed_wpm', 0.0),
        features.get('error_rate', 0.0),
        features.get('backspace_rate', 0.0),
        features.get('pause_count', 0.0),
        features.get('rhythm_consistency', 0.0),
    ], dtype=np.float64)
