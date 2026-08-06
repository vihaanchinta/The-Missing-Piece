import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Puzzle, Search, BookOpen, Sparkles } from 'lucide-react';
import BasketballScene from '@/components/basketball/Basketball3D';
import { TeamList, RightPanel, NavRing, TeamsModal, MethodModal, AnalyzeModal } from '@/components/Panels';
import { nbaTeams, getWeaknesses, refreshTeamLive } from '@/data/nbaTeams';
import { base44 } from '@/api/base44Client';

const VIEWS = ['identity', 'weakness', 'targets', 'fit', 'missing'];

export default function Home() {
  const [selectedTeam, setSelectedTeam] = useState('BOS');
  const [view, setView] = useState('identity');
  const [showTeams, setShowTeams] = useState(false);
  const [showMethod, setShowMethod] = useState(false);
  const [showAnalyze, setShowAnalyze] = useState(false);
  const [branches, setBranches] = useState(true);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [liveOverrides, setLiveOverrides] = useState({});
  const [liveLoading, setLiveLoading] = useState(false);

  const baseTeam = nbaTeams.find((t) => t.abbr === selectedTeam) ?? nbaTeams[0];
  const team = liveOverrides[selectedTeam] ?? baseTeam;

  const refreshLive = async (abbr) => {
    setLiveLoading(true);
    try {
      const live = await refreshTeamLive(abbr);
      setLiveOverrides((prev) => ({ ...prev, [abbr]: live }));
    } catch (e) { /* keep snapshot on failure */ }
    setLiveLoading(false);
  };

  // pull the most-current public stats once per session for the landing team
  useEffect(() => {
    if (sessionStorage.getItem('mp_live_loaded')) return;
    sessionStorage.setItem('mp_live_loaded', '1');
    refreshLive(selectedTeam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runAnalyze = async () => {
    setShowAnalyze(true);
    if (analysis && analysis.startsWith(`${team.abbr}:`)) return;
    setLoading(true); setAnalysis('');
    try {
      const w = getWeaknesses(team);
      const prompt = `You are an NBA roster analyst for the "Missing Piece" platform. Analyze the ${team.city} ${team.name} (${team.abbr}).
Identity scores (0-100): ${JSON.stringify(team.identity)}.
Team stats: ${JSON.stringify(team.stats)}.
Starting five: ${team.roster.map((p) => `${p.name} (${p.pos}) ${p.ppg}ppg`).join(', ')}.
Biggest weaknesses: ${w.map((x) => x.key).join(', ')}.
Recommended archetype: ${team.missingPiece.archetype}.

Write 6 short bullet points: (1) what this team does well, (2) the main weakness, (3) why a ${team.missingPiece.archetype} is the missing piece, (4-5) two realistic target players and why, (6) the risk of the fit. Be concise and specific.`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt });
      setAnalysis((typeof res === 'string' ? res : JSON.stringify(res)));
    } catch (e) {
      setAnalysis('Analysis unavailable right now: ' + (e?.message || 'unknown error'));
    }
    setLoading(false);
  };

  const handleChip = (key) => setView('identity');

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative font-ui">
      {/* grid + glow */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-primary/8 blur-[150px]" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-white/[0.02] blur-[120px]" />
      </div>

      {/* HEADER — every button wired */}
      <header className="relative z-20 flex items-center justify-between px-6 md:px-14 py-5">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="flex items-center gap-3">
          <div className="relative w-9 h-9">
            <div className="absolute inset-0 rounded-full border border-primary/60 animate-ping opacity-30" />
            <div className="w-9 h-9 rounded-full border border-primary/80 bg-primary/10 flex items-center justify-center">
              <Puzzle className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div>
            <span className="font-ui text-lg font-bold tracking-[0.25em] text-white">MISSING</span>
            <span className="font-ui text-lg font-bold tracking-[0.25em] text-primary">PIECE</span>
          </div>
        </motion.div>

        <motion.nav initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="flex items-center gap-5">
          <button onClick={() => setShowTeams(true)} className="hidden md:flex items-center gap-1.5 text-sm font-ui tracking-[0.15em] uppercase text-white/50 hover:text-white transition">
            <Search className="w-3.5 h-3.5" /> Teams
          </button>
          <button onClick={() => setView('identity')} className="hidden md:block text-sm font-ui tracking-[0.15em] uppercase text-white/50 hover:text-white transition">Identity</button>
          <button onClick={() => setView('targets')} className="hidden md:block text-sm font-ui tracking-[0.15em] uppercase text-white/50 hover:text-white transition">Targets</button>
          <button onClick={() => setShowMethod(true)} className="hidden md:flex items-center gap-1.5 text-sm font-ui tracking-[0.15em] uppercase text-white/50 hover:text-white transition">
            <BookOpen className="w-3.5 h-3.5" /> Method
          </button>
          <button onClick={runAnalyze} className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-ui tracking-widest uppercase hover:bg-primary/80 transition-colors">
            <Sparkles className="w-3.5 h-3.5" /> Analyze
          </button>
        </motion.nav>
      </header>

      {/* MAIN — 3 columns */}
      <main className="relative z-10 flex items-center justify-center px-4 md:px-10" style={{ minHeight: 'calc(100vh - 88px)' }}>
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 items-start">

          <TeamList selected={selectedTeam} onSelect={setSelectedTeam} />

          {/* CENTER */}
          <div className="flex flex-col items-center gap-4">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="text-center">
              <p className="font-ui text-sm tracking-[0.5em] text-white/40 uppercase mb-1">Roster Analytics Platform</p>
              <h1 className="font-heading text-4xl md:text-5xl font-black tracking-tight leading-none">
                <span className="text-white">MISSING</span>{' '}
                <span className="text-primary" style={{ textShadow: '0 0 40px rgba(255,107,0,0.6), 0 0 80px rgba(255,107,0,0.3)' }}>PIECE</span>
              </h1>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-[320px] h-[320px] md:w-[400px] md:h-[400px] lg:w-[460px] lg:h-[460px]">
              <div className="absolute inset-[-10%] rounded-full border border-white/10 animate-spin" style={{ animationDuration: '20s' }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/70" />
              </div>
              <div className="absolute inset-[-20%] rounded-full border border-primary/10 animate-spin" style={{ animationDuration: '35s', animationDirection: 'reverse' }}>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary/70" />
              </div>

              <BasketballScene team={team} onChipClick={handleChip} expanded={branches} onToggle={() => setBranches((b) => !b)} />

              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-6 rounded-full pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(255,107,0,0.3) 0%, transparent 70%)' }} />
            </motion.div>

            <p className="text-center max-w-xs text-xs font-ui tracking-widest text-white/40 uppercase">Drag the ball · tap a stat chip · click the branches</p>
            <NavRing view={view} setView={setView} />
          </div>

          <RightPanel team={team} view={view} onRefresh={refreshLive} liveLoading={liveLoading} />
        </div>
      </main>

      <div className="absolute bottom-10 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), rgba(255,107,0,0.5), rgba(255,255,255,0.25), transparent)' }} />

      <TeamsModal open={showTeams} onClose={() => setShowTeams(false)} onSelect={setSelectedTeam} />
      <MethodModal open={showMethod} onClose={() => setShowMethod(false)} />
      <AnalyzeModal open={showAnalyze} onClose={() => setShowAnalyze(false)} team={team} loading={loading} analysis={analysis} />
    </div>
  );
}
