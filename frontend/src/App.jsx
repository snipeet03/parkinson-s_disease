import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Landing from './pages/Landing'
import VoiceAnalysis from './pages/VoiceAnalysis'
import TypingTest from './pages/TypingTest'
import Dashboard from './pages/Dashboard'
import Navbar from './components/Navbar'

export default function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/voice" element={<VoiceAnalysis />} />
                <Route path="/typing" element={<TypingTest />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#1a1a1a',
                        color: '#e8e8e8',
                        border: '1px solid #2e2e2e',
                        borderRadius: '6px',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '13px',
                    },
                    success: { iconTheme: { primary: '#d4f53c', secondary: '#000' } },
                    error: { iconTheme: { primary: '#f87171', secondary: '#1a1a1a' } },
                }}
            />
        </BrowserRouter>
    )
}
