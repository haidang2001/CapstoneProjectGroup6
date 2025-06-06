// Mock data for bus stops
const mockStops = [
  {
    id: 'stop1',
    name: 'Main Street Station',
    lat: 42.9849,
    lon: -81.2453,
    routes: ['Route 1', 'Route 3'],
  },
  {
    id: 'stop2',
    name: 'Central Park Stop',
    lat: 42.9855,
    lon: -81.2500,
    routes: ['Route 2', 'Route 4'],
  },
  {
    id: 'stop3',
    name: 'University Terminal',
    lat: 42.9870,
    lon: -81.2475,
    routes: ['Route 1', 'Route 5'],
  },
];

// Calculate distance between two coordinates (simplified)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const getNearbyStops = async (userLat, userLon, radiusKm) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return mockStops
    .map(stop => ({
      ...stop,
      distance: calculateDistance(userLat, userLon, stop.lat, stop.lon),
    }))
    .filter(stop => stop.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
};