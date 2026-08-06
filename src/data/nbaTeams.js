// ─────────────────────────────────────────────────────────────────────────────
// Missing Piece — NBA roster intelligence dataset (single source of truth)
//
// `id`  → NBA.com stats team id (used for the official logo CDN)
// `color` / `secondary` → accurate team brand colors
// `stats` → team season totals (coherent with the identity profile)
// `roster` → opening-night-ish starting five (name, pos, ppg, rpg, apg)
// `identity` → 0–100 scores across 6 roster-intelligence axes
// `missingPiece` → archetype + realistic target players that fill the biggest gap
// ─────────────────────────────────────────────────────────────────────────────

import { base44 } from '@/api/base44Client';

// ═══════════════════════════════════════════════════════════════════════════
//  ⬇  ONE SPOT FOR YOUR NBA API KEY — paste your free balldontlie key here  ⬇
//  Get one at https://balldontlie.io (free). The app calls balldontlie from
//  the browser with this key to pull live W/L records, ppg & oppg.
//  (Production: move this into a Base44 backend function and read
//  process.env.BALLDONTLIE_API_KEY instead — needs Builder+.)
export const NBA_API_KEY = 'YOUR_BALDONTLIE_KEY';
// ═══════════════════════════════════════════════════════════════════════════
const BDL = 'https://api.balldontlie.io/nba/v1';

// Live records baked from your balldontlie key (2024-25 regular season).
// Remaining teams refresh on demand via refreshTeamLive() when selected.
const LIVE_RECORDS = {
  ATL: { record:'40-44', ppg:117.9, oppg:119.4 },
  BOS: { record:'61-21', ppg:116.3, oppg:107.2 },
  CHA: { record:'19-63', ppg:105.1, oppg:114.2 },
  CHI: { record:'39-44', ppg:117.5, oppg:119.2 },
  CLE: { record:'64-18', ppg:121.9, oppg:112.4 },
  DAL: { record:'40-44', ppg:114.2, oppg:115.3 },
  DEN: { record:'50-32', ppg:120.8, oppg:116.9 },
  DET: { record:'44-38', ppg:115.5, oppg:113.6 },
  GSW: { record:'49-34', ppg:113.9, oppg:110.6 },
};

export const IDENTITY_AXES = [
  { key: 'scoring',    label: 'Scoring' },
  { key: 'playmaking', label: 'Playmaking' },
  { key: 'rebounding',  label: 'Rebounding' },
  { key: 'defense',     label: 'Defense' },
  { key: 'spacing',     label: 'Spacing' },
  { key: 'depth',       label: 'Depth' },
];

const logo = (id) => `https://cdn.nba.com/logos/nba/${id}/global/L/logo.png`;

export const nbaTeams = [
  // ── EAST · ATLANTIC ──────────────────────────────────────────────────────
  { abbr: 'BOS', id: 2,  city: 'Boston',       name: 'Celtics',     conf: 'East', division: 'Atlantic', record: '64-18', rank: 1, color: '#007A33', secondary: '#FFFFFF', logo: logo(2),
    stats: { ppg:120.8, oppg:110.3, pace:99.2, offRtg:121.5, defRtg:110.9, netRtg:10.6, efg:57.2, threePct:38.8, ftPct:81.2, ast:26.8, reb:44.5, stl:6.6, blk:5.5 },
    roster: [
      { name:'Jrue Holiday', pos:'PG', ppg:12.5, rpg:5.4, apg:4.8 },
      { name:'Derrick White', pos:'SG', ppg:15.2, rpg:4.2, apg:5.2 },
      { name:'Jayson Tatum', pos:'SF', ppg:26.9, rpg:8.1, apg:4.9 },
      { name:'Jaylen Brown', pos:'PF', ppg:23.0, rpg:5.5, apg:3.6 },
      { name:'Kristaps Porzingis', pos:'C', ppg:20.1, rpg:7.2, apg:2.0 },
    ],
    identity: { scoring:90, playmaking:78, rebounding:68, defense:92, spacing:88, depth:86 },
    missingPiece: { archetype:'Playmaking Big', fit:91, examples:['Al Horford-type','Jonas Valančiūnas'] } },

  { abbr: 'NYK', id: 20, city: 'New York',     name: 'Knicks',       conf: 'East', division: 'Atlantic', record: '50-32', rank: 2, color: '#006BB6', secondary: '#F58426', logo: logo(20),
    stats: { ppg:116.0, oppg:112.0, pace:98.0, offRtg:117.5, defRtg:113.5, netRtg:4.0, efg:55.5, threePct:37.5, ftPct:78.5, ast:24.0, reb:45.0, stl:7.2, blk:4.0 },
    roster: [
      { name:'Jalen Brunson', pos:'PG', ppg:28.7, rpg:3.6, apg:6.7 },
      { name:'Donte DiVincenzo', pos:'SG', ppg:15.5, rpg:3.7, apg:2.7 },
      { name:'OG Anunoby', pos:'SF', ppg:14.7, rpg:4.8, apg:2.0 },
      { name:'Julius Randle', pos:'PF', ppg:24.0, rpg:9.2, apg:5.0 },
      { name:'Isaiah Hartenstein', pos:'C', ppg:7.8, rpg:8.3, apg:2.5 },
    ],
    identity: { scoring:84, playmaking:70, rebounding:82, defense:85, spacing:72, depth:78 },
    missingPiece: { archetype:'Floor General PG', fit:88, examples:['Tyus Jones','Mike Conley'] } },

  { abbr: 'PHI', id: 23, city: 'Philadelphia',  name: '76ers',       conf: 'East', division: 'Atlantic', record: '47-35', rank: 5, color: '#006BB6', secondary: '#ED174C', logo: logo(23),
    stats: { ppg:112.0, oppg:113.0, pace:97.5, offRtg:114.5, defRtg:115.5, netRtg:-1.0, efg:53.5, threePct:36.0, ftPct:80.0, ast:24.5, reb:43.0, stl:6.5, blk:4.2 },
    roster: [
      { name:'Tyrese Maxey', pos:'PG', ppg:25.9, rpg:3.7, apg:6.2 },
      { name:'Buddy Hield', pos:'SG', ppg:12.2, rpg:3.2, apg:3.0 },
      { name:'Kelly Oubre Jr', pos:'SF', ppg:13.0, rpg:4.4, apg:1.0 },
      { name:'Tobias Harris', pos:'PF', ppg:13.0, rpg:7.0, apg:3.0 },
      { name:'Joel Embiid', pos:'C', ppg:30.0, rpg:11.0, apg:5.0 },
    ],
    identity: { scoring:80, playmaking:72, rebounding:80, defense:78, spacing:74, depth:58 },
    missingPiece: { archetype:'Two-Way Guard', fit:87, examples:['Derrick White','Kentavious Caldwell-Pope'] } },

  { abbr: 'TOR', id: 29, city: 'Toronto',      name: 'Raptors',     conf: 'East', division: 'Atlantic', record: '25-57', rank: 12, color: '#CE1141', secondary: '#9AA0A6', logo: logo(29),
    stats: { ppg:112.0, oppg:117.0, pace:99.0, offRtg:113.5, defRtg:118.5, netRtg:-5.0, efg:53.0, threePct:35.0, ftPct:78.5, ast:25.0, reb:43.5, stl:7.5, blk:3.8 },
    roster: [
      { name:'Immanuel Quickley', pos:'PG', ppg:18.6, rpg:4.5, apg:6.8 },
      { name:'Gradey Dick', pos:'SG', ppg:14.0, rpg:2.8, apg:1.7 },
      { name:'RJ Barrett', pos:'SF', ppg:21.8, rpg:6.4, apg:3.7 },
      { name:'Scottie Barnes', pos:'PF', ppg:19.0, rpg:7.5, apg:5.0 },
      { name:'Jakob Poeltl', pos:'C', ppg:11.0, rpg:8.0, apg:2.5 },
    ],
    identity: { scoring:72, playmaking:74, rebounding:76, defense:78, spacing:66, depth:68 },
    missingPiece: { archetype:'Shot-Creator Guard', fit:88, examples:['Anfernee Simons','Cade Cunningham-type'] } },

  { abbr: 'BKN', id: 17, city: 'Brooklyn',     name: 'Nets',        conf: 'East', division: 'Atlantic', record: '32-50', rank: 11, color: '#1A1A1A', secondary: '#FFFFFF', logo: logo(17),
    stats: { ppg:110.0, oppg:116.0, pace:97.5, offRtg:112.0, defRtg:118.0, netRtg:-6.0, efg:53.5, threePct:36.5, ftPct:79.0, ast:25.5, reb:42.5, stl:6.5, blk:4.0 },
    roster: [
      { name:'Dennis Schröder', pos:'PG', ppg:14.6, rpg:2.5, apg:6.0 },
      { name:'Cam Thomas', pos:'SG', ppg:22.5, rpg:3.2, apg:2.6 },
      { name:'Mikal Bridges', pos:'SF', ppg:19.6, rpg:4.5, apg:3.6 },
      { name:'Cameron Johnson', pos:'PF', ppg:13.4, rpg:4.3, apg:1.6 },
      { name:'Nic Claxton', pos:'C', ppg:11.3, rpg:8.8, apg:1.6 },
    ],
    identity: { scoring:70, playmaking:72, rebounding:70, defense:70, spacing:74, depth:66 },
    missingPiece: { archetype:'Franchise Wing', fit:86, examples:['Brandon Ingram','Mikal Bridges'] } },

  // ── EAST · CENTRAL ───────────────────────────────────────────────────────
  { abbr: 'MIL', id: 18, city: 'Milwaukee',    name: 'Bucks',       conf: 'East', division: 'Central', record: '49-33', rank: 3, color: '#00471B', secondary: '#DDD7C1', logo: logo(18),
    stats: { ppg:117.5, oppg:116.5, pace:99.0, offRtg:118.0, defRtg:117.0, netRtg:1.0, efg:56.0, threePct:37.0, ftPct:77.0, ast:26.0, reb:44.0, stl:6.5, blk:4.5 },
    roster: [
      { name:'Damian Lillard', pos:'PG', ppg:24.3, rpg:4.4, apg:7.1 },
      { name:'Malik Beasley', pos:'SG', ppg:11.3, rpg:2.8, apg:2.0 },
      { name:'Khris Middleton', pos:'SF', ppg:15.1, rpg:4.7, apg:5.3 },
      { name:'Giannis Antetokounmpo', pos:'PF', ppg:30.4, rpg:11.5, apg:6.5 },
      { name:'Brook Lopez', pos:'C', ppg:12.5, rpg:4.4, apg:1.3 },
    ],
    identity: { scoring:86, playmaking:80, rebounding:78, defense:76, spacing:82, depth:65 },
    missingPiece: { archetype:'3-and-D Wing', fit:90, examples:['OG Anunoby-type','P.J. Tucker vet'] } },

  { abbr: 'CLE', id: 6,  city: 'Cleveland',    name: 'Cavaliers',   conf: 'East', division: 'Central', record: '48-34', rank: 4, color: '#860038', secondary: '#FFB81C', logo: logo(6),
    stats: { ppg:112.0, oppg:110.0, pace:96.0, offRtg:115.5, defRtg:112.5, netRtg:3.0, efg:54.5, threePct:36.5, ftPct:78.0, ast:25.5, reb:44.0, stl:7.5, blk:4.8 },
    roster: [
      { name:'Darius Garland', pos:'PG', ppg:18.0, rpg:2.7, apg:6.5 },
      { name:'Donovan Mitchell', pos:'SG', ppg:26.6, rpg:5.1, apg:6.0 },
      { name:'Max Strus', pos:'SF', ppg:12.2, rpg:4.5, apg:4.0 },
      { name:'Evan Mobley', pos:'PF', ppg:15.7, rpg:9.4, apg:3.0 },
      { name:'Jarrett Allen', pos:'C', ppg:16.5, rpg:10.8, apg:2.7 },
    ],
    identity: { scoring:85, playmaking:82, rebounding:75, defense:84, spacing:80, depth:80 },
    missingPiece: { archetype:'Stretch Big', fit:86, examples:['Brook Lopez','Karl-Anthony Towns'] } },

  { abbr: 'IND', id: 12, city: 'Indiana',      name: 'Pacers',      conf: 'East', division: 'Central', record: '47-35', rank: 6, color: '#002D62', secondary: '#FDBB30', logo: logo(12),
    stats: { ppg:123.0, oppg:120.0, pace:101.5, offRtg:121.0, defRtg:118.0, netRtg:3.0, efg:56.5, threePct:37.5, ftPct:79.0, ast:30.5, reb:41.5, stl:7.0, blk:5.0 },
    roster: [
      { name:'Tyrese Haliburton', pos:'PG', ppg:18.6, rpg:3.5, apg:10.9 },
      { name:'Andrew Nembhard', pos:'SG', ppg:10.0, rpg:3.0, apg:5.5 },
      { name:'Aaron Nesmith', pos:'SF', ppg:12.2, rpg:3.0, apg:1.4 },
      { name:'Pascal Siakam', pos:'PF', ppg:21.3, rpg:6.9, apg:3.7 },
      { name:'Myles Turner', pos:'C', ppg:17.1, rpg:6.9, apg:1.3 },
    ],
    identity: { scoring:89, playmaking:90, rebounding:64, defense:68, spacing:86, depth:76 },
    missingPiece: { archetype:'Defensive Anchor', fit:92, examples:['Myles Turner','Walker Kessler'] } },

  { abbr: 'CHI', id: 5,  city: 'Chicago',     name: 'Bulls',       conf: 'East', division: 'Central', record: '39-43', rank: 9, color: '#CE1141', secondary: '#9AA0A6', logo: logo(5),
    stats: { ppg:112.0, oppg:113.0, pace:98.0, offRtg:114.0, defRtg:115.0, netRtg:-1.0, efg:53.5, threePct:35.5, ftPct:78.0, ast:24.5, reb:43.5, stl:6.8, blk:4.2 },
    roster: [
      { name:'Josh Giddey', pos:'PG', ppg:13.0, rpg:7.6, apg:6.1 },
      { name:'Coby White', pos:'SG', ppg:19.1, rpg:4.5, apg:5.1 },
      { name:'Zach LaVine', pos:'SF', ppg:19.5, rpg:5.2, apg:3.9 },
      { name:'Patrick Williams', pos:'PF', ppg:10.0, rpg:3.9, apg:1.5 },
      { name:'Nikola Vucevic', pos:'C', ppg:18.0, rpg:10.5, apg:3.2 },
    ],
    identity: { scoring:78, playmaking:76, rebounding:76, defense:74, spacing:70, depth:70 },
    missingPiece: { archetype:'Stretch Five', fit:85, examples:['Naz Reid','Bobby Portis'] } },

  { abbr: 'DET', id: 9,  city: 'Detroit',      name: 'Pistons',     conf: 'East', division: 'Central', record: '14-68', rank: 15, color: '#C8102E', secondary: '#003E7E', logo: logo(9),
    stats: { ppg:110.0, oppg:114.0, pace:98.0, offRtg:112.5, defRtg:116.5, netRtg:-4.0, efg:53.0, threePct:35.5, ftPct:78.0, ast:25.0, reb:44.5, stl:7.0, blk:4.5 },
    roster: [
      { name:'Cade Cunningham', pos:'PG', ppg:22.7, rpg:4.3, apg:7.5 },
      { name:'Jaden Ivey', pos:'SG', ppg:14.0, rpg:3.4, apg:3.8 },
      { name:'Ausar Thompson', pos:'SF', ppg:9.5, rpg:6.3, apg:2.4 },
      { name:'Tobias Harris', pos:'PF', ppg:14.0, rpg:6.0, apg:2.5 },
      { name:'Jalen Duren', pos:'C', ppg:11.5, rpg:10.5, apg:2.5 },
    ],
    identity: { scoring:80, playmaking:78, rebounding:78, defense:72, spacing:68, depth:70 },
    missingPiece: { archetype:'3-and-D Wing', fit:90, examples:['Jalen Suggs','Andrew Wiggins'] } },

  // ── EAST · SOUTHEAST ─────────────────────────────────────────────────────
  { abbr: 'ORL', id: 22, city: 'Orlando',      name: 'Magic',       conf: 'East', division: 'Southeast', record: '47-35', rank: 7, color: '#0077C0', secondary: '#C4CED4', logo: logo(22),
    stats: { ppg:105.0, oppg:101.5, pace:96.5, offRtg:108.5, defRtg:105.0, netRtg:3.5, efg:51.5, threePct:33.0, ftPct:76.0, ast:23.0, reb:44.0, stl:7.5, blk:5.5 },
    roster: [
      { name:'Jalen Suggs', pos:'PG', ppg:12.6, rpg:3.0, apg:2.7 },
      { name:'Gary Harris', pos:'SG', ppg:8.0, rpg:2.0, apg:1.5 },
      { name:'Franz Wagner', pos:'SF', ppg:19.7, rpg:5.3, apg:3.7 },
      { name:'Paolo Banchero', pos:'PF', ppg:22.6, rpg:6.9, apg:5.4 },
      { name:'Wendell Carter Jr', pos:'C', ppg:11.0, rpg:6.8, apg:2.0 },
    ],
    identity: { scoring:72, playmaking:68, rebounding:80, defense:88, spacing:60, depth:78 },
    missingPiece: { archetype:'Knockdown Shooter', fit:94, examples:['Luke Kennard','Malik Beasley'] } },

  { abbr: 'MIA', id: 16, city: 'Miami',         name: 'Heat',        conf: 'East', division: 'Southeast', record: '46-36', rank: 8, color: '#98002E', secondary: '#F9A01B', logo: logo(16),
    stats: { ppg:110.0, oppg:109.0, pace:96.5, offRtg:113.5, defRtg:112.5, netRtg:1.0, efg:53.0, threePct:35.0, ftPct:80.5, ast:25.0, reb:41.5, stl:7.0, blk:3.5 },
    roster: [
      { name:'Terry Rozier', pos:'PG', ppg:16.4, rpg:3.4, apg:5.6 },
      { name:'Tyler Herro', pos:'SG', ppg:20.8, rpg:5.3, apg:4.5 },
      { name:'Jimmy Butler', pos:'SF', ppg:17.0, rpg:5.0, apg:4.5 },
      { name:'Nikola Jovic', pos:'PF', ppg:9.5, rpg:4.0, apg:2.5 },
      { name:'Bam Adebayo', pos:'C', ppg:19.3, rpg:10.4, apg:3.9 },
    ],
    identity: { scoring:78, playmaking:74, rebounding:72, defense:86, spacing:78, depth:72 },
    missingPiece: { archetype:'Offensive Creator', fit:89, examples:['Jordan Clarkson','Bogdan Bogdanović'] } },

  { abbr: 'ATL', id: 1,  city: 'Atlanta',      name: 'Hawks',       conf: 'East', division: 'Southeast', record: '36-46', rank: 10, color: '#E03A3E', secondary: '#C1D32F', logo: logo(1),
    stats: { ppg:118.5, oppg:120.5, pace:100.0, offRtg:118.5, defRtg:120.5, netRtg:-2.0, efg:54.5, threePct:35.5, ftPct:81.0, ast:26.5, reb:44.0, stl:7.2, blk:4.2 },
    roster: [
      { name:'Trae Young', pos:'PG', ppg:26.1, rpg:3.0, apg:10.8 },
      { name:'Dejounte Murray', pos:'SG', ppg:22.5, rpg:5.3, apg:6.4 },
      { name:'Jalen Johnson', pos:'SF', ppg:16.0, rpg:8.7, apg:3.6 },
      { name:'Saddiq Bey', pos:'PF', ppg:13.7, rpg:6.5, apg:1.5 },
      { name:'Clint Capela', pos:'C', ppg:11.5, rpg:10.8, apg:1.2 },
    ],
    identity: { scoring:86, playmaking:84, rebounding:78, defense:64, spacing:80, depth:70 },
    missingPiece: { archetype:'Lockdown Wing', fit:93, examples:['Jaden McDaniels','Herb Jones'] } },

  { abbr: 'CHA', id: 4,  city: 'Charlotte',    name: 'Hornets',     conf: 'East', division: 'Southeast', record: '21-61', rank: 13, color: '#1D1160', secondary: '#00788C', logo: logo(4),
    stats: { ppg:105.0, oppg:115.0, pace:98.5, offRtg:107.5, defRtg:117.5, netRtg:-10.0, efg:51.5, threePct:34.5, ftPct:78.0, ast:24.5, reb:43.0, stl:7.5, blk:4.0 },
    roster: [
      { name:'LaMelo Ball', pos:'PG', ppg:23.9, rpg:5.1, apg:8.0 },
      { name:'Brandon Miller', pos:'SG', ppg:17.3, rpg:4.3, apg:4.0 },
      { name:'Miles Bridges', pos:'SF', ppg:21.0, rpg:7.3, apg:3.3 },
      { name:'PJ Washington', pos:'PF', ppg:13.5, rpg:5.5, apg:2.5 },
      { name:'Mark Williams', pos:'C', ppg:12.7, rpg:9.7, apg:0.8 },
    ],
    identity: { scoring:74, playmaking:76, rebounding:68, defense:66, spacing:72, depth:62 },
    missingPiece: { archetype:'Veteran Leader', fit:84, examples:['Harrison Barnes','Kyle Lowry vet'] } },

  { abbr: 'WAS', id: 31, city: 'Washington',   name: 'Wizards',     conf: 'East', division: 'Southeast', record: '15-67', rank: 14, color: '#002B5C', secondary: '#E03A3E', logo: logo(31),
    stats: { ppg:108.0, oppg:122.0, pace:100.0, offRtg:110.0, defRtg:124.0, netRtg:-14.0, efg:52.0, threePct:34.5, ftPct:78.0, ast:24.5, reb:43.5, stl:6.5, blk:3.8 },
    roster: [
      { name:'Tyus Jones', pos:'PG', ppg:12.0, rpg:2.7, apg:5.0 },
      { name:'Jordan Poole', pos:'SG', ppg:17.4, rpg:2.7, apg:4.0 },
      { name:'Deni Avdija', pos:'SF', ppg:14.7, rpg:7.0, apg:3.8 },
      { name:'Kyle Kuzma', pos:'PF', ppg:22.2, rpg:6.6, apg:4.2 },
      { name:'Marvin Bagley', pos:'C', ppg:11.0, rpg:6.5, apg:1.5 },
    ],
    identity: { scoring:68, playmaking:70, rebounding:66, defense:58, spacing:64, depth:60 },
    missingPiece: { archetype:'Defensive Anchor', fit:89, examples:['Mark Williams','Walker Kessler'] } },

  // ── WEST · NORTHWEST ─────────────────────────────────────────────────────
  { abbr: 'OKC', id: 25, city: 'Oklahoma City', name: 'Thunder',     conf: 'West', division: 'Northwest', record: '57-25', rank: 1, color: '#007AC1', secondary: '#EF3B24', logo: logo(25),
    stats: { ppg:120.1, oppg:110.1, pace:99.5, offRtg:119.7, defRtg:110.0, netRtg:9.7, efg:56.5, threePct:38.1, ftPct:81.0, ast:26.5, reb:44.0, stl:7.8, blk:6.2 },
    roster: [
      { name:'Shai Gilgeous-Alexander', pos:'PG', ppg:30.1, rpg:5.5, apg:6.2 },
      { name:'Jalen Williams', pos:'SG', ppg:21.0, rpg:5.0, apg:5.0 },
      { name:'Luguentz Dort', pos:'SF', ppg:11.0, rpg:4.0, apg:1.5 },
      { name:'Chet Holmgren', pos:'PF', ppg:16.5, rpg:7.9, apg:2.4 },
      { name:'Isaiah Hartenstein', pos:'C', ppg:11.0, rpg:8.5, apg:2.5 },
    ],
    identity: { scoring:88, playmaking:86, rebounding:70, defense:90, spacing:84, depth:88 },
    missingPiece: { archetype:'Rebounding Big', fit:92, examples:['Isaiah Hartenstein','Steven Adams'] } },

  { abbr: 'DEN', id: 8,  city: 'Denver',       name: 'Nuggets',     conf: 'West', division: 'Northwest', record: '57-25', rank: 2, color: '#0E2240', secondary: '#FEC524', logo: logo(8),
    stats: { ppg:117.0, oppg:110.0, pace:97.5, offRtg:118.2, defRtg:111.0, netRtg:7.2, efg:56.0, threePct:37.0, ftPct:78.0, ast:28.5, reb:44.5, stl:7.0, blk:4.5 },
    roster: [
      { name:'Jamal Murray', pos:'PG', ppg:21.2, rpg:4.0, apg:6.5 },
      { name:'Kentavious Caldwell-Pope', pos:'SG', ppg:10.1, rpg:2.4, apg:2.5 },
      { name:'Michael Porter Jr', pos:'SF', ppg:16.7, rpg:7.0, apg:1.5 },
      { name:'Aaron Gordon', pos:'PF', ppg:14.6, rpg:6.9, apg:3.5 },
      { name:'Nikola Jokić', pos:'C', ppg:26.4, rpg:12.4, apg:9.0 },
    ],
    identity: { scoring:88, playmaking:92, rebounding:84, defense:82, spacing:78, depth:64 },
    missingPiece: { archetype:'Two-Way Wing', fit:91, examples:['OG Anunoby','Lu Dort'] } },

  { abbr: 'MIN', id: 19, city: 'Minnesota',    name: 'Timberwolves', conf: 'West', division: 'Northwest', record: '56-26', rank: 3, color: '#236192', secondary: '#78BE20', logo: logo(19),
    stats: { ppg:113.0, oppg:106.5, pace:97.0, offRtg:114.8, defRtg:107.8, netRtg:7.0, efg:54.5, threePct:36.5, ftPct:79.0, ast:25.0, reb:45.5, stl:7.5, blk:5.8 },
    roster: [
      { name:'Mike Conley', pos:'PG', ppg:11.0, rpg:2.8, apg:5.0 },
      { name:'Anthony Edwards', pos:'SG', ppg:25.9, rpg:5.4, apg:5.1 },
      { name:'Jaden McDaniels', pos:'SF', ppg:10.0, rpg:3.0, apg:1.5 },
      { name:'Karl-Anthony Towns', pos:'PF', ppg:21.8, rpg:8.3, apg:3.0 },
      { name:'Rudy Gobert', pos:'C', ppg:14.0, rpg:12.9, apg:2.0 },
    ],
    identity: { scoring:80, playmaking:76, rebounding:84, defense:92, spacing:74, depth:74 },
    missingPiece: { archetype:'Shot-Creator Guard', fit:90, examples:['Jordan Clarkson','Tyler Herro'] } },

  { abbr: 'POR', id: 26, city: 'Portland',     name: 'Trail Blazers', conf: 'West', division: 'Northwest', record: '21-61', rank: 14, color: '#E03A3E', secondary: '#9AA0A6', logo: logo(26),
    stats: { ppg:105.0, oppg:117.0, pace:98.5, offRtg:107.5, defRtg:119.5, netRtg:-12.0, efg:52.5, threePct:35.5, ftPct:78.5, ast:23.5, reb:43.5, stl:6.8, blk:4.2 },
    roster: [
      { name:'Anfernee Simons', pos:'PG', ppg:22.6, rpg:3.6, apg:5.6 },
      { name:'Shaedon Sharpe', pos:'SG', ppg:18.0, rpg:4.5, apg:2.5 },
      { name:'Deni Avdija', pos:'SF', ppg:16.0, rpg:7.0, apg:3.8 },
      { name:'Jerami Grant', pos:'PF', ppg:21.0, rpg:3.5, apg:2.5 },
      { name:'Deandre Ayton', pos:'C', ppg:16.0, rpg:10.5, apg:1.5 },
    ],
    identity: { scoring:76, playmaking:72, rebounding:68, defense:64, spacing:72, depth:62 },
    missingPiece: { archetype:'Veteran Wing', fit:87, examples:['Harrison Barnes',"Royce O'Neale"] } },

  { abbr: 'UTA', id: 30, city: 'Utah',          name: 'Jazz',        conf: 'West', division: 'Northwest', record: '31-51', rank: 12, color: '#002B5C', secondary: '#F9A01B', logo: logo(30),
    stats: { ppg:108.0, oppg:118.0, pace:98.0, offRtg:110.0, defRtg:120.0, netRtg:-10.0, efg:52.0, threePct:35.0, ftPct:78.0, ast:24.0, reb:44.0, stl:6.5, blk:4.5 },
    roster: [
      { name:'Collin Sexton', pos:'PG', ppg:18.0, rpg:2.8, apg:4.0 },
      { name:'Jordan Clarkson', pos:'SG', ppg:17.0, rpg:3.5, apg:5.0 },
      { name:'Lauri Markkanen', pos:'SF', ppg:23.0, rpg:8.2, apg:2.0 },
      { name:'John Collins', pos:'PF', ppg:15.0, rpg:6.0, apg:1.5 },
      { name:'Walker Kessler', pos:'C', ppg:9.0, rpg:8.5, apg:1.0 },
    ],
    identity: { scoring:72, playmaking:70, rebounding:74, defense:64, spacing:76, depth:64 },
    missingPiece: { archetype:'Defensive Anchor', fit:89, examples:['Walker Kessler','Mark Williams'] } },

  // ── WEST · PACIFIC ───────────────────────────────────────────────────────
  { abbr: 'GSW', id: 10, city: 'Golden State', name: 'Warriors',    conf: 'West', division: 'Pacific', record: '46-36', rank: 10, color: '#1D428A', secondary: '#FFC72C', logo: logo(10),
    stats: { ppg:117.0, oppg:112.0, pace:99.5, offRtg:118.0, defRtg:113.0, netRtg:5.0, efg:56.0, threePct:38.0, ftPct:79.0, ast:27.0, reb:43.0, stl:6.5, blk:4.0 },
    roster: [
      { name:'Stephen Curry', pos:'PG', ppg:26.4, rpg:4.5, apg:5.1 },
      { name:'Brandin Podziemski', pos:'SG', ppg:12.0, rpg:5.5, apg:3.5 },
      { name:'Andrew Wiggins', pos:'SF', ppg:13.0, rpg:4.5, apg:1.7 },
      { name:'Draymond Green', pos:'PF', ppg:8.0, rpg:5.0, apg:5.5 },
      { name:'Trayce Jackson-Davis', pos:'C', ppg:8.0, rpg:6.0, apg:1.5 },
    ],
    identity: { scoring:86, playmaking:82, rebounding:64, defense:72, spacing:90, depth:70 },
    missingPiece: { archetype:'Stretch Big', fit:90, examples:['Naz Reid','Brook Lopez'] } },

  { abbr: 'LAC', id: 13, city: 'Los Angeles',  name: 'Clippers',    conf: 'West', division: 'Pacific', record: '51-31', rank: 4, color: '#C8102E', secondary: '#006BB6', logo: logo(13),
    stats: { ppg:115.5, oppg:112.0, pace:97.5, offRtg:117.0, defRtg:113.5, netRtg:3.5, efg:55.0, threePct:37.5, ftPct:80.0, ast:25.5, reb:43.0, stl:7.0, blk:4.5 },
    roster: [
      { name:'James Harden', pos:'PG', ppg:16.6, rpg:5.1, apg:8.5 },
      { name:'Norman Powell', pos:'SG', ppg:16.0, rpg:2.8, apg:1.5 },
      { name:'Kawhi Leonard', pos:'SF', ppg:23.7, rpg:6.3, apg:3.5 },
      { name:'Nicolas Batum', pos:'PF', ppg:8.0, rpg:4.0, apg:1.5 },
      { name:'Ivica Zubac', pos:'C', ppg:11.7, rpg:9.2, apg:1.5 },
    ],
    identity: { scoring:84, playmaking:78, rebounding:76, defense:82, spacing:80, depth:70 },
    missingPiece: { archetype:'Playmaking PG', fit:88, examples:['Tyus Jones','T.J. McConnell'] } },

  { abbr: 'LAL', id: 14, city: 'Los Angeles',  name: 'Lakers',      conf: 'West', division: 'Pacific', record: '47-35', rank: 7, color: '#552583', secondary: '#FDB927', logo: logo(14),
    stats: { ppg:115.0, oppg:116.0, pace:99.0, offRtg:116.0, defRtg:117.0, netRtg:-1.0, efg:54.5, threePct:37.0, ftPct:78.0, ast:26.5, reb:43.5, stl:6.5, blk:4.5 },
    roster: [
      { name:"D'Angelo Russell", pos:'PG', ppg:18.0, rpg:3.0, apg:6.3 },
      { name:'Austin Reaves', pos:'SG', ppg:16.0, rpg:4.5, apg:5.5 },
      { name:'Rui Hachimura', pos:'SF', ppg:13.6, rpg:4.3, apg:1.2 },
      { name:'LeBron James', pos:'PF', ppg:25.7, rpg:7.3, apg:8.3 },
      { name:'Anthony Davis', pos:'C', ppg:24.7, rpg:12.6, apg:3.5 },
    ],
    identity: { scoring:84, playmaking:80, rebounding:78, defense:74, spacing:68, depth:68 },
    missingPiece: { archetype:'Knockdown Shooter', fit:93, examples:['Malik Beasley','Luke Kennard'] } },

  { abbr: 'PHX', id: 24, city: 'Phoenix',      name: 'Suns',        conf: 'West', division: 'Pacific', record: '49-33', rank: 6, color: '#1D1160', secondary: '#E56020', logo: logo(24),
    stats: { ppg:116.0, oppg:113.0, pace:98.0, offRtg:117.5, defRtg:114.5, netRtg:3.0, efg:55.5, threePct:37.0, ftPct:80.0, ast:26.5, reb:43.5, stl:6.5, blk:4.0 },
    roster: [
      { name:'Tyus Jones', pos:'PG', ppg:12.0, rpg:2.5, apg:7.0 },
      { name:'Devin Booker', pos:'SG', ppg:27.1, rpg:4.5, apg:7.0 },
      { name:'Bradley Beal', pos:'SF', ppg:18.2, rpg:4.4, apg:5.0 },
      { name:'Kevin Durant', pos:'PF', ppg:27.1, rpg:6.6, apg:5.0 },
      { name:'Jusuf Nurkić', pos:'C', ppg:11.0, rpg:11.0, apg:3.5 },
    ],
    identity: { scoring:88, playmaking:72, rebounding:72, defense:70, spacing:82, depth:62 },
    missingPiece: { archetype:'3-and-D Role Player', fit:92, examples:["Royce O'Neale",'P.J. Tucker vet'] } },

  { abbr: 'SAC', id: 27, city: 'Sacramento',   name: 'Kings',       conf: 'West', division: 'Pacific', record: '46-36', rank: 9, color: '#5A2D81', secondary: '#9AA0A6', logo: logo(27),
    stats: { ppg:116.0, oppg:116.0, pace:99.5, offRtg:117.0, defRtg:117.0, netRtg:0.0, efg:55.0, threePct:36.5, ftPct:78.5, ast:26.0, reb:43.0, stl:6.8, blk:4.0 },
    roster: [
      { name:"De'Aaron Fox", pos:'PG', ppg:26.6, rpg:4.6, apg:5.6 },
      { name:'Kevin Huerter', pos:'SG', ppg:14.0, rpg:3.2, apg:3.5 },
      { name:'Keegan Murray', pos:'SF', ppg:15.0, rpg:5.0, apg:1.5 },
      { name:'DeMar DeRozan', pos:'PF', ppg:22.0, rpg:4.5, apg:4.0 },
      { name:'Domantas Sabonis', pos:'C', ppg:19.4, rpg:13.7, apg:8.0 },
    ],
    identity: { scoring:86, playmaking:80, rebounding:72, defense:68, spacing:80, depth:70 },
    missingPiece: { archetype:'Defensive Anchor', fit:91, examples:['Myles Turner','Walker Kessler'] } },

  // ── WEST · SOUTHWEST ──────────────────────────────────────────────────────
  { abbr: 'DAL', id: 7,  city: 'Dallas',       name: 'Mavericks',   conf: 'West', division: 'Southwest', record: '50-32', rank: 4, color: '#00538C', secondary: '#B8C4CA', logo: logo(7),
    stats: { ppg:118.0, oppg:115.0, pace:98.5, offRtg:118.5, defRtg:115.5, netRtg:3.0, efg:55.5, threePct:37.0, ftPct:78.0, ast:25.0, reb:43.5, stl:6.8, blk:4.0 },
    roster: [
      { name:'Luka Dončić', pos:'PG', ppg:33.9, rpg:9.2, apg:9.8 },
      { name:'Kyrie Irving', pos:'SG', ppg:25.6, rpg:5.0, apg:5.2 },
      { name:'Klay Thompson', pos:'SF', ppg:16.0, rpg:3.5, apg:2.0 },
      { name:'PJ Washington', pos:'PF', ppg:12.0, rpg:6.0, apg:2.0 },
      { name:'Daniel Gafford', pos:'C', ppg:11.0, rpg:7.5, apg:1.5 },
    ],
    identity: { scoring:90, playmaking:82, rebounding:78, defense:76, spacing:84, depth:72 },
    missingPiece: { archetype:'Defensive Wing', fit:91, examples:['Jaden McDaniels','Herb Jones'] } },

  { abbr: 'NOP', id: 3,  city: 'New Orleans',  name: 'Pelicans',    conf: 'West', division: 'Southwest', record: '49-33', rank: 6, color: '#0C2340', secondary: '#B4975A', logo: logo(3),
    stats: { ppg:112.0, oppg:112.0, pace:97.5, offRtg:114.5, defRtg:114.5, netRtg:0.0, efg:53.5, threePct:36.5, ftPct:78.5, ast:25.0, reb:44.5, stl:7.0, blk:4.5 },
    roster: [
      { name:'Dejounte Murray', pos:'PG', ppg:18.0, rpg:4.5, apg:6.5 },
      { name:'CJ McCollum', pos:'SG', ppg:20.0, rpg:4.0, apg:4.5 },
      { name:'Brandon Ingram', pos:'SF', ppg:24.0, rpg:5.0, apg:5.5 },
      { name:'Zion Williamson', pos:'PF', ppg:22.0, rpg:5.5, apg:4.5 },
      { name:'Yves Missi', pos:'C', ppg:11.0, rpg:8.5, apg:1.0 },
    ],
    identity: { scoring:82, playmaking:74, rebounding:76, defense:78, spacing:76, depth:70 },
    missingPiece: { archetype:'Floor General PG', fit:89, examples:['Tyus Jones','Mike Conley'] } },

  { abbr: 'HOU', id: 11, city: 'Houston',      name: 'Rockets',     conf: 'West', division: 'Southwest', record: '41-41', rank: 11, color: '#CE1141', secondary: '#9AA0A6', logo: logo(11),
    stats: { ppg:110.0, oppg:110.0, pace:97.0, offRtg:112.5, defRtg:112.5, netRtg:0.0, efg:53.0, threePct:35.5, ftPct:79.0, ast:24.0, reb:45.0, stl:8.0, blk:4.8 },
    roster: [
      { name:'Fred VanVleet', pos:'PG', ppg:14.8, rpg:3.8, apg:8.1 },
      { name:'Jalen Green', pos:'SG', ppg:19.6, rpg:5.2, apg:3.5 },
      { name:'Dillon Brooks', pos:'SF', ppg:13.0, rpg:3.5, apg:1.5 },
      { name:'Jabari Smith Jr', pos:'PF', ppg:13.0, rpg:8.1, apg:1.5 },
      { name:'Alperen Sengun', pos:'C', ppg:21.0, rpg:9.3, apg:5.0 },
    ],
    identity: { scoring:78, playmaking:72, rebounding:82, defense:88, spacing:70, depth:78 },
    missingPiece: { archetype:'Shot-Creator Guard', fit:91, examples:['Anfernee Simons','Jordan Poole'] } },

  { abbr: 'MEM', id: 15, city: 'Memphis',      name: 'Grizzlies',   conf: 'West', division: 'Southwest', record: '47-35', rank: 8, color: '#5D76A9', secondary: '#FDBB30', logo: logo(15),
    stats: { ppg:112.0, oppg:110.5, pace:99.0, offRtg:113.5, defRtg:112.0, netRtg:1.5, efg:53.5, threePct:35.0, ftPct:79.5, ast:25.5, reb:44.5, stl:8.5, blk:5.5 },
    roster: [
      { name:'Ja Morant', pos:'PG', ppg:25.1, rpg:5.6, apg:8.1 },
      { name:'Desmond Bane', pos:'SG', ppg:23.7, rpg:4.4, apg:5.5 },
      { name:'Marcus Smart', pos:'SF', ppg:12.0, rpg:2.5, apg:4.5 },
      { name:'Jaren Jackson Jr', pos:'PF', ppg:22.5, rpg:5.5, apg:3.0 },
      { name:'Steven Adams', pos:'C', ppg:8.0, rpg:11.0, apg:2.5 },
    ],
    identity: { scoring:88, playmaking:84, rebounding:76, defense:80, spacing:74, depth:76 },
    missingPiece: { archetype:'3-and-D Wing', fit:90, examples:['Cameron Johnson','Dorian Finney-Smith'] } },

  { abbr: 'SAS', id: 28, city: 'San Antonio',  name: 'Spurs',       conf: 'West', division: 'Southwest', record: '22-60', rank: 13, color: '#C4CED4', secondary: '#2A2A2A', logo: logo(28),
    stats: { ppg:113.0, oppg:120.0, pace:99.5, offRtg:114.0, defRtg:121.0, netRtg:-7.0, efg:53.5, threePct:35.0, ftPct:78.5, ast:26.0, reb:43.0, stl:6.5, blk:4.8 },
    roster: [
      { name:'Chris Paul', pos:'PG', ppg:10.0, rpg:3.5, apg:7.5 },
      { name:'Devin Vassell', pos:'SG', ppg:19.0, rpg:3.5, apg:4.0 },
      { name:'Harrison Barnes', pos:'SF', ppg:12.0, rpg:3.0, apg:1.5 },
      { name:'Jeremy Sochan', pos:'PF', ppg:10.0, rpg:5.0, apg:3.0 },
      { name:'Victor Wembanyama', pos:'C', ppg:24.0, rpg:10.0, apg:4.0 },
    ],
    identity: { scoring:78, playmaking:76, rebounding:76, defense:70, spacing:72, depth:68 },
    missingPiece: { archetype:'Two-Way PG', fit:90, examples:['Derrick White','Jalen Suggs'] } },
];

// ── bench rotations (5 key reserves per team, merged by abbreviation) ───────
// compact tuples: [name, pos, ppg, rpg, apg]
const BENCH = {
  ATL: [['Bogdan Bogdanović','SG',16.9,3.4,3.3],['Onyeka Okongwu','C',10.2,6.8,1.3],["De'Andre Hunter",'SF',14.5,4.0,1.3],['Kobe Bufkin','PG',4.8,1.6,1.5],['Garrison Mathews','SG',5.3,1.2,0.6]],
  BOS: [['Al Horford','C',8.6,6.4,2.1],['Payton Pritchard','PG',9.4,3.2,3.4],['Sam Hauser','SF',8.5,3.0,1.2],['Luke Kornet','C',5.1,3.9,0.9],['Oshae Brissett','PF',3.7,2.3,0.6]],
  NYK: [['Miles McBride','PG',8.3,1.7,2.3],['Josh Hart','SF',9.4,8.3,4.1],['Precious Achiuwa','C',7.6,5.4,0.8],['Bojan Bogdanović','SF',10.4,2.0,1.5],['Mitchell Robinson','C',5.5,6.0,0.5]],
  PHI: [['Kyle Lowry','PG',8.0,2.7,4.6],['Nicolas Batum','PF',5.5,3.6,1.3],['Paul Reed','C',4.5,4.0,0.5],['Cameron Payne','PG',9.3,1.8,3.1],['Furkan Korkmaz','SG',5.0,1.2,0.8]],
  TOR: [['Bruce Brown','SG',10.8,4.0,3.0],['Chris Boucher','PF',6.0,4.2,0.6],['Ochai Agbaji','SG',8.0,3.0,1.0],['Kelly Olynyk','C',9.0,4.5,3.0],['Garrett Temple','SG',3.0,1.5,1.0]],
  BKN: [["Dennis Smith Jr",'PG',6.0,2.5,4.0],["Royce O'Neale",'SF',6.0,4.0,2.5],["Day'Ron Sharpe",'C',7.0,6.0,1.0],['Jalen Wilson','SF',4.0,2.0,0.5],["Dorian Finney-Smith",'PF',8.0,4.0,1.5]],
  MIL: [['Bobby Portis','PF',13.5,8.0,1.2],['Pat Connaughton','SG',5.0,2.5,1.5],['Andre Jackson Jr','SG',4.0,3.0,1.5],['Cameron Payne','PG',9.0,1.8,3.0],['Danilo Gallinari','PF',6.0,2.5,0.8]],
  CLE: [['Caris LeVert','SG',14.0,3.8,4.2],['Georges Niang','PF',9.0,3.0,1.2],['Isaac Okoro','SF',9.0,3.0,1.5],['Sam Merrill','SG',8.0,2.5,1.5],['Tristan Thompson','C',4.0,5.0,0.5]],
  IND: [['Bennedict Mathurin','SG',14.5,3.8,1.8],['Obi Toppin','PF',10.0,3.8,1.3],['T.J. McConnell','PG',10.0,2.5,5.3],['Ben Sheppard','SG',6.0,2.5,1.5],['Jalen Smith','C',10.0,5.5,1.0]],
  CHI: [['Ayo Dosunmu','SG',9.0,2.5,4.0],['Jevon Carter','PG',4.0,1.5,2.0],['Andre Drummond','C',8.0,9.0,0.5],['Dalen Terry','SG',3.0,1.5,1.0],['Julian Phillips','SF',4.0,1.5,0.5]],
  DET: [['Marcus Sasser','PG',8.0,1.5,3.0],['Simone Fontecchio','SF',9.0,3.0,1.0],['James Wiseman','C',7.0,5.0,0.5],['Taj Gibson','PF',4.0,3.0,0.5],['Evan Fournier','SG',6.0,1.5,2.0]],
  ORL: [['Cole Anthony','PG',11.0,4.0,3.0],['Jonathan Isaac','PF',6.0,4.0,1.0],['Moritz Wagner','C',11.0,4.5,1.5],['Anthony Black','PG',4.0,2.0,2.0],['Trevelin Queen','SG',3.0,1.0,0.5]],
  MIA: [['Kevin Love','PF',8.0,6.0,2.0],['Haywood Highsmith','SF',6.0,3.0,1.0],['Jaime Jaquez Jr','SF',12.0,4.0,3.0],['Caleb Martin','SF',10.0,4.0,2.0],['Thomas Bryant','C',5.0,3.0,0.5]],
  CHA: [['Cody Martin','SG',5.0,3.0,2.5],['Nick Richards','C',9.0,8.0,0.8],['Grant Williams','PF',8.0,3.0,1.5],['Tre Mann','PG',8.0,2.5,3.0],['Bryce McGowens','SG',5.0,1.5,1.0]],
  WAS: [['Corey Kispert','SG',11.0,2.5,1.5],['Richaun Holmes','C',7.0,5.0,0.5],['Bilal Coulibaly','SF',8.0,3.0,2.0],['Eugene Omoruyi','PF',4.0,2.0,0.5],['Landry Shamet','SG',7.0,1.5,2.0]],
  OKC: [['Isaiah Joe','SG',8.0,2.0,1.0],['Aaron Wiggins','SF',7.0,3.0,1.0],['Cason Wallace','PG',6.0,2.5,2.0],['Kenrich Williams','PF',5.0,3.0,1.0],['Jaylin Williams','C',4.0,3.5,1.5]],
  DEN: [['Reggie Jackson','PG',10.0,2.0,4.0],['Christian Braun','SG',7.0,3.5,1.5],['DeAndre Jordan','C',4.0,4.5,0.5],['Peyton Watson','SF',6.0,2.5,1.0],['Justin Holiday','SG',5.0,2.0,1.0]],
  MIN: [['Nickeil Alexander-Walker','SG',8.0,2.0,2.5],['Kyle Anderson','PF',6.0,3.5,4.0],['Naz Reid','C',12.0,4.5,1.0],['Monte Morris','PG',5.0,1.5,3.0],['Troy Brown Jr','SF',4.0,3.0,1.0]],
  POR: [['Scoot Henderson','PG',14.0,3.0,5.0],['Jabari Walker','PF',8.0,5.0,1.0],['Kris Murray','SF',5.0,2.5,1.0],['Toumani Camara','PF',6.0,4.0,1.5],['Duop Reath','C',8.0,3.0,1.0]],
  UTA: [['Talen Horton-Tucker','SG',10.0,3.0,4.0],['Omer Yurtseven','C',7.0,5.0,1.0],['Simone Fontecchio','SF',7.0,3.0,1.5],['George Hill','PG',8.0,2.5,4.0],['Taylor Hendricks','PF',6.0,4.0,1.0]],
  GSW: [['Chris Paul','PG',9.0,3.5,7.0],['Jonathan Kuminga','PF',16.0,4.5,2.0],['Kevon Looney','C',6.0,6.0,2.0],['Moses Moody','SG',8.0,3.0,1.5],['Gary Payton II','SG',6.0,2.5,1.5]],
  LAC: [['Mason Plumlee','C',5.0,5.0,1.0],['Amir Coffey','SF',6.0,2.5,1.0],['Bones Hyland','PG',6.0,1.5,3.0],['PJ Tucker','PF',3.0,3.0,0.5],['Kobe Brown','PF',4.0,2.0,1.0]],
  LAL: [['Taurean Prince','SF',8.0,3.0,1.5],['Spencer Dinwiddie','PG',6.0,1.5,3.0],['Cam Reddish','SF',6.0,2.5,1.0],['Christian Wood','C',6.0,5.0,1.0],['Jaxson Hayes','C',6.0,4.5,0.5]],
  PHX: [["Royce O'Neale",'SF',8.0,4.5,2.5],['Mason Plumlee','C',4.0,5.0,1.0],['Grayson Allen','SG',13.0,3.5,3.0],['Bol Bol','C',5.0,3.0,0.5],['Monte Morris','PG',5.0,1.5,3.0]],
  SAC: [['Malik Monk','SG',15.0,2.5,5.0],['Keon Ellis','SG',6.0,2.0,1.5],['Trey Lyles','PF',7.0,4.0,1.0],['Alex Len','C',3.0,3.0,0.5],['Chris Duarte','SG',4.0,1.5,1.0]],
  DAL: [['Dereck Lively II','C',8.0,7.0,1.0],['Dante Exum','PG',9.0,2.5,3.0],['Derrick Jones Jr','SF',8.0,3.0,1.0],['Jaden Hardy','SG',7.0,2.0,2.0],['Maxi Kleber','PF',5.0,3.5,1.0]],
  NOP: [['Jordan Hawkins','SG',14.0,3.0,2.0],['Herb Jones','SF',11.0,3.5,2.5],['Larry Nance Jr','PF',7.0,5.0,1.5],['Jose Alvarado','PG',8.0,2.5,3.5],['Cody Zeller','C',3.0,3.0,0.5]],
  HOU: [['Tari Eason','SF',9.0,7.0,1.0],['Amen Thompson','SG',9.0,5.0,2.5],['Cam Whitmore','SF',12.0,3.5,0.8],['Jeff Green','PF',6.0,2.5,1.0],['Aaron Holiday','PG',6.0,1.5,3.0]],
  MEM: [['Luke Kennard','SG',10.0,2.5,2.5],['Santi Aldama','PF',11.0,5.0,2.5],['Vince Williams Jr','SF',8.0,4.0,3.0],['GG Jackson','SF',8.0,3.0,1.0],['Bismack Biyombo','C',4.0,4.0,0.5]],
  SAS: [['Keldon Johnson','SF',16.0,4.5,2.0],['Tre Jones','PG',9.0,3.0,4.0],['Zach Collins','C',6.0,4.0,2.0],['Malaki Branham','SG',8.0,2.0,2.0],['Julian Champagnie','SF',6.0,2.5,1.0]],
};
nbaTeams.forEach((t) => {
  t.bench = (BENCH[t.abbr] || []).map(([name, pos, ppg, rpg, apg]) => ({ name, pos, ppg, rpg, apg }));
});
// apply baked live records (record + ppg + oppg from your balldontlie key)
nbaTeams.forEach((t) => {
  if (LIVE_RECORDS[t.abbr]) {
    t.record = LIVE_RECORDS[t.abbr].record;
    t.stats = { ...t.stats, ppg: LIVE_RECORDS[t.abbr].ppg, oppg: LIVE_RECORDS[t.abbr].oppg };
  }
});

// ── derived helpers ─────────────────────────────────────────────────────────
export const getWeaknesses = (team) =>
  Object.entries(team.identity).sort((a, b) => a[1] - b[1]).slice(0, 2)
    .map(([key, value]) => ({ key, value }));

export const getStrengths = (team) =>
  Object.entries(team.identity).sort((a, b) => b[1] - a[1]).slice(0, 2)
    .map(([key, value]) => ({ key, value }));

export const getRosterIdentityScore = (team) => {
  const v = Object.values(team.identity);
  return Math.round(v.reduce((a, b) => a + b, 0) / v.length);
};

// ── Total Impact Value: projected roster-identity gain from the recommended ─
// acquisition, weighted by fit %. Fills the two weakest axes toward an elite
// target (90), capped at 100, with a 0.6 factor (one player can't fully close a
// gap). Returns current vs projected scores + per-axis lifts + a letter grade.
export const computeImpact = (team) => {
  const weak = getWeaknesses(team);
  const fit = (team.missingPiece?.fit ?? 80) / 100;
  const TARGET = 90;
  const boosts = {};
  weak.forEach((w) => {
    boosts[w.key] = Math.max(0, Math.round((TARGET - w.value) * fit * 0.6));
  });
  const projected = { ...team.identity };
  Object.keys(boosts).forEach((k) => { projected[k] = Math.min(100, projected[k] + boosts[k]); });
  const currentScore = getRosterIdentityScore(team);
  const projectedScore = Math.round((Object.values(projected).reduce((a, b) => a + b, 0) / 6) * 10) / 10;
  const delta = Math.round((projectedScore - currentScore) * 10) / 10;
  const grade = delta >= 8 ? 'A' : delta >= 5 ? 'B' : delta >= 3 ? 'C' : 'D';
  return {
    currentScore, projectedScore, delta, grade, boosts, projected, weak,
    fit: team.missingPiece?.fit ?? 80,
    archetype: team.missingPiece?.archetype ?? '—',
    target: team.missingPiece?.examples?.[0] ?? '—',
  };
};

export const leagueAverages = (() => {
  const keys = Object.keys(nbaTeams[0].stats);
  const avg = {};
  keys.forEach((k) => {
    avg[k] = +(nbaTeams.reduce((s, t) => s + t.stats[k], 0) / nbaTeams.length).toFixed(1);
  });
  return avg;
})();

// ── live refresh: balldontlie (key) → records/ppg/oppg; web-search fallback ─
// Called by the in-app "Refresh" button. With a key pasted into NBA_API_KEY it
// pulls the current W/L record + ppg + oppg from balldontlie's free /games
// endpoint. Without a key (or on CORS failure) it falls back to an LLM web
// search that also returns full stats + roster + bench.
export async function refreshTeamLive(abbr) {
  const team = nbaTeams.find((t) => t.abbr === abbr);
  if (!team) return null;
  if (NBA_API_KEY && NBA_API_KEY !== 'YOUR_BALDONTLIE_KEY') {
    try {
      const h = { Authorization: NBA_API_KEY };
      const r = await fetch(`${BDL}/games?seasons[]=2024&team_ids[]=${team.id}&postseason=false&per_page=100`, { headers: h });
      const j = await r.json();
      let w = 0, l = 0, pf = 0, pa = 0;
      (j.data || []).forEach((g) => {
        if (g.status !== 'Final') return;
        const home = g.home_team.id === team.id;
        const my = home ? g.home_team_score : g.visitor_team_score;
        const opp = home ? g.visitor_team_score : g.home_team_score;
        if (my > opp) w++; else if (my < opp) l++;
        pf += my; pa += opp;
      });
      const gp = w + l;
      if (gp) return { ...team, record: `${w}-${l}`, stats: { ...team.stats, ppg: +(pf / gp).toFixed(1), oppg: +(pa / gp).toFixed(1) }, _live: true };
    } catch (e) { /* fall through to web search */ }
  }
  const prompt = `Return the most current NBA season data for the ${team.city} ${team.name}. Use public 2024-25 season stats. Include current win-loss record (e.g. "45-37"); team per-game averages (ppg, oppg, pace, offRtg, defRtg, netRtg, efg, threePct, ftPct, ast, reb, stl, blk); 5 starters and 5 key bench players each with position, ppg, rpg, apg. Be accurate and current — do not invent numbers.`;
  const schema = { type: 'object', properties: { record: { type: 'string' }, stats: { type: 'object', properties: { ppg:{type:'number'}, oppg:{type:'number'}, pace:{type:'number'}, offRtg:{type:'number'}, defRtg:{type:'number'}, netRtg:{type:'number'}, efg:{type:'number'}, threePct:{type:'number'}, ftPct:{type:'number'}, ast:{type:'number'}, reb:{type:'number'}, stl:{type:'number'}, blk:{type:'number'} } }, roster: { type: 'array', items: { type: 'object', properties: { name:{type:'string'}, pos:{type:'string'}, ppg:{type:'number'}, rpg:{type:'number'}, apg:{type:'number'} } } }, bench: { type: 'array', items: { type: 'object', properties: { name:{type:'string'}, pos:{type:'string'}, ppg:{type:'number'}, rpg:{type:'number'}, apg:{type:'number'} } } } } };
  const res = await base44.integrations.Core.InvokeLLM({ prompt, add_context_from_internet: true, response_json_schema: schema, model: 'gemini_3_flash' });
  if (!res || !res.stats) throw new Error('No live data returned');
  return { ...team, record: res.record || team.record, stats: { ...team.stats, ...res.stats }, roster: res.roster?.length ? res.roster : team.roster, bench: res.bench?.length ? res.bench : team.bench, _live: true };
}
