import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { IDENTITY_AXES } from '@/data/nbaTeams';

const AXIS_COLORS = {
  scoring: '#FF6B00', playmaking: '#00C4CF', rebounding: '#78BE20',
  defense: '#EF3B24', spacing: '#FDB927', depth: '#9B59B6',
};

// ─────────────────────────────────────────────────────────────────────────────
// Interactive central ball: semi-transparent body in the team's primary color,
// raised white tube seams (authentic NBA pattern) + secondary-color stripe
// bands. Drag to rotate. Six stat "chips" branch out from the ball and are
// clickable to drive the right-hand intelligence panel.
// ─────────────────────────────────────────────────────────────────────────────
export default function BasketballScene({ team, onChipClick, expanded = true, onToggle }) {
  const mountRef = useRef(null);
  const sphereMatRef = useRef(null);
  const glowMatRef = useRef(null);
  const stripeMatRef = useRef(null);
  const [hovered, setHovered] = useState(null);

  // ── 3D scene (built once; colors updated via refs on team change) ─────────
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const W = container.clientWidth;
    const H = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 1000);
    camera.position.z = 4.2;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const ballGroup = new THREE.Group();
    scene.add(ballGroup);

    const R = 1.25;
    const SR = R + 0.02;

    const sphereMat = new THREE.MeshPhongMaterial({
      color: new THREE.Color(team.color), emissive: new THREE.Color(team.color).multiplyScalar(0.25),
      specular: 0xFFAA66, shininess: 50, transparent: true, opacity: 0.58,
      side: THREE.DoubleSide, depthWrite: false,
    });
    sphereMatRef.current = sphereMat;
    ballGroup.add(new THREE.Mesh(new THREE.SphereGeometry(R, 96, 96), sphereMat));

    const glowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(team.color), transparent: true, opacity: 0.1, depthWrite: false });
    glowMatRef.current = glowMat;
    ballGroup.add(new THREE.Mesh(new THREE.SphereGeometry(R * 0.96, 32, 32), glowMat));

    const seamMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const eqPts = [];
    for (let j = 0; j <= 256; j++) {
      const a = (j / 256) * Math.PI * 2;
      eqPts.push(new THREE.Vector3(SR * Math.cos(a), 0, SR * Math.sin(a)));
    }
    ballGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(eqPts, true), 256, 0.022, 6, true), seamMat));

    const peanut = (phase) => {
      const pts = [];
      const N = 512;
      for (let j = 0; j <= N; j++) {
        const phi = (j / N) * Math.PI * 2;
        const theta = phase + (Math.PI / 4) * Math.sin(2 * phi);
        pts.push(new THREE.Vector3(SR * Math.sin(phi) * Math.cos(theta), SR * Math.cos(phi), SR * Math.sin(phi) * Math.sin(theta)));
      }
      return pts;
    };
    [0, Math.PI / 2].forEach((phase) => {
      ballGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(peanut(phase), true), 512, 0.022, 6, true), seamMat));
    });

    const stripeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(team.secondary) });
    stripeMatRef.current = stripeMat;
    [-0.62, -0.3, 0.3, 0.62].forEach((y) => {
      const rr = Math.sqrt(Math.max(0, R * R - y * y)) + 0.024;
      const pts = [];
      for (let j = 0; j <= 256; j++) {
        const a = (j / 256) * Math.PI * 2;
        pts.push(new THREE.Vector3(rr * Math.cos(a), y, rr * Math.sin(a)));
      }
      ballGroup.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 256, 0.014, 6, true), stripeMat));
    });

    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.2 }));
    hl.position.set(0.55, 0.7, 0.85);
    ballGroup.add(hl);

    scene.add(new THREE.AmbientLight(0xFFEECC, 0.55));
    const key = new THREE.PointLight(0xFFDDAA, 3.0, 30); key.position.set(4, 5, 5); scene.add(key);
    const fill = new THREE.PointLight(0xFF4400, 1.2, 20); fill.position.set(-4, -2, 3); scene.add(fill);
    const rim = new THREE.PointLight(0xFFFFFF, 0.9, 15); rim.position.set(0, 5, -4); scene.add(rim);

    // ── drag-to-rotate ────────────────────────────────────────────────────
    const drag = { active: false, x: 0, y: 0, rx: 0, ry: 0 };
    const onDown = (e) => { drag.active = true; drag.x = e.clientX; drag.y = e.clientY; };
    const onMove = (e) => {
      if (!drag.active) return;
      drag.ry += (e.clientX - drag.x) * 0.01;
      drag.rx += (e.clientY - drag.y) * 0.01;
      drag.x = e.clientX; drag.y = e.clientY;
    };
    const onUp = () => { drag.active = false; };
    renderer.domElement.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    let id;
    const clock = new THREE.Clock();
    const animate = () => {
      id = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      ballGroup.rotation.y = t * 0.18 + drag.ry;
      ballGroup.rotation.x = Math.sin(t * 0.35) * 0.1 + drag.rx;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      sphereMatRef.current = null; glowMatRef.current = null; stripeMatRef.current = null;
    };
  }, []);

  // ── live color updates ───────────────────────────────────────────────────
  useEffect(() => {
    if (!sphereMatRef.current) return;
    const c = new THREE.Color(team.color);
    sphereMatRef.current.color = c;
    sphereMatRef.current.emissive = c.clone().multiplyScalar(0.25);
    if (glowMatRef.current) glowMatRef.current.color = c.clone();
    if (stripeMatRef.current) stripeMatRef.current.color = new THREE.Color(team.secondary);
  }, [team.color, team.secondary]);

  // ── branching stat chips ──────────────────────────────────────────────────
  const chips = IDENTITY_AXES.map((a, i) => {
    const angle = (-90 + i * 60) * Math.PI / 180;
    return {
      ...a, key: a.key, value: team.identity[a.key], color: AXIS_COLORS[a.key],
      x: 50 + 47 * Math.cos(angle), y: 50 + 47 * Math.sin(angle),
    };
  });

  return (
    <div className="relative w-full h-full select-none" style={{ minHeight: 360 }}>
      {/* 3D ball */}
      <div
        ref={mountRef}
        onDoubleClick={onToggle}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
        title="Drag to rotate · double-click to toggle branches"
      />

      {/* branch lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
        {chips.map((c) => (
          <line key={c.key} x1="50" y1="50" x2={c.x} y2={c.y}
            stroke={c.color} strokeOpacity={0.4} strokeWidth={0.25} strokeDasharray="0.6 0.4" />
        ))}
      </svg>

      {/* stat chips */}
      <AnimatePresence>
        {expanded && chips.map((c, i) => (
          <motion.button
            key={c.key}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            onMouseEnter={() => setHovered(c.key)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onChipClick(c.key)}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-xl px-2.5 py-1.5 backdrop-blur-md text-center transition-transform hover:scale-110"
            style={{
              left: `${c.x}%`, top: `${c.y}%`,
              background: 'rgba(10,10,20,0.78)',
              border: `1px solid ${hovered === c.key ? c.color : 'rgba(255,255,255,0.15)'}`,
              boxShadow: hovered === c.key ? `0 0 18px ${c.color}66` : 'none',
            }}
          >
            <span className="block text-[9px] font-ui tracking-[0.18em] uppercase" style={{ color: c.color }}>{c.label}</span>
            <span className="block text-sm font-ui font-black text-white leading-none mt-0.5">{c.value}</span>
          </motion.button>
        ))}
      </AnimatePresence>

      {/* center toggle hint */}
      <button
        onClick={onToggle}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/20 bg-black/30 backdrop-blur-sm flex items-center justify-center z-10 hover:bg-black/50 transition"
        title="Toggle stat branches"
      >
        <span className="text-white/70 text-xs font-ui">{expanded ? '–' : '+'}</span>
      </button>
    </div>
  );
}
