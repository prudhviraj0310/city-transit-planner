import {
  LOCATIONS,
  ROUTE_EDGES,
  TRANSPORT_MODES,
  isPeakHour,
  type CityLocation,
  type TransportMode,
  type TransportConfig,
  type RouteEdge,
} from '../data/city-data';

// ═══════════ ROUTE RESULT ═══════════
export interface RouteSegment {
  from: CityLocation;
  to: CityLocation;
  distance: number;
  mode: TransportConfig;
  time: number;       // minutes
  fare: number;       // ₹
  co2: number;        // grams
  congestion: number; // 0-2
}

export interface RouteResult {
  id: string;
  segments: RouteSegment[];
  totalDistance: number;
  totalTime: number;
  totalFare: number;
  totalCO2: number;
  mode: TransportConfig;
  tags: string[];      // 'fastest' | 'cheapest' | 'eco' | 'accessible'
  avgCongestion: number;
}

// ═══════════ GRAPH (BIDIRECTIONAL) ═══════════
function buildGraph(): Map<string, { edge: RouteEdge; neighbor: string }[]> {
  const graph = new Map<string, { edge: RouteEdge; neighbor: string }[]>();
  
  for (const edge of ROUTE_EDGES) {
    if (!graph.has(edge.from)) graph.set(edge.from, []);
    if (!graph.has(edge.to)) graph.set(edge.to, []);
    graph.get(edge.from)!.push({ edge, neighbor: edge.to });
    graph.get(edge.to)!.push({ edge, neighbor: edge.from });
  }
  
  return graph;
}

const GRAPH = buildGraph();

// ═══════════ DIJKSTRA PATHFINDING ═══════════
function dijkstra(
  fromId: string,
  toId: string,
  mode: TransportMode
): { path: string[]; edges: RouteEdge[] } | null {
  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const prevEdge = new Map<string, RouteEdge | null>();
  const visited = new Set<string>();

  // Initialize
  for (const loc of LOCATIONS) {
    dist.set(loc.id, Infinity);
    prev.set(loc.id, null);
    prevEdge.set(loc.id, null);
  }
  dist.set(fromId, 0);

  while (true) {
    // Find unvisited node with smallest distance
    let minDist = Infinity;
    let current: string | null = null;
    for (const [node, d] of dist) {
      if (!visited.has(node) && d < minDist) {
        minDist = d;
        current = node;
      }
    }

    if (current === null || current === toId) break;
    visited.add(current);

    const neighbors = GRAPH.get(current) || [];
    for (const { edge, neighbor } of neighbors) {
      if (visited.has(neighbor)) continue;
      if (!edge.modes.includes(mode)) continue;

      const newDist = dist.get(current)! + edge.distance;
      if (newDist < dist.get(neighbor)!) {
        dist.set(neighbor, newDist);
        prev.set(neighbor, current);
        prevEdge.set(neighbor, edge);
      }
    }
  }

  if (dist.get(toId) === Infinity) return null;

  // Reconstruct path
  const path: string[] = [];
  const edges: RouteEdge[] = [];
  let current: string | null = toId;
  while (current !== null) {
    path.unshift(current);
    const edge = prevEdge.get(current);
    if (edge) edges.unshift(edge);
    current = prev.get(current) || null;
  }

  return { path, edges };
}

// ═══════════ CALCULATE ROUTE ═══════════
export function calculateRoute(
  fromId: string,
  toId: string,
  mode: TransportMode,
  peakHour?: boolean
): RouteResult | null {
  if (fromId === toId) return null;

  const result = dijkstra(fromId, toId, mode);
  if (!result || result.path.length < 2) return null;

  const transport = TRANSPORT_MODES.find(m => m.id === mode)!;
  const peak = peakHour ?? isPeakHour();
  const segments: RouteSegment[] = [];

  for (const edge of result.edges) {
    const fromLoc = LOCATIONS.find(l => l.id === edge.from || l.id === edge.to)!;
    const toLoc = LOCATIONS.find(l => l.id !== fromLoc.id && (l.id === edge.from || l.id === edge.to))!;
    
    // Properly find from/to within the path context
    const fromIdx = result.path.indexOf(edge.from);
    const toIdx = result.path.indexOf(edge.to);
    const segFrom = fromIdx < toIdx 
      ? LOCATIONS.find(l => l.id === edge.from)!
      : LOCATIONS.find(l => l.id === edge.to)!;
    const segTo = fromIdx < toIdx 
      ? LOCATIONS.find(l => l.id === edge.to)!
      : LOCATIONS.find(l => l.id === edge.from)!;

    const congestionMultiplier = peak ? 1 + edge.congestionFactor : 1 + edge.congestionFactor * 0.3;
    const effectiveSpeed = transport.avgSpeed / congestionMultiplier;
    const time = (edge.distance / effectiveSpeed) * 60; // minutes
    const fare = transport.baseFare + edge.distance * transport.perKmFare * (peak ? transport.peakMultiplier : 1);
    const co2 = edge.distance * transport.co2PerKm;
    const congestion = edge.congestionFactor < 0.3 ? 0 : edge.congestionFactor < 0.6 ? 1 : 2;

    segments.push({
      from: segFrom,
      to: segTo,
      distance: edge.distance,
      mode: transport,
      time: Math.round(time),
      fare: Math.round(fare),
      co2: Math.round(co2),
      congestion,
    });
  }

  const totalDistance = segments.reduce((s, seg) => s + seg.distance, 0);
  const totalTime = segments.reduce((s, seg) => s + seg.time, 0);
  const totalFare = segments.reduce((s, seg) => s + seg.fare, 0);
  const totalCO2 = segments.reduce((s, seg) => s + seg.co2, 0);
  const avgCongestion = segments.reduce((s, seg) => s + seg.congestion, 0) / segments.length;

  return {
    id: `${fromId}-${toId}-${mode}-${Date.now()}`,
    segments,
    totalDistance: Math.round(totalDistance * 10) / 10,
    totalTime,
    totalFare,
    totalCO2,
    mode: transport,
    tags: [],
    avgCongestion: Math.round(avgCongestion * 10) / 10,
  };
}

// ═══════════ FIND ALL ROUTES ═══════════
export function findAllRoutes(
  fromId: string,
  toId: string,
  peakHour?: boolean,
  accessibleOnly?: boolean
): RouteResult[] {
  const modes = accessibleOnly 
    ? TRANSPORT_MODES.filter(m => m.accessible)
    : TRANSPORT_MODES;
    
  const routes: RouteResult[] = [];

  for (const mode of modes) {
    const route = calculateRoute(fromId, toId, mode.id, peakHour);
    if (route) routes.push(route);
  }

  if (routes.length === 0) return [];

  // Tag fastest
  const fastest = routes.reduce((min, r) => r.totalTime < min.totalTime ? r : min, routes[0]);
  fastest.tags.push('fastest');

  // Tag cheapest (among paid options)
  const paidRoutes = routes.filter(r => r.totalFare > 0);
  if (paidRoutes.length > 0) {
    const cheapest = paidRoutes.reduce((min, r) => r.totalFare < min.totalFare ? r : min, paidRoutes[0]);
    cheapest.tags.push('cheapest');
  }

  // Tag eco-friendly  
  const eco = routes.reduce((min, r) => r.totalCO2 < min.totalCO2 ? r : min, routes[0]);
  eco.tags.push('eco');

  // Tag accessible routes
  for (const route of routes) {
    if (route.mode.accessible) {
      route.tags.push('accessible');
    }
  }

  // Sort by time
  routes.sort((a, b) => a.totalTime - b.totalTime);

  return routes;
}

// ═══════════ AI SUGGESTION ═══════════
export type Preference = 'fastest' | 'cheapest' | 'eco' | 'comfortable';

export function aiSuggestRoute(
  routes: RouteResult[],
  preference: Preference
): RouteResult | null {
  if (routes.length === 0) return null;

  switch (preference) {
    case 'fastest':
      return routes.reduce((best, r) => r.totalTime < best.totalTime ? r : best, routes[0]);
    case 'cheapest':
      return routes.reduce((best, r) => r.totalFare < best.totalFare ? r : best, routes[0]);
    case 'eco':
      return routes.reduce((best, r) => r.totalCO2 < best.totalCO2 ? r : best, routes[0]);
    case 'comfortable': {
      // Weighted score: less congestion, reasonable time, metro preferred
      return routes.reduce((best, r) => {
        const score = r.avgCongestion * 30 + r.totalTime * 0.5 + (r.mode.id === 'metro' ? -10 : 0);
        const bestScore = best.avgCongestion * 30 + best.totalTime * 0.5 + (best.mode.id === 'metro' ? -10 : 0);
        return score < bestScore ? r : best;
      }, routes[0]);
    }
    default:
      return routes[0];
  }
}
