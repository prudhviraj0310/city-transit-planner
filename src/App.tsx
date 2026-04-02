import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Cityscape from '@/components/Cityscape';
import RoutePlanner from '@/components/RoutePlanner';
import { TextColor } from '@/components/ui/text-color';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [showPlanner, setShowPlanner] = useState(false);
  const plannerSectionRef = useRef<HTMLDivElement>(null);
  const featureSectionRef = useRef<HTMLDivElement>(null);

  function handleEnterPlanner() {
    setShowPlanner(true);
    setTimeout(() => {
      plannerSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  // Scroll-driven reveals
  useEffect(() => {
    if (!showPlanner) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.section-reveal').forEach((el) => {
        gsap.to(el, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        });
      });
    });

    return () => ctx.revert();
  }, [showPlanner]);

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ═══ HERO: ANIMATED CITYSCAPE ═══ */}
      <Cityscape onEnter={handleEnterPlanner} />

      {/* ═══ ROUTE PLANNER ═══ */}
      {showPlanner && (
        <>
          <div ref={plannerSectionRef} style={{
            background: 'linear-gradient(180deg, #0a0e1a 0%, #0d1321 100%)',
            minHeight: '100vh',
          }}>
            <RoutePlanner />
          </div>

          {/* ═══ FEATURES SECTION ═══ */}
          <div ref={featureSectionRef} style={{
            background: 'linear-gradient(180deg, #0d1321 0%, #0a0e1a 100%)',
            padding: '80px 20px 120px',
          }}>
            {/* TextColor component showcase */}
            <div className="section-reveal" style={{ maxWidth: 900, margin: '0 auto 80px' }}>
              <TextColor />
            </div>

            {/* Feature cards */}
            <div className="section-reveal" style={{ maxWidth: 900, margin: '0 auto' }}>
              <h2 style={{
                textAlign: 'center', fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 700,
                background: 'linear-gradient(135deg, #e2e8f0, #818cf8)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                marginBottom: 48,
              }}>
                Why City Transit?
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
                {[
                  {
                    icon: '🧠',
                    title: 'AI-Powered Routing',
                    desc: 'Our AI learns your preferences and suggests optimal routes based on speed, cost, and comfort.',
                    gradient: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))',
                    border: 'rgba(99,102,241,0.2)',
                  },
                  {
                    icon: '⚡',
                    title: 'Real-Time Congestion',
                    desc: 'Live traffic simulation adjusts travel times during peak hours so you always know what to expect.',
                    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(249,115,22,0.05))',
                    border: 'rgba(245,158,11,0.2)',
                  },
                  {
                    icon: '🌱',
                    title: 'Carbon Footprint',
                    desc: 'See the environmental impact of each route. Choose green options and reduce your carbon footprint.',
                    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.05))',
                    border: 'rgba(16,185,129,0.2)',
                  },
                  {
                    icon: '♿',
                    title: 'Accessibility Mode',
                    desc: 'Filter for wheelchair-friendly routes with accessible vehicles and stations.',
                    gradient: 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(99,102,241,0.05))',
                    border: 'rgba(6,182,212,0.2)',
                  },
                  {
                    icon: '📊',
                    title: 'Smart Comparisons',
                    desc: 'Compare fastest vs cheapest vs eco-friendly routes side by side with detailed breakdowns.',
                    gradient: 'linear-gradient(135deg, rgba(244,63,94,0.1), rgba(251,113,133,0.05))',
                    border: 'rgba(244,63,94,0.2)',
                  },
                  {
                    icon: '📜',
                    title: 'Route History',
                    desc: 'Your recent journeys are saved locally. Quickly re-plan frequent routes with one click.',
                    gradient: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(168,85,247,0.05))',
                    border: 'rgba(139,92,246,0.2)',
                  },
                ].map((feature, i) => (
                  <div
                    key={i}
                    className="section-reveal"
                    style={{
                      background: feature.gradient,
                      border: `1px solid ${feature.border}`,
                      borderRadius: 16,
                      padding: 24,
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      cursor: 'default',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: 12 }}>{feature.icon}</div>
                    <h3 style={{ color: '#e2e8f0', fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>
                      {feature.title}
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6 }}>
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div style={{
              maxWidth: 900, margin: '80px auto 0', textAlign: 'center',
              padding: '32px 0', borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
              <p style={{ color: '#475569', fontSize: '0.85rem' }}>
                City Transit Planner • Built with React, GSAP & TypeScript
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
