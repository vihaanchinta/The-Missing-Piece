import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Info, Sparkles, Target, Shield, Activity, TrendingUp, RefreshCw, ArrowUp } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { nbaTeams, getWeaknesses, getStrengths, getRosterIdentityScore, IDENTITY_AXES, computeImpact, leagueAverages } from '@/data/nbaTeams';

// ── Team logo with graceful fallback to a colored abbreviation badge ────────
// ── charts (recharts) ───────────────────────────────────────────────────────
const PIE_COLORS = ['#FF6B00','#00C4CF','#78BE20','#EF3B24','#FDB927','#9B59B6'];
const tooltipStyle = { background:'rgba(10,10,20,0.95)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:10, fontSize:12, color:'#fff' };

function IdentityRadar({ team }) {
  const data = IDENTITY_AXES.map((a) => ({ axis: a.label, value: team.identity[a.key] }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="rgba(255,255,255,0.12)" />
        <PolarAngleAxis dataKey="axis" tick={{ fill:'rgba(255,255,255,0.65)', fontSize:10 }} />
        <PolarRadiusAxis domain={[0,100]} tick={{ fill:'rgba(255,255,255,0.3)', fontSize:8 }} stroke="rgba(255,255,255,0.1)" />
        <Radar dataKey="value" stroke={team.color} fill={team.color} fillOpacity={0.45} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
function RosterPie({ team }) {
  const counts = {};
  [...team.roster, ...(team.bench || [])].forEach((p) => { counts[p.pos] = (counts[p.pos] || 0) + 1; });
  const data = Object.entries(counts).map(([name, value]) => ({ name, value }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={36} paddingAngle={3} label>
          {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize:11, color:'#fff' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
function StatBars({ team }) {
  const data = [
    { stat:'PPG', team:team.stats.ppg, league:leagueAverages.ppg },
    { stat:'OPPG', team:team.stats.oppg, league:leagueAverages.oppg },
    { stat:'Pace', team:team.stats.pace, league:leagueAverages.pace },
    { stat:'OffRtg', team:team.stats.offRtg, league:leagueAverages.offRtg },
    { stat:'DefRtg', team:team.stats.defRtg, league:leagueAverages.defRtg },
    { stat:'NetRtg', team:team.stats.netRtg, league:leagueAverages.netRtg },
    { stat:'eFG%', team:team.stats.efg, league:leagueAverages.efg },
    { stat:'3P%', team:team.stats.threePct, league:leagueAverages.threePct },
  ];
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left:8, right:16, top:8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
        <XAxis type="number" tick={{ fill:'rgba(255,255,255,0.4)', fontSize:10 }} />
        <YAxis type="category" dataKey="stat" tick={{ fill:'rgba(255,255,255,0.65)', fontSize:11 }} width={56} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill:'rgba(255,255,255,0.04)' }} />
        <Legend wrapperStyle={{ fontSize:11 }} />
        <Bar dataKey="team" name="Team" fill={team.color} radius={[0,4,4,0]} />
        <Bar dataKey="league" name="League Avg" fill="rgba(255,255,255,0.22)" radius={[0,4,4,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
function RosterScoring({ team }) {
  const data = team.roster.map((p) => ({ name:p.name.split(' ').slice(-1)[0], ppg:p.ppg }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ left:8, right:8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="name" tick={{ fill:'rgba(255,255,255,0.65)', fontSize:11 }} />
        <YAxis tick={{ fill:'rgba(255,255,255,0.4)', fontSize:10 }} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill:'rgba(255,255,255,0.04)' }} />
        <Bar dataKey="ppg" fill={team.secondary} radius={[4,4,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Total Impact Value panel ────────────────────────────────────────────────
function ImpactPanel({ team }) {
  const imp = computeImpact(team);
  return (
    <motion.div key={team.abbr} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }} className="flex flex-col gap-3">
      <div className="rounded-xl border p-4" style={{ borderColor:team.color+'55', background:team.color+'11' }}>
        <p className="font-ui text-[10px] tracking-[0.3em] uppercase text-white/50">Total Impact Value</p>
        <div className="flex items-end gap-2 mt-1">
          <span className="font-heading text-4xl font-black" style={{ color:team.color, textShadow:`0 0 24px ${team.color}55` }}>+{imp.delta}</span>
          <span className="font-ui text-sm text-white/50 mb-1">ID points</span>
          <div className="ml-auto flex flex-col items-end">
            <span className="font-heading text-2xl font-black text-white">{imp.projectedScore}</span>
            <span className="font-ui text-[10px] text-white/40">projected ID</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs font-ui">
          <span className="text-white/50">From</span><span className="text-white/70 font-semibold">{imp.currentScore}</span>
          <ArrowUp className="w-3 h-3 text-green-400" /><span className="text-green-400 font-bold">+{imp.delta}</span>
          <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background:team.color+'22', color:team.color }}>Grade {imp.grade}</span>
        </div>
      </div>
      <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3.5">
        <p className="font-ui text-xs tracking-[0.3em] uppercase text-white/50 mb-2">Recommended Acquisition</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background:team.color+'22', border:`1px solid ${team.color}55` }}>
            <Sparkles className="w-5 h-5" style={{ color:team.color }} />
          </div>
          <div className="flex-1"><p className="font-heading text-base font-bold text-white">{imp.archetype}</p><p className="font-ui text-xs text-white/50">{imp.target}</p></div>
          <div className="text-right"><p className="font-heading text-xl font-black text-primary">{imp.fit}%</p><p className="font-ui text-[9px] text-white/40 uppercase tracking-widest">Fit</p></div>
        </div>
      </div>
      <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3.5">
        <p className="font-ui text-xs tracking-[0.3em] uppercase text-white/50 mb-3">Projected Identity Lift</p>
        {IDENTITY_AXES.map((a) => {
          const cur = team.identity[a.key]; const proj = imp.projected[a.key]; const lifted = proj > cur;
          return (
            <div key={a.key} className="mb-2.5">
              <div className="flex justify-between text-xs font-ui mb-1">
                <span className="text-white/70 capitalize">{a.label}</span>
                <span className={lifted ? 'text-green-400 font-bold' : 'text-white/50'}>{cur}{lifted && <span> → {proj}</span>}</span>
              </div>
              <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="absolute h-full rounded-full bg-white/15" style={{ width:`${cur}%` }} />
                <motion.div initial={{ width:`${cur}%` }} animate={{ width:`${proj}%` }} transition={{ duration:0.7 }} className="absolute h-full rounded-full" style={{ background:team.color }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3.5">
        <p className="font-ui text-sm text-white/75 leading-relaxed">
          Adding a <span className="font-semibold" style={{ color:team.color }}>{imp.archetype}</span> ({imp.target}) at <span className="text-primary font-bold">{imp.fit}%</span> fit directly targets the {imp.weak.map((w) => w.key).join(' & ')} gaps, lifting the roster's overall identity from <span className="text-white font-bold">{imp.currentScore}</span> to <span className="text-white font-bold">{imp.projectedScore}</span> (<span className="text-green-400 font-bold">+{imp.delta}</span>).
        </p>
      </div>
    </motion.div>
  );
}

export function TeamLogo({ team, size = 40, className = '' }) {
  const [err, setErr] = useState(false);
  if (!team || err) {
    return (
      <div
        className={`rounded-lg flex items-center justify-center font-heading font-bold ${className}`}
        style={{ width: size, height: size, background: team ? team.color + '22' : '#222', color: team ? team.color : '#fff', border: `1px solid ${team ? team.color : '#444'}55`, fontSize: size * 0.28 }}
      >
        {team ? team.abbr : '?'}
      </div>
    );
  }
  return (
    <img
      src={team.logo} alt={`${team.name} logo`}
      onError={() => setErr(true)}
      style={{ width: size, height: size, objectFit: 'contain' }}
      className={className}
    />
  );
}

// ── Left panel: searchable, conference-grouped team list with logos ─────────
export function TeamList({ selected, onSelect }) {
  const [q, setQ] = useState('');
  const filtered = useMemo(
    () => nbaTeams.filter((t) =>
      `${t.city} ${t.name} ${t.abbr}`.toLowerCase().includes(q.toLowerCase())),
    [q],
  );
  const east = filtered.filter((t) => t.conf === 'East');
  const west = filtered.filter((t) => t.conf === 'West');

  const group = (label, teams) => (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-1.5 px-1">
        <span className="font-ui text-[10px] tracking-[0.4em] uppercase text-white/40">{label}</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>
      <div className="flex flex-col gap-1.5">
        {teams.map((t) => {
          const score = getRosterIdentityScore(t);
          const active = selected === t.abbr;
          return (
            <button key={t.abbr} onClick={() => onSelect(t.abbr)}
              className={`group flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg border transition-all duration-200 ${
                active ? 'border-primary/60 bg-primary/15' : 'border-white/8 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'}`}>
              <TeamLogo team={t} size={30} />
              <div className="flex-1 min-w-0 text-left">
                <p className={`text-sm font-ui font-semibold truncate ${active ? 'text-white' : 'text-white/80'}`}>{t.name}</p>
                <p className="text-[10px] font-ui tracking-widest text-white/40 uppercase">{t.city} · {t.record}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-ui font-black ${active ? 'text-primary' : 'text-white/70'}`}>{score}</p>
                <p className="text-[8px] font-ui tracking-widest text-white/30 uppercase">ID</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}
      className="hidden lg:flex flex-col w-full max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-px flex-1 bg-gradient-to-r from-white/25 to-transparent" />
        <span className="font-ui text-xs tracking-[0.4em] uppercase text-white/55">NBA Teams</span>
        <div className="h-px flex-1 bg-gradient-to-l from-white/25 to-transparent" />
      </div>
      <div className="relative mb-2">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search teams…"
          className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm font-ui text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50" />
      </div>
      <div className="flex flex-col max-h-[calc(100vh-260px)] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
        {group('Eastern Conference', east)}
        {group('Western Conference', west)}
      </div>
    </motion.div>
  );
}

// ── Bottom navigation ring (drives the right-panel view) ─────────────────────
const NAV_ITEMS = [
  { key: 'identity', label: 'Identity', icon: Activity },
  { key: 'weakness', label: 'Weakness', icon: Shield },
  { key: 'targets',  label: 'Targets',  icon: Target },
  { key: 'fit',      label: 'Fit',      icon: Sparkles },
  { key: 'missing',  label: 'Missing',  icon: Info },
  { key: 'impact',   label: 'Impact',   icon: TrendingUp },
];
export function NavRing({ view, setView }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.6 }}
      className="flex items-center gap-1.5 p-1.5 rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-md">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = view === item.key;
        return (
          <button key={item.key} onClick={() => setView(item.key)}
            className={`relative flex flex-col items-center gap-1 px-3.5 py-2 rounded-xl transition-all duration-300 ${
              active ? 'bg-primary/15 border border-primary/40' : 'hover:bg-white/5 border border-transparent'}`}>
            <Icon className="w-4 h-4" style={{ color: active ? '#FF6B00' : '#888' }} />
            <span className="text-xs font-ui tracking-[0.18em] uppercase" style={{ color: active ? '#FF6B00' : '#666' }}>{item.label}</span>
          </button>
        );
      })}
    </motion.div>
  );
}

// ── Right intelligence panel (switches content by `view`) ──────────────────
function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] backdrop-blur-sm p-3.5">
      <h4 className="font-ui text-xs tracking-[0.3em] uppercase text-white/50 mb-2.5">{title}</h4>
      {children}
    </div>
  );
}

function IdentityBar({ label, value, color }) {
  return (
    <div className="mb-2">
      <div className="flex justify-between mb-1">
        <span className="font-ui text-xs text-white/70 capitalize">{label}</span>
        <span className="font-ui text-xs font-bold text-white">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.7 }}
          className="h-full rounded-full" style={{ background: color }} />
      </div>
    </div>
  );
}

export function RightPanel({ team, view, onRefresh, liveLoading }) {
  const score = getRosterIdentityScore(team);
  const weaknesses = getWeaknesses(team);
  const strengths = getStrengths(team);

  return (
    <motion.div key={view + team.abbr} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
      className="w-full max-w-md flex flex-col gap-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>

      {/* header */}
      <div className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.04]">
        <TeamLogo team={team} size={48} />
        <div className="flex-1">
          <p className="font-heading text-lg font-bold text-white leading-none">{team.city} {team.name}</p>
          <p className="font-ui text-xs text-white/50 mt-1">{team.division} · {team.conf} · #{team.rank} seed · {team.record}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <button onClick={() => onRefresh?.(team.abbr)} disabled={liveLoading}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/15 bg-white/[0.04] text-[10px] font-ui tracking-widest uppercase text-white/60 hover:text-white hover:border-primary/50 transition disabled:opacity-50">
            {liveLoading
              ? <span className="w-2.5 h-2.5 border border-primary/40 border-t-primary rounded-full animate-spin" />
              : <RefreshCw className="w-3 h-3" />}
            {team._live ? 'Live' : 'Refresh'}
          </button>
          <div className="text-right">
            <p className="font-heading text-2xl font-black text-primary" style={{ textShadow: '0 0 18px rgba(255,107,0,0.4)' }}>{score}</p>
            <p className="font-ui text-[9px] tracking-widest text-white/40 uppercase">ID Score</p>
          </div>
        </div>
      </div>

      {view === 'identity' && (
        <>
          <Section title="Roster Identity Radar">
            <IdentityRadar team={team} />
          </Section>
          <Section title="Identity Breakdown">
            {IDENTITY_AXES.map((a) => (
              <IdentityBar key={a.key} label={a.label} value={team.identity[a.key]} color={team.color} />
            ))}
          </Section>
          <Section title="Team Stats vs League">
            <StatBars team={team} />
          </Section>
        </>
      )}

      {view === 'weakness' && (
        <>
          <Section title="Primary Weaknesses">
            {weaknesses.map((w) => (
              <div key={w.key} className="mb-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-ui text-sm font-semibold text-white capitalize">{w.key}</p>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mt-1">
                    <div className="h-full rounded-full bg-red-500" style={{ width: `${w.value}%` }} />
                  </div>
                </div>
                <span className="font-heading text-xl font-black text-red-400">{w.value}</span>
              </div>
            ))}
          </Section>
          <Section title="Top Strengths">
            {strengths.map((s) => (
              <div key={s.key} className="mb-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-ui text-sm font-semibold text-white capitalize">{s.key}</p>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mt-1">
                    <div className="h-full rounded-full" style={{ background: team.color, width: `${s.value}%` }} />
                  </div>
                </div>
                <span className="font-heading text-xl font-black text-green-400">{s.value}</span>
              </div>
            ))}
          </Section>
          <Section title="Stats vs League Avg">
            <StatBars team={team} />
          </Section>
        </>
      )}

      {view === 'targets' && (
        <>
          <Section title="Missing Piece Archetype">
            <div className="flex items-center justify-between mb-3">
              <p className="font-heading text-lg font-bold" style={{ color: team.color }}>{team.missingPiece.archetype}</p>
              <div className="text-right">
                <p className="font-heading text-2xl font-black text-primary">{team.missingPiece.fit}</p>
                <p className="font-ui text-[9px] tracking-widest text-white/40 uppercase">Fit %</p>
              </div>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${team.missingPiece.fit}%` }} transition={{ duration: 0.8 }}
                className="h-full rounded-full" style={{ background: team.color }} />
            </div>
          </Section>
          <Section title="Realistic Target Players">
            {team.missingPiece.examples.map((p) => (
              <div key={p} className="flex items-center gap-3 p-2.5 rounded-lg border border-white/8 bg-white/[0.02] mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: team.color + '22', border: `1px solid ${team.color}55` }}>
                  <Target className="w-3.5 h-3.5" style={{ color: team.color }} />
                </div>
                <span className="font-ui text-sm text-white">{p}</span>
              </div>
            ))}
          </Section>
          <Section title="Roster Scoring Distribution">
            <RosterScoring team={team} />
          </Section>
        </>
      )}

      {view === 'fit' && (
        <>
          <Section title="Identity vs Ideal Roster">
            <IdentityRadar team={team} />
          </Section>
          <Section title="Roster Composition">
            <RosterPie team={team} />
          </Section>
          <Section title="Bench Rotation">
            <div className="grid grid-cols-1 gap-1.5">
              {(team.bench || []).map((p) => (
                <div key={p.name} className="flex items-center gap-2 text-sm font-ui">
                  <span className="w-8 text-[10px] tracking-widest text-white/40 uppercase">{p.pos}</span>
                  <span className="flex-1 text-white/80 truncate">{p.name}</span>
                  <span className="text-white/50">{p.ppg} PPG</span>
                </div>
              ))}
            </div>
          </Section>
          <Section title="Roster Scoring">
            <RosterScoring team={team} />
          </Section>
          <Section title="Fit Analysis">
            <p className="font-ui text-sm text-white/75 leading-relaxed">
              The <span className="font-semibold" style={{ color: team.color }}>{team.name}</span> profile leans on
              {' '}{strengths.map((s) => s.key).join(' & ')}. The biggest gap is
              {' '}<span className="text-red-400 font-semibold">{weaknesses[0].key}</span>, making a
              {' '}<span className="font-semibold text-primary">{team.missingPiece.archetype}</span> the ideal
              acquisition at a <span className="text-primary font-bold">{team.missingPiece.fit}%</span> fit.
            </p>
          </Section>
        </>
      )}

      {view === 'missing' && (
        <>
          <Section title="The Missing Piece">
            <div className="text-center py-3">
              <p className="font-heading text-3xl font-black" style={{ color: team.color, textShadow: `0 0 24px ${team.color}55` }}>
                {team.missingPiece.archetype}
              </p>
              <p className="font-ui text-xs tracking-widest text-white/40 uppercase mt-2">Recommended Acquisition</p>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-3">
              <motion.div initial={{ width: 0 }} animate={{ width: `${team.missingPiece.fit}%` }} transition={{ duration: 0.8 }}
                className="h-full rounded-full" style={{ background: team.color }} />
            </div>
            <p className="font-ui text-xs text-white/50 text-center">Fit Score: {team.missingPiece.fit}%</p>
          </Section>
          <Section title="Target Players">
            {team.missingPiece.examples.map((p) => (
              <div key={p} className="flex items-center gap-3 p-2.5 rounded-lg border border-white/8 bg-white/[0.02] mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-ui text-sm text-white">{p}</span>
              </div>
            ))}
          </Section>
          <Section title="Why This Fit">
            <p className="font-ui text-sm text-white/75 leading-relaxed">
              Adding a <span className="font-semibold" style={{ color: team.color }}>{team.missingPiece.archetype}</span> directly
              addresses the {weaknesses.map((w) => w.key).join(' & ')} gaps without compromising the
              {' '}{strengths.map((s) => s.key).join(' & ')} that define this roster.
            </p>
          </Section>
        </>
      )}

      {view === 'impact' && <ImpactPanel team={team} />}
    </motion.div>
  );
}

// ── Modals ──────────────────────────────────────────────────────────────────
function Modal({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-card p-5 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white transition"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

export function TeamsModal({ open, onClose, onSelect }) {
  return (
    <Modal open={open} onClose={onClose} title="Select a Team">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {nbaTeams.map((t) => (
          <button key={t.abbr} onClick={() => { onSelect(t.abbr); onClose(); }}
            className="flex items-center gap-2 p-2 rounded-lg border border-white/8 bg-white/[0.03] hover:border-primary/50 hover:bg-primary/10 transition">
            <TeamLogo team={t} size={32} />
            <div className="text-left min-w-0">
              <p className="font-ui text-sm text-white truncate">{t.name}</p>
              <p className="font-ui text-[10px] text-white/40">{t.abbr}</p>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
}

export function MethodModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Methodology">
      <div className="space-y-3 font-ui text-sm text-white/75 leading-relaxed">
        <p><span className="text-primary font-semibold">Roster Identity</span> scores each team 0–100 across six axes: scoring, playmaking, rebounding, defense, spacing and depth — derived from team season totals and rotation strength.</p>
        <p><span className="text-primary font-semibold">Missing Piece</span> identifies the two lowest axes and recommends the player archetype that best fills the largest gap, plus realistic trade/free-agent targets and a fit score.</p>
        <p><span className="text-primary font-semibold">Fit Analysis</span> compares the roster's identity radar to an ideal complementary profile so you can see exactly where the gap sits.</p>
        <p className="text-white/50 text-xs">Data is a representative season snapshot. Live NBA stats can be wired in via the balldontlie API (free key) — see the chat for setup.</p>
      </div>
    </Modal>
  );
}

export function AnalyzeModal({ open, onClose, team, loading, analysis }) {
  return (
    <Modal open={open} onClose={onClose} title={`AI Analysis · ${team?.city} ${team?.name}`}>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="font-ui text-sm text-white/50">Running roster analysis…</p>
        </div>
      ) : (
        <div className="font-ui text-sm text-white/80 leading-relaxed whitespace-pre-line">{analysis}</div>
      )}
    </Modal>
  );
}
