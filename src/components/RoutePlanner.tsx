import { useState, useRef, useEffect, useMemo } from 'react';
import gsap from 'gsap';
import { LOCATIONS, TRANSPORT_MODES, isPeakHour, getCongestionLabel, getCongestionColor, type TransportMode } from '@/data/city-data';
import { findAllRoutes, aiSuggestRoute, type RouteResult, type Preference } from '@/lib/router';
import { saveToHistory, getHistory, clearHistory, getPreferenceFromHistory, type HistoryEntry } from '@/lib/history';
import { MapPin, Navigation, Clock, DollarSign, Leaf, Zap, ArrowRight, History, Trash2, Sparkles, Accessibility, ChevronDown, TrendingUp, Wind } from 'lucide-react';

export default function RoutePlanner() {
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');
  const [showFromDrop, setShowFromDrop] = useState(false);
  const [showToDrop, setShowToDrop] = useState(false);
  const [routes, setRoutes] = useState<RouteResult[]>([]);
  const [aiPick, setAiPick] = useState<RouteResult | null>(null);
  const [preference, setPreference] = useState<Preference>('fastest');
  const [peakMode, setPeakMode] = useState(isPeakHour());
  const [accessibleOnly, setAccessibleOnly] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>(getHistory());
  const [searched, setSearched] = useState(false);

  const plannerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Animate in
  useEffect(() => {
    if (plannerRef.current) {
      gsap.from(plannerRef.current, { y: 60, opacity: 0, duration: 0.8, ease: 'power3.out' });
    }
  }, []);

  // Filtered locations for autocomplete
  const fromSuggestions = useMemo(() =>
    LOCATIONS.filter(l => l.name.toLowerCase().includes(fromSearch.toLowerCase()) && l.id !== toId).slice(0, 6),
    [fromSearch, toId]
  );

  const toSuggestions = useMemo(() =>
    LOCATIONS.filter(l => l.name.toLowerCase().includes(toSearch.toLowerCase()) && l.id !== fromId).slice(0, 6),
    [toSearch, fromId]
  );

  function handlePlanRoute() {
    if (!fromId || !toId) return;
    const allRoutes = findAllRoutes(fromId, toId, peakMode, accessibleOnly);
    setRoutes(allRoutes);
    setSearched(true);

    const suggested = aiSuggestRoute(allRoutes, preference);
    setAiPick(suggested);

    // Save to history
    if (allRoutes.length > 0) {
      const best = suggested || allRoutes[0];
      const fromLoc = LOCATIONS.find(l => l.id === fromId)!;
      const toLoc = LOCATIONS.find(l => l.id === toId)!;
      saveToHistory({
        id: best.id,
        fromId, fromName: fromLoc.name,
        toId, toName: toLoc.name,
        mode: best.mode.name,
        time: best.totalTime,
        fare: best.totalFare,
        timestamp: Date.now(),
      });
      setHistory(getHistory());
    }

    // Animate results
    setTimeout(() => {
      if (resultsRef.current) {
        gsap.from(resultsRef.current.children, {
          y: 40, opacity: 0, duration: 0.5, stagger: 0.12, ease: 'power3.out',
        });
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  function swapLocations() {
    setFromId(toId);
    setToId(fromId);
    setFromSearch(toSearch);
    setToSearch(fromSearch);
    setRoutes([]);
    setSearched(false);
  }

  function loadHistoryEntry(entry: HistoryEntry) {
    setFromId(entry.fromId);
    setToId(entry.toId);
    setFromSearch(entry.fromName);
    setToSearch(entry.toName);
    setShowHistory(false);
  }

  const prefOptions: { id: Preference; label: string; icon: React.ReactNode }[] = [
    { id: 'fastest', label: 'Fastest', icon: <Zap size={14} /> },
    { id: 'cheapest', label: 'Cheapest', icon: <DollarSign size={14} /> },
    { id: 'eco', label: 'Eco', icon: <Leaf size={14} /> },
    { id: 'comfortable', label: 'Comfort', icon: <Sparkles size={14} /> },
  ];

  return (
    <div ref={plannerRef} style={{ maxWidth: 900, margin: '0 auto', padding: '60px 20px 100px' }}>
      {/* ═══ HEADER ═══ */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: '#fff', marginBottom: 12, textShadow: '0 2px 20px rgba(99,102,241,0.5)' }}>
          🚀 Plan Your Journey
        </h2>
        <p style={{ color: '#e2e8f0', fontSize: '1.1rem', textShadow: '0 1px 10px rgba(0,0,0,0.5)' }}>Compare routes across Indian cities — metro, bus, auto, bike & walking</p>
      </div>

      {/* ═══ LIGHT CARD FORM ═══ */}
      <div style={{
        borderRadius: 20, padding: '36px 32px', marginBottom: 24,
        background: '#ffffff',
        backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)',
      }}>
        {/* FROM */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <label style={{ display: 'block', color: '#1e293b', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>From</label>
          <MapPin size={18} style={{ position: 'absolute', left: 14, bottom: 14, color: '#10b981', zIndex: 2 }} />
          <input id="input-from" placeholder="Search city (e.g. Hyderabad, Chennai)..."
            value={fromSearch}
            onChange={e => { setFromSearch(e.target.value); setShowFromDrop(true); setFromId(''); }}
            onFocus={() => setShowFromDrop(true)}
            onBlur={() => setTimeout(() => setShowFromDrop(false), 200)}
            style={{
              width: '100%', padding: '14px 16px 14px 44px',
              background: '#f1f5f9', border: '2px solid #cbd5e1', borderRadius: 12,
              color: '#0f172a', fontSize: '1rem', fontFamily: 'inherit', outline: 'none',
            }}
          />
          {showFromDrop && fromSearch && fromSuggestions.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
              background: '#fff', border: '2px solid #cbd5e1', borderRadius: 12,
              overflow: 'hidden', zIndex: 50, maxHeight: 240, overflowY: 'auto',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            }}>
              {fromSuggestions.map(loc => (
                <div key={loc.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                  cursor: 'pointer', borderBottom: '1px solid #e2e8f0',
                }} onMouseDown={() => { setFromId(loc.id); setFromSearch(loc.name); setShowFromDrop(false); }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                  <MapPin size={14} style={{ color: '#10b981' }} />
                  <div>
                    <div style={{ color: '#0f172a', fontSize: '0.9rem', fontWeight: 500 }}>{loc.name}</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Zone {loc.zone} • {loc.type.replace('_', ' ')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SWAP */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <button onClick={swapLocations} style={{
            width: 40, height: 40, borderRadius: '50%', border: '2px solid #cbd5e1',
            background: '#f1f5f9', color: '#6366f1', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
          }}>⇅</button>
        </div>

        {/* TO */}
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <label style={{ display: 'block', color: '#1e293b', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>To</label>
          <Navigation size={18} style={{ position: 'absolute', left: 14, bottom: 14, color: '#f43f5e', zIndex: 2 }} />
          <input id="input-to" placeholder="Search destination city..."
            value={toSearch}
            onChange={e => { setToSearch(e.target.value); setShowToDrop(true); setToId(''); }}
            onFocus={() => setShowToDrop(true)}
            onBlur={() => setTimeout(() => setShowToDrop(false), 200)}
            style={{
              width: '100%', padding: '14px 16px 14px 44px',
              background: '#f1f5f9', border: '2px solid #cbd5e1', borderRadius: 12,
              color: '#0f172a', fontSize: '1rem', fontFamily: 'inherit', outline: 'none',
            }}
          />
          {showToDrop && toSearch && toSuggestions.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
              background: '#fff', border: '2px solid #cbd5e1', borderRadius: 12,
              overflow: 'hidden', zIndex: 50, maxHeight: 240, overflowY: 'auto',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            }}>
              {toSuggestions.map(loc => (
                <div key={loc.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                  cursor: 'pointer', borderBottom: '1px solid #e2e8f0',
                }} onMouseDown={() => { setToId(loc.id); setToSearch(loc.name); setShowToDrop(false); }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                  <Navigation size={14} style={{ color: '#f43f5e' }} />
                  <div>
                    <div style={{ color: '#0f172a', fontSize: '0.9rem', fontWeight: 500 }}>{loc.name}</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Zone {loc.zone} • {loc.type.replace('_', ' ')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PREFERENCES */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: '#334155', fontSize: '0.85rem', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            AI Preference
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {prefOptions.map(p => (
              <button key={p.id} onClick={() => setPreference(p.id)} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', borderRadius: 12, cursor: 'pointer',
                border: preference === p.id ? '2px solid #6366f1' : '2px solid #cbd5e1',
                background: preference === p.id ? '#6366f1' : '#fff',
                color: preference === p.id ? '#fff' : '#334155',
                fontSize: '0.875rem', fontWeight: 600, fontFamily: 'inherit',
              }}>{p.icon} {p.label}</button>
            ))}
          </div>
        </div>

        {/* TOGGLES */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 24 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#334155', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }}>
            <input type="checkbox" checked={peakMode} onChange={e => setPeakMode(e.target.checked)}
              style={{ accentColor: '#6366f1', width: 18, height: 18 }} />
            <TrendingUp size={15} /> Peak Hour Mode
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#334155', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }}>
            <input type="checkbox" checked={accessibleOnly} onChange={e => setAccessibleOnly(e.target.checked)}
              style={{ accentColor: '#6366f1', width: 18, height: 18 }} />
            <Accessibility size={15} /> Wheelchair Accessible
          </label>
        </div>

        {/* BUTTON */}
        <button id="btn-plan-route" onClick={() => {
          if (!fromId || !toId) { alert('Please select both locations from the dropdown suggestions.'); return; }
          handlePlanRoute();
        }} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          width: '100%', padding: '16px 32px',
          background: fromId && toId ? '#6366f1' : '#94a3b8',
          border: 'none', borderRadius: 14, color: '#fff',
          fontSize: '1.1rem', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
        }}>
          {fromId && toId ? '🗺️ Find Routes' : '📍 Type & select locations above'}
        </button>
      </div>

      {/* ═══ HISTORY ═══ */}
      {history.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <button onClick={() => setShowHistory(!showHistory)} style={{
            display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none',
            color: '#64748b', cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'inherit',
          }}>
            <History size={16} /> Recent Routes
            <ChevronDown size={14} style={{ transform: showHistory ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
          </button>
          {showHistory && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {history.slice(0, 5).map((h, i) => (
                <div key={i} className="history-item" onClick={() => loadHistoryEntry(h)}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>
                      {h.fromName} <ArrowRight size={12} style={{ display: 'inline', margin: '0 4px' }} /> {h.toName}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: 4 }}>
                      {h.mode} • {h.time} min • ₹{h.fare}
                    </div>
                  </div>
                  <div style={{ color: '#475569', fontSize: '0.7rem' }}>
                    {new Date(h.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
              <button onClick={() => { clearHistory(); setHistory([]); }} style={{
                display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
                color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit', padding: '8px 0',
              }}>
                <Trash2 size={14} /> Clear History
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══ RESULTS ═══ */}
      {searched && (
        <div ref={resultsRef}>
          {/* AI RECOMMENDATION */}
          {aiPick && (
            <div style={{
              marginBottom: 24, padding: '20px 24px', borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)',
              border: '1px solid rgba(99,102,241,0.25)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Sparkles size={16} style={{ color: '#a5b4fc' }} />
                <span style={{ color: '#a5b4fc', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  AI Recommends
                </span>
              </div>
              <div style={{ color: '#e2e8f0', fontSize: '1.1rem', fontWeight: 600 }}>
                Take the {aiPick.mode.icon} {aiPick.mode.name} — {aiPick.totalTime} min, ₹{aiPick.totalFare}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 4 }}>
                Based on your "{preference}" preference • {aiPick.totalDistance} km • {aiPick.totalCO2}g CO₂
              </div>
            </div>
          )}

          {routes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
              No routes found for this combination. Try different locations.
            </div>
          ) : (
            <>
              <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {routes.length} routes found • {peakMode ? '🔴 Peak hours' : '🟢 Off-peak'}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {routes.map((route, idx) => (
                  <RouteCard key={route.id} route={route} index={idx} isAiPick={aiPick?.id === route.id} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════ ROUTE CARD ═══════════
function RouteCard({ route, index, isAiPick }: { route: RouteResult; index: number; isAiPick: boolean }) {
  const isFastest = route.tags.includes('fastest');
  const isCheapest = route.tags.includes('cheapest');
  const isEco = route.tags.includes('eco');
  const cardClass = isFastest ? 'fastest' : isCheapest ? 'cheapest' : isEco ? 'eco' : '';

  const congLabel = getCongestionLabel(Math.round(route.avgCongestion));
  const congColor = getCongestionColor(Math.round(route.avgCongestion));
  const congPercent = Math.min(((route.avgCongestion + 1) / 3) * 100, 100);

  // Carbon footprint leaves
  const maxCO2 = 500;
  const ecoRating = Math.max(1, 5 - Math.floor((route.totalCO2 / maxCO2) * 5));

  return (
    <div className={`route-card ${cardClass}`} style={isAiPick ? { boxShadow: '0 0 30px rgba(99,102,241,0.15)' } : {}}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: `rgba(${route.mode.color === '#6366f1' ? '99,102,241' : route.mode.color === '#10b981' ? '16,185,129' : route.mode.color === '#f59e0b' ? '245,158,11' : route.mode.color === '#06b6d4' ? '6,182,212' : '139,92,246'}, 0.15)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
          }}>
            {route.mode.icon}
          </div>
          <div>
            <div style={{ color: '#e2e8f0', fontSize: '1.1rem', fontWeight: 600 }}>{route.mode.name}</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{route.totalDistance} km • {route.segments.length} segment{route.segments.length > 1 ? 's' : ''}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {isFastest && <span className="badge badge-fastest"><Zap size={10} /> Fastest</span>}
          {isCheapest && <span className="badge badge-cheapest"><DollarSign size={10} /> Cheapest</span>}
          {isEco && <span className="badge badge-eco"><Leaf size={10} /> Eco</span>}
          {isAiPick && (
            <span className="badge" style={{
              background: 'rgba(99,102,241,0.15)', color: '#a5b4fc',
              border: '1px solid rgba(99,102,241,0.3)',
            }}>
              <Sparkles size={10} /> AI Pick
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 16, marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: '0.75rem', marginBottom: 4 }}>
            <Clock size={12} /> Travel Time
          </div>
          <div style={{ color: '#e2e8f0', fontSize: '1.4rem', fontWeight: 700 }}>{route.totalTime} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#94a3b8' }}>min</span></div>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: '0.75rem', marginBottom: 4 }}>
            <DollarSign size={12} /> Fare
          </div>
          <div style={{ color: '#e2e8f0', fontSize: '1.4rem', fontWeight: 700 }}>₹{route.totalFare} </div>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: '0.75rem', marginBottom: 4 }}>
            <Wind size={12} /> CO₂
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#e2e8f0', fontSize: '1.4rem', fontWeight: 700 }}>{route.totalCO2}<span style={{ fontSize: '0.7rem', fontWeight: 400, color: '#94a3b8' }}>g</span></span>
            <div className="carbon-meter">
              {Array.from({ length: 5 }, (_, i) => (
                <Leaf key={i} size={12} className="carbon-leaf" style={{ color: i < ecoRating ? '#10b981' : '#1e293b' }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Congestion bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Congestion Level</span>
          <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 500 }}>{congLabel}</span>
        </div>
        <div className="congestion-bar">
          <div className={`congestion-fill ${congColor}`} style={{ width: `${congPercent}%` }} />
        </div>
      </div>

      {/* Route segments */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {route.segments.map((seg, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{seg.from.name}</span>
              <ArrowRight size={10} style={{ color: '#475569' }} />
              {i === route.segments.length - 1 && (
                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{seg.to.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
