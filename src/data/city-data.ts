// ═══════════ CITY LOCATIONS ═══════════
export interface CityLocation {
  id: string;
  name: string;
  zone: number;
  x: number; // normalized 0-100
  y: number; // normalized 0-100
  type: 'residential' | 'commercial' | 'transit_hub' | 'landmark' | 'park';
  accessible: boolean;
}

export const LOCATIONS: CityLocation[] = [
  { id: 'central_station', name: 'Central Station', zone: 1, x: 50, y: 50, type: 'transit_hub', accessible: true },
  { id: 'tech_park', name: 'Tech Park', zone: 2, x: 75, y: 30, type: 'commercial', accessible: true },
  { id: 'green_valley', name: 'Green Valley', zone: 3, x: 20, y: 25, type: 'residential', accessible: true },
  { id: 'city_mall', name: 'City Mall', zone: 1, x: 55, y: 60, type: 'commercial', accessible: true },
  { id: 'university', name: 'Metro University', zone: 2, x: 35, y: 35, type: 'landmark', accessible: true },
  { id: 'airport', name: 'City Airport', zone: 4, x: 90, y: 15, type: 'transit_hub', accessible: true },
  { id: 'harbor', name: 'Harbor District', zone: 3, x: 10, y: 70, type: 'landmark', accessible: false },
  { id: 'old_town', name: 'Old Town Square', zone: 1, x: 45, y: 55, type: 'landmark', accessible: false },
  { id: 'sports_arena', name: 'Sports Arena', zone: 2, x: 65, y: 45, type: 'landmark', accessible: true },
  { id: 'hospital', name: 'City Hospital', zone: 1, x: 40, y: 48, type: 'commercial', accessible: true },
  { id: 'riverside', name: 'Riverside Park', zone: 2, x: 30, y: 65, type: 'park', accessible: true },
  { id: 'hilltop', name: 'Hilltop Gardens', zone: 3, x: 80, y: 70, type: 'park', accessible: false },
  { id: 'downtown', name: 'Downtown Plaza', zone: 1, x: 48, y: 42, type: 'commercial', accessible: true },
  { id: 'suburb_north', name: 'North Suburbs', zone: 4, x: 50, y: 10, type: 'residential', accessible: true },
  { id: 'suburb_east', name: 'East Suburbs', zone: 4, x: 85, y: 55, type: 'residential', accessible: true },
  { id: 'industrial', name: 'Industrial Zone', zone: 3, x: 15, y: 45, type: 'commercial', accessible: true },
  { id: 'museum', name: 'Art Museum', zone: 1, x: 52, y: 38, type: 'landmark', accessible: true },
  { id: 'beach', name: 'Sunset Beach', zone: 4, x: 5, y: 85, type: 'park', accessible: false },
];

// ═══════════ TRANSPORT MODES ═══════════
export type TransportMode = 'metro' | 'bus' | 'walk' | 'bike' | 'auto';

export interface TransportConfig {
  id: TransportMode;
  name: string;
  icon: string;
  avgSpeed: number;       // km/h
  baseFare: number;       // ₹
  perKmFare: number;      // ₹/km
  co2PerKm: number;       // grams
  color: string;
  peakMultiplier: number;
  accessible: boolean;
}

export const TRANSPORT_MODES: TransportConfig[] = [
  { id: 'metro', name: 'Metro', icon: '🚇', avgSpeed: 35, baseFare: 10, perKmFare: 2.5, co2PerKm: 14, color: '#6366f1', peakMultiplier: 1.0, accessible: true },
  { id: 'bus', name: 'Bus', icon: '🚌', avgSpeed: 18, baseFare: 5, perKmFare: 1.2, co2PerKm: 89, color: '#10b981', peakMultiplier: 1.4, accessible: true },
  { id: 'auto', name: 'Auto', icon: '🛺', avgSpeed: 22, baseFare: 25, perKmFare: 8, co2PerKm: 120, color: '#f59e0b', peakMultiplier: 1.6, accessible: false },
  { id: 'bike', name: 'Bike', icon: '🚲', avgSpeed: 12, baseFare: 0, perKmFare: 0, co2PerKm: 0, color: '#06b6d4', peakMultiplier: 1.0, accessible: false },
  { id: 'walk', name: 'Walk', icon: '🚶', avgSpeed: 5, baseFare: 0, perKmFare: 0, co2PerKm: 0, color: '#8b5cf6', peakMultiplier: 1.0, accessible: false },
];

// ═══════════ GRAPH EDGES ═══════════
export interface RouteEdge {
  from: string;
  to: string;
  distance: number;    // km
  modes: TransportMode[];
  congestionFactor: number; // 0-1, higher = more congestion
}

export const ROUTE_EDGES: RouteEdge[] = [
  { from: 'central_station', to: 'downtown', distance: 1.2, modes: ['metro', 'bus', 'walk', 'bike', 'auto'], congestionFactor: 0.7 },
  { from: 'central_station', to: 'city_mall', distance: 1.5, modes: ['metro', 'bus', 'walk', 'bike', 'auto'], congestionFactor: 0.8 },
  { from: 'central_station', to: 'hospital', distance: 1.8, modes: ['metro', 'bus', 'auto'], congestionFactor: 0.5 },
  { from: 'central_station', to: 'old_town', distance: 0.8, modes: ['bus', 'walk', 'bike', 'auto'], congestionFactor: 0.6 },
  { from: 'central_station', to: 'sports_arena', distance: 3.0, modes: ['metro', 'bus', 'auto'], congestionFactor: 0.4 },
  { from: 'downtown', to: 'museum', distance: 0.6, modes: ['walk', 'bike', 'bus'], congestionFactor: 0.3 },
  { from: 'downtown', to: 'university', distance: 2.5, modes: ['metro', 'bus', 'bike', 'auto'], congestionFactor: 0.5 },
  { from: 'downtown', to: 'hospital', distance: 1.5, modes: ['bus', 'auto', 'walk'], congestionFactor: 0.4 },
  { from: 'university', to: 'green_valley', distance: 3.0, modes: ['bus', 'bike', 'auto'], congestionFactor: 0.3 },
  { from: 'university', to: 'tech_park', distance: 6.0, modes: ['metro', 'bus', 'auto'], congestionFactor: 0.6 },
  { from: 'tech_park', to: 'airport', distance: 4.5, modes: ['metro', 'bus', 'auto'], congestionFactor: 0.3 },
  { from: 'tech_park', to: 'sports_arena', distance: 3.5, modes: ['bus', 'auto', 'bike'], congestionFactor: 0.4 },
  { from: 'tech_park', to: 'suburb_east', distance: 3.0, modes: ['bus', 'auto', 'bike'], congestionFactor: 0.2 },
  { from: 'sports_arena', to: 'suburb_east', distance: 4.0, modes: ['bus', 'auto'], congestionFactor: 0.3 },
  { from: 'city_mall', to: 'old_town', distance: 1.2, modes: ['walk', 'bike', 'bus'], congestionFactor: 0.7 },
  { from: 'city_mall', to: 'riverside', distance: 2.5, modes: ['bus', 'bike', 'auto'], congestionFactor: 0.4 },
  { from: 'old_town', to: 'riverside', distance: 2.0, modes: ['bus', 'walk', 'bike'], congestionFactor: 0.3 },
  { from: 'riverside', to: 'harbor', distance: 2.5, modes: ['bus', 'bike', 'auto'], congestionFactor: 0.2 },
  { from: 'riverside', to: 'hilltop', distance: 5.5, modes: ['bus', 'auto'], congestionFactor: 0.2 },
  { from: 'harbor', to: 'beach', distance: 4.0, modes: ['bus', 'auto'], congestionFactor: 0.1 },
  { from: 'harbor', to: 'industrial', distance: 2.0, modes: ['bus', 'auto'], congestionFactor: 0.3 },
  { from: 'industrial', to: 'green_valley', distance: 3.5, modes: ['bus', 'auto'], congestionFactor: 0.2 },
  { from: 'green_valley', to: 'suburb_north', distance: 5.0, modes: ['bus', 'auto', 'bike'], congestionFactor: 0.2 },
  { from: 'suburb_north', to: 'airport', distance: 6.0, modes: ['metro', 'bus', 'auto'], congestionFactor: 0.3 },
  { from: 'suburb_north', to: 'university', distance: 4.0, modes: ['bus', 'auto', 'bike'], congestionFactor: 0.3 },
  { from: 'suburb_east', to: 'hilltop', distance: 3.0, modes: ['bus', 'auto', 'bike'], congestionFactor: 0.2 },
  { from: 'museum', to: 'university', distance: 2.0, modes: ['bus', 'walk', 'bike'], congestionFactor: 0.3 },
  { from: 'hospital', to: 'university', distance: 2.0, modes: ['bus', 'auto'], congestionFactor: 0.4 },
  { from: 'airport', to: 'suburb_east', distance: 5.5, modes: ['bus', 'auto'], congestionFactor: 0.2 },
];

// ═══════════ PEAK HOURS ═══════════
export function isPeakHour(hour?: number): boolean {
  const h = hour ?? new Date().getHours();
  return (h >= 8 && h <= 10) || (h >= 17 && h <= 20);
}

export function getCongestionLevel(baseFactor: number, peak: boolean): number {
  const factor = peak ? Math.min(baseFactor * 1.5, 1) : baseFactor;
  if (factor < 0.3) return 0; // low
  if (factor < 0.6) return 1; // medium
  return 2; // high
}

export function getCongestionLabel(level: number): string {
  return ['Low', 'Moderate', 'Heavy'][level] || 'Unknown';
}

export function getCongestionColor(level: number): string {
  return ['congestion-low', 'congestion-medium', 'congestion-high'][level] || 'congestion-low';
}
