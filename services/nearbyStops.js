// services/nearbyStops.js
import stops from '../assets/stops.json';
// console.log("Loaded stops:", stops.slice(0, 5));

export function getNearbyStops(userLat, userLon, maxDistanceKm = 0.5) {
  const toRad = (value) => (value * Math.PI) / 180;

  return stops.filter((stop) => {
    const R = 6371; // Earth radius in km
    const dLat = toRad(stop.lat - userLat);
    const dLon = toRad(stop.lon - userLon);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(userLat)) *
        Math.cos(toRad(stop.lat)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance <= maxDistanceKm;
  });
}
