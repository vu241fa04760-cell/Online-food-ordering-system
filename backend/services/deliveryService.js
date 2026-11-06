// Simulated Delivery Partner API (e.g., DoorDash Drive / Uber Direct)
const riders = [
  { name: 'Alex Morgan', phone: '+1 (555) 234-5678', vehicle: 'Electric Scooter (EV-902)', rating: 4.9 },
  { name: 'Marcus Chen', phone: '+1 (555) 876-5432', vehicle: 'Honda Civic (7ABC89)', rating: 4.8 },
  { name: 'Sara Jenkins', phone: '+1 (555) 432-1098', vehicle: 'Vespa 150 (CA-442)', rating: 5.0 },
];

const assignDeliveryPartner = (orderId, originCoords) => {
  const rider = riders[Math.floor(Math.random() * riders.length)];
  return {
    ...rider,
    assignedAt: new Date().toISOString(),
    currentLocation: {
      lat: (originCoords?.lat || 37.7749) + 0.002,
      lng: (originCoords?.lng || -122.4194) + 0.002,
    },
    status: 'assigned',
  };
};

module.exports = { assignDeliveryPartner };
