import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import Cityscape from '@/components/Cityscape';
import RoutePlanner from '@/components/RoutePlanner';

export default function App() {
  const plannerSectionRef = useRef<HTMLDivElement>(null);

  function handleEnterPlanner() {
    setTimeout(() => {
      plannerSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  // Animate feature cards on mount
  useEffect(() => {
    const cards = document.querySelectorAll('.feature-card');
    gsap.from(cards, { y: 40, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.3 });
  }, []);

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ═══ HERO: ANIMATED CITYSCAPE ═══ */}
      <Cityscape onEnter={handleEnterPlanner} />

      {/* ═══ ROUTE PLANNER ═══ */}
      <div ref={plannerSectionRef} style={{
        background: '#111827',
        minHeight: '100vh',
      }}>
        <RoutePlanner />
      </div>

          {/* ═══ FEATURES SECTION ═══ */}
          <div style={{
            background: '#111827',
            padding: '80px 20px 120px',
          }}>
            {/* Feature cards */}
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
              <h2 style={{
                textAlign: 'center', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800,
                color: '#ffffff',
                marginBottom: 48,
              }}>
                Why City Transit?
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                {[
                  {
                    icon: '🧠', title: 'AI-Powered Routing',
                    desc: 'Our AI learns your preferences and suggests optimal routes based on speed, cost, and comfort.',
                    color: '#6366f1',
                  },
                  {
                    icon: '⚡', title: 'Real-Time Congestion',
                    desc: 'Live traffic simulation adjusts travel times during peak hours so you always know what to expect.',
                    color: '#f59e0b',
                  },
                  {
                    icon: '🌱', title: 'Carbon Footprint',
                    desc: 'See the environmental impact of each route. Choose green options and reduce your carbon footprint.',
                    color: '#10b981',
                  },
                  {
                    icon: '♿', title: 'Accessibility Mode',
                    desc: 'Filter for wheelchair-friendly routes with accessible vehicles and stations.',
                    color: '#06b6d4',
                  },
                  {
                    icon: '📊', title: 'Smart Comparisons',
                    desc: 'Compare fastest vs cheapest vs eco-friendly routes side by side with detailed breakdowns.',
                    color: '#f43f5e',
                  },
                  {
                    icon: '📜', title: 'Route History',
                    desc: 'Your recent journeys are saved locally. Quickly re-plan frequent routes with one click.',
                    color: '#8b5cf6',
                  },
                ].map((feature, i) => (
                  <div key={i} className="feature-card" style={{
                    background: '#ffffff',
                    borderRadius: 16,
                    padding: 28,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    transition: 'transform 0.3s ease',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: `${feature.color}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.5rem', marginBottom: 16,
                    }}>{feature.icon}</div>
                    <h3 style={{ color: '#1e293b', fontSize: '1.15rem', fontWeight: 700, marginBottom: 8 }}>
                      {feature.title}
                    </h3>
                    <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.7 }}>
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div style={{
              maxWidth: 900, margin: '80px auto 0', textAlign: 'center',
              padding: '32px 0', borderTop: '1px solid rgba(255,255,255,0.15)',
            }}>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                City Transit Planner • Built with React, GSAP & TypeScript
              </p>
            </div>
          </div>
    </div>
  );
}
