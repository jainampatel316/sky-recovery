import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.recoveryRecommendation.deleteMany();
  await prisma.recoveryRequest.deleteMany();
  await prisma.disruption.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.flight.deleteMany();
  await prisma.passenger.deleteMany();

  console.log('Cleared existing data.');

  // Create Passengers
  const p1 = await prisma.passenger.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+15551234567',
      loyaltyStatus: 'GOLD',
    },
  });

  const p2 = await prisma.passenger.create({
    data: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+15559876543',
      loyaltyStatus: 'MEMBER',
    },
  });

  // Create Flights
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Flight to be disrupted
  const disruptedFlight = await prisma.flight.create({
    data: {
      flightNumber: 'SJ238',
      departureAirport: 'JFK',
      arrivalAirport: 'LHR',
      departureTime: new Date(today.setHours(14, 0, 0, 0)),
      arrivalTime: new Date(today.setHours(22, 0, 0, 0)),
      status: 'CANCELLED',
    },
  });

  // Alternative flight 1 (Same day, later)
  const altFlight1 = await prisma.flight.create({
    data: {
      flightNumber: 'SJ241',
      departureAirport: 'JFK',
      arrivalAirport: 'LHR',
      departureTime: new Date(today.setHours(18, 45, 0, 0)),
      arrivalTime: new Date(today.setHours(2, 45, 0, 0)), // Next day arrival technically
      status: 'SCHEDULED',
    },
  });

  // Alternative flight 2 (Next day)
  const altFlight2 = await prisma.flight.create({
    data: {
      flightNumber: 'SJ305',
      departureAirport: 'JFK',
      arrivalAirport: 'LHR',
      departureTime: new Date(tomorrow.setHours(9, 30, 0, 0)),
      arrivalTime: new Date(tomorrow.setHours(17, 30, 0, 0)),
      status: 'SCHEDULED',
    },
  });

  // Create Bookings
  const booking1 = await prisma.booking.create({
    data: {
      pnr: 'XJ9L2P',
      passengerId: p1.id,
      flightId: disruptedFlight.id,
      seatNumber: '12A',
      class: 'BUSINESS',
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      pnr: 'M4KL9Q',
      passengerId: p2.id,
      flightId: disruptedFlight.id,
      seatNumber: '24C',
      class: 'ECONOMY',
    },
  });

  // Create Disruption Event
  await prisma.disruption.create({
    data: {
      flightId: disruptedFlight.id,
      type: 'CANCELLED',
      reason: 'WEATHER',
    },
  });

  console.log('Seed data created successfully.');
  console.log('Login Email 1:', p1.email);
  console.log('Login Email 2:', p2.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
