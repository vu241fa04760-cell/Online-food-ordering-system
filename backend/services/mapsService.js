// Simulated Maps & Location Service (e.g., Google Maps / Mapbox)
const calculateDistanceAndRoute = (originCoords, destinationAddress) => {
  // Center around standard downtown coordinates
  const origin = originCoords || { lat: 37.7749, lng: -122.4194 };
  const dest = {
    lat: origin.lat + (Math.random() * 0.04 - 0.02),
    lng: origin.lng + (Math.random() * 0.04 - 0.02),
  };

  const distanceKm = +(2 + Math.random() * 4).toFixed(1);
  const durationMinutes = Math.round(distanceKm * 6 + 10);

  // Generate 5 waypoint positions along route for live tracking animation
  const steps = 5;
  const waypoints = [];
  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    waypoints.push({
      step: i,
      lat: +(origin.lat + (dest.lat - origin.lat) * ratio).toFixed(6),
      lng: +(origin.lng + (dest.lng - origin.lng) * ratio).toFixed(6),
    });
  }

  return {
    origin,
    destination: dest,
    distanceKm,
    distanceText: `${distanceKm} km`,
    durationMinutes,
    durationText: `${durationMinutes} mins`,
    waypoints,
  };
};

module.exports = { calculateDistanceAndRoute };
