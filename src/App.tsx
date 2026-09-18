import { useEffect, useState } from 'react';
import { Dashboard } from './views/Dashboard';
import { Decisions } from './views/Decisions';
import { Roadmap } from './views/Roadmap';
import { Simulator } from './views/Simulator';
import { Capital } from './views/Capital';
import { Staffing } from './views/Staffing';
import { FounderRamp } from './views/FounderRamp';
import { Evidence } from './views/Evidence';
import { Assumptions } from './views/Assumptions';
import { Paths } from './views/Paths';
import { Automation } from './views/Automation';
import { Market } from './views/Market';
import { Unknowns } from './views/Unknowns';

const VIEWS = [
  { id: 'dashboard', label: 'Where we are' },
  { id: 'decisions', label: 'Decisions' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'paths', label: 'Paths' },
  { id: 'simulator', label: 'Simulator' },
  { id: 'economics', label: 'Economics' },
  { id: 'ramp', label: 'Founder Ramp' },
  { id: 'staffing', label: 'Staffing' },
  { id: 'capital', label: 'Capital & cash' },
  { id: 'automation', label: 'AI audit' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'assumptions', label: 'Assumptions' },
  { id: 'market', label: 'Market' },
  { id: 'unknowns', label: 'Unknowns' },
] as const;

type ViewId = (typeof VIEWS)[number]['id'];

function currentHash(): ViewId {
  const h = window.location.hash.replace('#', '');
  return (VIEWS.some((v) => v.id === h) ? h : 'dashboard') as ViewId;
}

export default function App() {
  const [view, setView] = useState<ViewId>(currentHash);

  // Hash routing keeps deep links working on GitHub Pages without a server.
  useEffect(() => {
    const onHash = () => setView(currentHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const go = (v: string) => {
    window.location.hash = v;
    setView(v as ViewId);
    window.scrollTo(0, 0);
  };

  return (
    <div className="app">
      <header className="hdr">
        <h1><span className="star">★</span> Blue Star Navigator</h1>
        <div className="sub">
          Blue Star In-Home Pediatrics · Colorado · Phase 0: Learn + Validate · Built 2026-09-17
        </div>
      </header>

      <main>
        {view === 'dashboard' && <Dashboard go={go} />}
        {view === 'decisions' && <Decisions />}
        {view === 'roadmap' && <Roadmap />}
        {view === 'paths' && <Paths />}
        {(view === 'simulator' || view === 'economics') && <Simulator />}
        {view === 'ramp' && <FounderRamp />}
        {view === 'staffing' && <Staffing />}
        {view === 'capital' && <Capital />}
        {view === 'automation' && <Automation />}
        {view === 'evidence' && <Evidence />}
        {view === 'assumptions' && <Assumptions />}
        {view === 'market' && <Market />}
        {view === 'unknowns' && <Unknowns />}
      </main>

      <nav>
        {VIEWS.map((v) => (
          <button key={v.id} aria-current={view === v.id} onClick={() => go(v.id)}>
            {v.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
