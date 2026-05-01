import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './pages/Dashboard';
import { ReplayWorkspace } from './pages/ReplayWorkspace';
import { ChallengeWorkspace } from './pages/ChallengeWorkspace';
import { TradeHistory } from './pages/TradeHistory';
import { Analytics } from './pages/Analytics';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-bg text-ink overflow-hidden font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 overflow-auto bg-bg">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/replay" element={<ReplayWorkspace />} />
              <Route path="/challenge" element={<ChallengeWorkspace />} />
              <Route path="/history" element={<TradeHistory />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
