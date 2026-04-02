import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// ═══════════ SVG CITY SCENE WITH GSAP ═══════════
export default function Cityscape({ onEnter }: { onEnter: () => void }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const enteredRef = useRef(false);

  // Scroll/wheel detection to trigger planner
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 30 && !enteredRef.current) {
        enteredRef.current = true;
        onEnter();
      }
    };
    const handleTouch = (() => {
      let startY = 0;
      return {
        start: (e: TouchEvent) => { startY = e.touches[0].clientY; },
        end: (e: TouchEvent) => {
          if (startY - e.changedTouches[0].clientY > 50 && !enteredRef.current) {
            enteredRef.current = true;
            onEnter();
          }
        },
      };
    })();
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouch.start, { passive: true });
    window.addEventListener('touchend', handleTouch.end, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouch.start);
      window.removeEventListener('touchend', handleTouch.end);
    };
  }, [onEnter]);

  useEffect(() => {
    if (!sceneRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1 });
      tlRef.current = tl;

      // Twinkle stars
      gsap.utils.toArray<HTMLElement>('.star').forEach((star, i) => {
        gsap.to(star, {
          opacity: gsap.utils.random(0.3, 1),
          duration: gsap.utils.random(1.5, 4),
          repeat: -1,
          yoyo: true,
          delay: i * 0.15,
          ease: 'sine.inOut',
        });
      });

      // Move vehicles left to right (lane 1)
      gsap.utils.toArray<HTMLElement>('.vehicle-right').forEach((v) => {
        gsap.fromTo(v,
          { x: -200 },
          { x: window.innerWidth + 200, duration: gsap.utils.random(6, 12), repeat: -1, ease: 'none', delay: gsap.utils.random(0, 5) }
        );
      });

      // Move vehicles right to left (lane 2)
      gsap.utils.toArray<HTMLElement>('.vehicle-left').forEach((v) => {
        gsap.fromTo(v,
          { x: window.innerWidth + 200 },
          { x: -200, duration: gsap.utils.random(7, 14), repeat: -1, ease: 'none', delay: gsap.utils.random(0, 5) }
        );
      });

      // Bikes
      gsap.utils.toArray<HTMLElement>('.bike-anim').forEach((b) => {
        gsap.fromTo(b,
          { x: -100 },
          { x: window.innerWidth + 100, duration: gsap.utils.random(10, 18), repeat: -1, ease: 'none', delay: gsap.utils.random(0, 8) }
        );
      });

      // People walking
      gsap.utils.toArray<HTMLElement>('.person-walk').forEach((p) => {
        gsap.fromTo(p,
          { x: -50 },
          { x: window.innerWidth + 50, duration: gsap.utils.random(18, 30), repeat: -1, ease: 'none', delay: gsap.utils.random(0, 12) }
        );
      });

      // Trees sway
      gsap.utils.toArray<HTMLElement>('.tree-sway').forEach((t) => {
        gsap.to(t, {
          rotation: gsap.utils.random(-3, 3),
          transformOrigin: 'bottom center',
          duration: gsap.utils.random(2, 4),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: gsap.utils.random(0, 2),
        });
      });

      // Traffic light cycle
      const lights = sceneRef.current!.querySelectorAll('.tl-red, .tl-yellow, .tl-green');
      if (lights.length >= 3) {
        const tlCycle = gsap.timeline({ repeat: -1 });
        tlCycle.to(lights[2], { opacity: 1, duration: 0.3 })
          .to(lights[2], { opacity: 0.2, duration: 0.3, delay: 3 })
          .to(lights[1], { opacity: 1, duration: 0.3 })
          .to(lights[1], { opacity: 0.2, duration: 0.3, delay: 1.5 })
          .to(lights[0], { opacity: 1, duration: 0.3 })
          .to(lights[0], { opacity: 0.2, duration: 0.3, delay: 3 });
      }

      // Clouds drift
      gsap.utils.toArray<HTMLElement>('.cloud').forEach((c, i) => {
        gsap.fromTo(c,
          { x: -300 },
          { x: window.innerWidth + 300, duration: gsap.utils.random(40, 80), repeat: -1, ease: 'none', delay: i * 12 }
        );
      });

      // Scene entrance
      gsap.from('.city-title', { y: 60, opacity: 0, duration: 1.2, ease: 'power3.out', delay: 0.5 });
      gsap.from('.city-subtitle', { y: 40, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.9 });
      gsap.from('.cta-btn', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 1.3 });

    }, sceneRef);

    return () => ctx.revert();
  }, []);

  // Generate stars
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 55}%`,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 4,
  }));

  // Building configs
  const buildings = [
    { left: '2%', w: 45, h: 180, color: '#1a2744', windows: 8 },
    { left: '6%', w: 35, h: 240, color: '#162038', windows: 10 },
    { left: '11%', w: 50, h: 160, color: '#1e2d4a', windows: 6 },
    { left: '16%', w: 30, h: 280, color: '#152240', windows: 12 },
    { left: '20%', w: 55, h: 200, color: '#1a2844', windows: 8 },
    { left: '26%', w: 40, h: 320, color: '#131d36', windows: 14 },
    { left: '31%', w: 48, h: 190, color: '#1c2e4e', windows: 7 },
    { left: '36%', w: 35, h: 260, color: '#162440', windows: 11 },
    { left: '40%', w: 60, h: 150, color: '#1e3050', windows: 5 },
    { left: '46%', w: 38, h: 300, color: '#141f3a', windows: 13 },
    { left: '51%', w: 42, h: 220, color: '#192742', windows: 9 },
    { left: '56%', w: 50, h: 170, color: '#1b2c48', windows: 6 },
    { left: '61%', w: 32, h: 290, color: '#152040', windows: 12 },
    { left: '65%', w: 55, h: 210, color: '#1a2946', windows: 8 },
    { left: '71%', w: 40, h: 250, color: '#162338', windows: 10 },
    { left: '76%', w: 48, h: 180, color: '#1e2f4c', windows: 7 },
    { left: '81%', w: 35, h: 310, color: '#131e38', windows: 13 },
    { left: '85%', w: 55, h: 195, color: '#1a2a44', windows: 8 },
    { left: '91%', w: 42, h: 270, color: '#15223e', windows: 11 },
    { left: '95%', w: 38, h: 160, color: '#1c2d4a', windows: 6 },
  ];

  const roadLines = Array.from({ length: 25 }, (_, i) => ({
    left: `${i * 4.2}%`,
  }));

  return (
    <div ref={sceneRef} className="city-scene" style={{ position: 'relative' }}>
      {/* ═══ STARS ═══ */}
      <div className="stars-layer">
        {stars.map(s => (
          <div key={s.id} className="star" style={{
            left: s.left, top: s.top,
            width: s.size, height: s.size,
            animationDelay: `${s.delay}s`,
          }} />
        ))}
      </div>

      {/* ═══ CLOUDS ═══ */}
      {[0, 1, 2].map(i => (
        <svg key={i} className="cloud" style={{ position: 'absolute', top: `${8 + i * 7}%`, opacity: 0.06, zIndex: 1 }} width="160" height="60" viewBox="0 0 160 60">
          <ellipse cx="80" cy="40" rx="70" ry="18" fill="#94a3b8" />
          <ellipse cx="55" cy="30" rx="40" ry="20" fill="#94a3b8" />
          <ellipse cx="105" cy="32" rx="35" ry="16" fill="#94a3b8" />
        </svg>
      ))}

      {/* ═══ MOON ═══ */}
      <div style={{
        position: 'absolute', top: '8%', right: '12%', width: 50, height: 50,
        borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #f1f5f9, #cbd5e1)',
        boxShadow: '0 0 40px rgba(241,245,249,0.3), 0 0 80px rgba(241,245,249,0.1)',
        zIndex: 1,
      }} />

      {/* ═══ BUILDINGS ═══ */}
      {buildings.map((b, i) => (
        <div key={i} className="building" style={{
          left: b.left, width: b.w, height: b.h,
          background: `linear-gradient(180deg, ${b.color} 0%, ${b.color}dd 100%)`,
          zIndex: 5,
        }}>
          {Array.from({ length: b.windows }, (_, wi) => {
            const col = wi % 3;
            const row = Math.floor(wi / 3);
            const lit = Math.random() > 0.35;
            return (
              <div key={wi} className="building-window" style={{
                left: 6 + col * (b.w > 40 ? 14 : 10),
                top: 10 + row * 22,
                background: lit
                  ? `rgba(${Math.random() > 0.5 ? '251,191,36' : '99,102,241'}, ${Math.random() * 0.6 + 0.3})`
                  : 'rgba(30,41,59,0.5)',
              }} />
            );
          })}
          {/* Antenna on tall buildings */}
          {b.h > 250 && (
            <div style={{
              position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)',
              width: 2, height: 20, background: '#475569',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: -2, width: 6, height: 6,
                borderRadius: '50%', background: '#ef4444',
                animation: 'twinkle 1.5s ease-in-out infinite',
              }} />
            </div>
          )}
        </div>
      ))}

      {/* ═══ TREES ═══ */}
      {[8, 22, 38, 55, 68, 82, 93].map((pos, i) => (
        <div key={i} className="tree tree-sway" style={{ left: `${pos}%`, bottom: 100, zIndex: 8 }}>
          <div className="tree-trunk" style={{ height: 18 + Math.random() * 8 }} />
          <div className="tree-crown" style={{
            width: 22 + Math.random() * 12,
            height: 22 + Math.random() * 12,
            background: `radial-gradient(circle, #16a34a, #15803d)`,
            bottom: 16 + Math.random() * 6,
          }} />
        </div>
      ))}

      {/* ═══ SIDEWALK ═══ */}
      <div className="sidewalk" />

      {/* ═══ ROAD ═══ */}
      <div className="road">
        {roadLines.map((rl, i) => (
          <div key={i} className="road-line" style={{ left: rl.left }} />
        ))}
      </div>

      {/* ═══ VEHICLES LANE 1 (RIGHT) ═══ */}
      {/* Car 1 */}
      <svg className="vehicle-right" style={{ position: 'absolute', bottom: 30, zIndex: 15 }} width="60" height="30" viewBox="0 0 60 30">
        <rect x="5" y="12" width="50" height="14" rx="3" fill="#ef4444" />
        <rect x="12" y="4" width="30" height="12" rx="3" fill="#dc2626" />
        <rect x="14" y="6" width="11" height="8" rx="1" fill="rgba(147,197,253,0.5)" />
        <rect x="28" y="6" width="11" height="8" rx="1" fill="rgba(147,197,253,0.5)" />
        <circle cx="15" cy="27" r="4" fill="#1e293b" /><circle cx="15" cy="27" r="2" fill="#64748b" />
        <circle cx="45" cy="27" r="4" fill="#1e293b" /><circle cx="45" cy="27" r="2" fill="#64748b" />
        <rect x="52" y="15" width="4" height="3" rx="1" fill="#fbbf24" opacity="0.8" />
      </svg>

      {/* Bus */}
      <svg className="vehicle-right" style={{ position: 'absolute', bottom: 30, zIndex: 15 }} width="90" height="40" viewBox="0 0 90 40">
        <rect x="3" y="5" width="84" height="28" rx="4" fill="#16a34a" />
        <rect x="6" y="8" width="12" height="10" rx="2" fill="rgba(147,197,253,0.4)" />
        <rect x="22" y="8" width="12" height="10" rx="2" fill="rgba(147,197,253,0.4)" />
        <rect x="38" y="8" width="12" height="10" rx="2" fill="rgba(147,197,253,0.4)" />
        <rect x="54" y="8" width="12" height="10" rx="2" fill="rgba(147,197,253,0.4)" />
        <rect x="70" y="8" width="12" height="10" rx="2" fill="rgba(147,197,253,0.4)" />
        <text x="45" y="28" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">CITY BUS</text>
        <circle cx="18" cy="35" r="5" fill="#1e293b" /><circle cx="18" cy="35" r="2.5" fill="#64748b" />
        <circle cx="72" cy="35" r="5" fill="#1e293b" /><circle cx="72" cy="35" r="2.5" fill="#64748b" />
        <rect x="84" y="10" width="4" height="5" rx="1" fill="#fbbf24" opacity="0.8" />
      </svg>

      {/* Car 2 */}
      <svg className="vehicle-right" style={{ position: 'absolute', bottom: 32, zIndex: 15 }} width="55" height="28" viewBox="0 0 55 28">
        <rect x="4" y="10" width="46" height="13" rx="3" fill="#3b82f6" />
        <rect x="10" y="3" width="28" height="11" rx="3" fill="#2563eb" />
        <rect x="13" y="5" width="10" height="7" rx="1" fill="rgba(147,197,253,0.5)" />
        <rect x="26" y="5" width="10" height="7" rx="1" fill="rgba(147,197,253,0.5)" />
        <circle cx="14" cy="25" r="4" fill="#1e293b" /><circle cx="14" cy="25" r="2" fill="#64748b" />
        <circle cx="40" cy="25" r="4" fill="#1e293b" /><circle cx="40" cy="25" r="2" fill="#64748b" />
      </svg>

      {/* ═══ VEHICLES LANE 2 (LEFT) ═══ */}
      <svg className="vehicle-left" style={{ position: 'absolute', bottom: 46, zIndex: 14 }} width="55" height="26" viewBox="0 0 55 26">
        <rect x="4" y="8" width="46" height="12" rx="3" fill="#f59e0b" />
        <rect x="14" y="2" width="24" height="10" rx="3" fill="#d97706" />
        <rect x="16" y="4" width="8" height="6" rx="1" fill="rgba(147,197,253,0.4)" />
        <rect x="27" y="4" width="8" height="6" rx="1" fill="rgba(147,197,253,0.4)" />
        <circle cx="14" cy="22" r="3.5" fill="#1e293b" /><circle cx="14" cy="22" r="1.8" fill="#64748b" />
        <circle cx="40" cy="22" r="3.5" fill="#1e293b" /><circle cx="40" cy="22" r="1.8" fill="#64748b" />
      </svg>

      {/* Auto rickshaw */}
      <svg className="vehicle-left" style={{ position: 'absolute', bottom: 44, zIndex: 14 }} width="40" height="28" viewBox="0 0 40 28">
        <rect x="5" y="6" width="30" height="16" rx="4" fill="#facc15" />
        <rect x="8" y="8" width="10" height="8" rx="2" fill="rgba(147,197,253,0.4)" />
        <circle cx="10" cy="24" r="3" fill="#1e293b" /><circle cx="10" cy="24" r="1.5" fill="#64748b" />
        <circle cx="30" cy="24" r="3" fill="#1e293b" /><circle cx="30" cy="24" r="1.5" fill="#64748b" />
      </svg>

      {/* ═══ BIKES ═══ */}
      {[0, 1].map(i => (
        <svg key={i} className="bike-anim" style={{ position: 'absolute', bottom: 86, zIndex: 16 }} width="30" height="24" viewBox="0 0 30 24">
          <circle cx="6" cy="18" r="5" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
          <circle cx="24" cy="18" r="5" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="6" y1="18" x2="15" y2="8" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="15" y1="8" x2="24" y2="18" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="15" y1="8" x2="15" y2="4" stroke="#94a3b8" strokeWidth="1.5" />
          <circle cx="15" cy="3" r="2.5" fill={i === 0 ? '#f87171' : '#60a5fa'} />
          <line x1="13" y1="8" x2="17" y2="8" stroke="#94a3b8" strokeWidth="1" />
        </svg>
      ))}

      {/* ═══ PEOPLE ═══ */}
      {[0, 1, 2, 3].map(i => (
        <svg key={i} className="person-walk" style={{ position: 'absolute', bottom: 98, zIndex: 12 }} width="14" height="28" viewBox="0 0 14 28">
          <circle cx="7" cy="4" r="3.5" fill={['#f87171', '#60a5fa', '#a78bfa', '#34d399'][i]} />
          <rect x="4" y="8" width="6" height="10" rx="2" fill={['#ef4444', '#3b82f6', '#8b5cf6', '#10b981'][i]} />
          <line x1="5" y1="18" x2="3" y2="27" stroke={['#ef4444', '#3b82f6', '#8b5cf6', '#10b981'][i]} strokeWidth="2" strokeLinecap="round" />
          <line x1="9" y1="18" x2="11" y2="27" stroke={['#ef4444', '#3b82f6', '#8b5cf6', '#10b981'][i]} strokeWidth="2" strokeLinecap="round" />
        </svg>
      ))}

      {/* ═══ TRAFFIC LIGHT ═══ */}
      <div className="traffic-light" style={{ left: '48%' }}>
        <div style={{ width: 6, height: 50, background: '#475569', margin: '0 auto' }} />
        <div style={{
          width: 18, height: 42, background: '#1e293b', borderRadius: 4,
          position: 'absolute', bottom: 50, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '4px 0',
          border: '1px solid #334155',
        }}>
          <div className="tl-red" style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', opacity: 0.2 }} />
          <div className="tl-yellow" style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbbf24', opacity: 0.2 }} />
          <div className="tl-green" style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', opacity: 1 }} />
        </div>
      </div>

      {/* ═══ TITLE OVERLAY ═══ */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        textAlign: 'center', zIndex: 30, width: '90%', maxWidth: 700,
      }}>
        <h1 className="city-title" style={{
          fontSize: 'clamp(2.2rem, 6vw, 4.5rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          background: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 50%, #6366f1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 16,
        }}>
          City Transit Planner
        </h1>
        <p className="city-subtitle" style={{
          fontSize: 'clamp(0.9rem, 2vw, 1.2rem)',
          color: '#94a3b8',
          marginBottom: 32,
          lineHeight: 1.6,
        }}>
          Smart routes • Real-time congestion • Multi-modal journeys
        </p>
        <button className="cta-btn btn-plan pulse-glow" onClick={onEnter} style={{ maxWidth: 320, margin: '0 auto' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            🚀 Plan Your Route
          </span>
        </button>
      </div>

      {/* ═══ SCROLL CTA ═══ */}
      <div className="scroll-cta" onClick={onEnter}>
        <span style={{ color: '#64748b', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Scroll to explore
        </span>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 4v12M4 12l6 6 6-6" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
