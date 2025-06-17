// arrivalTimes.js

let lastFetchedTime = 0;
let cachedData = [];

export const fetchAndCacheArrivals = async () => {
  try {
    const res = await fetch("http://gtfs.ltconline.ca/TripUpdate/TripUpdates.json");
    const data = await res.json();
    cachedData = data.entity || [];
    lastFetchedTime = Date.now();
  } catch (err) {
    console.error("❌ Failed to fetch real-time arrivals", err);
    cachedData = [];
  }
};

export const getCachedArrivals = (stopId) => {
  const now = Math.floor(Date.now() / 1000);
  const oneHourLater = now + 3600;
  const arrivals = [];

  for (const entity of cachedData) {
    const trip = entity.trip_update?.trip;
    const stopUpdates = entity.trip_update?.stop_time_update || [];

    for (const stopUpdate of stopUpdates) {
      if (stopUpdate.stop_id === stopId && stopUpdate.arrival?.time) {
        const arrivalUnix = parseInt(stopUpdate.arrival.time);
        if (arrivalUnix >= now && arrivalUnix <= oneHourLater) {
          const minutesUntil = Math.round((arrivalUnix - now) / 60);
          arrivals.push({
            route: trip?.route_id || "Unknown",
            time: new Date(arrivalUnix * 1000).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            inMinutes: minutesUntil,
          });
        }
      }
    }
  }

  return arrivals.sort((a, b) => a.inMinutes - b.inMinutes);
};

export const ensureRecentData = async () => {
  const now = Date.now();
  if (now - lastFetchedTime > 60000) {
    await fetchAndCacheArrivals();
  }
}