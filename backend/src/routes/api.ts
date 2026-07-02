import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const router = Router();
const prisma = new PrismaClient();

// Get a passenger by ID
router.get('/passenger/email/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const passenger = await prisma.passenger.findUnique({
      where: { email },
      include: {
        bookings: {
          include: {
            flight: {
              include: { disruptions: true }
            }
          }
        }
      }
    });
    
    if (!passenger) {
       res.status(404).json({ error: 'Passenger not found' });
       return;
    }
    res.json(passenger);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch passenger' });
  }
});

router.get('/passenger/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const passenger = await prisma.passenger.findUnique({
      where: { id },
      include: {
        bookings: {
          include: {
            flight: true
          }
        }
      }
    });
    
    if (!passenger) {
       res.status(404).json({ error: 'Passenger not found' });
       return;
    }
    res.json(passenger);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch passenger' });
  }
});

// Get all flights
router.get('/flights', async (req, res) => {
  try {
    const flights = await prisma.flight.findMany();
    res.json(flights);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch flights' });
  }
});

// Helper: Calculate compensation amount based on delay and loyalty status
function calculateCompensation(
  delayMinutes: number | null | undefined,
  loyaltyStatus: string,
  isCancelled: boolean
): number {
  const isPremium = loyaltyStatus === 'GOLD' || loyaltyStatus === 'PLATINUM';
  const delay = delayMinutes ?? 0;

  if (isCancelled) {
    return isPremium ? 400 : 250;
  }
  if (delay > 360) {
    return isPremium ? 600 : 400;
  }
  if (delay > 120) {
    return isPremium ? 300 : 200;
  }
  return 0;
}

// Analyze disruption and recommend recovery
router.post('/recovery/analyze', async (req, res) => {
  const { bookingId } = req.body;

  if (!bookingId) {
    res.status(400).json({ error: 'Missing bookingId' });
    return;
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        passenger: true,
        flight: {
          include: { disruptions: true }
        }
      }
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    // Check if flight is actually disrupted
    const disruption = booking.flight.disruptions[0];
    if (!disruption) {
      res.json({ message: 'No disruption detected for this flight.' });
      return;
    }

    // Create Recovery Request
    const recoveryRequest = await prisma.recoveryRequest.create({
      data: {
        bookingId: booking.id,
        status: 'AI_RECOMMENDED'
      }
    });

    const delayMinutes: number = disruption.delayMinutes ?? 0;
    const isCancelled = disruption.type === 'CANCELLED';
    const loyaltyStatus = booking.passenger.loyaltyStatus;
    const isPremium = loyaltyStatus === 'GOLD' || loyaltyStatus === 'PLATINUM';

    // Determine action based on disruption type and delay
    let action: string;
    let confidenceScore: number;
    let reason: string;
    let alternativeFlightId: string | null = null;

    if (disruption.type === 'DELAYED') {
      if (delayMinutes < 120) {
        action = 'WAIT';
        confidenceScore = 0.90;
        reason = `Your flight is delayed by ${delayMinutes} minutes. We recommend waiting as the delay is under 2 hours.`;
      } else {
        action = 'REBOOK';
        confidenceScore = isPremium ? 0.95 : 0.85;
        reason = isPremium
          ? `As a valued ${loyaltyStatus} member, we have automatically secured you a seat on the next available flight. Meal vouchers are included.`
          : 'We recommend rebooking on the next available flight due to the significant delay.';
      }
    } else {
      // CANCELLED or other
      action = 'REBOOK';
      confidenceScore = isPremium ? 0.95 : 0.85;
      reason = isPremium
        ? `As a valued ${loyaltyStatus} member, we have automatically secured you a seat on the next available flight. Meal vouchers are included.`
        : 'We recommend rebooking on the next available flight.';
    }

    // Find best alternative flight if rebooking
    if (action === 'REBOOK') {
      const altFlight = await prisma.flight.findFirst({
        where: {
          departureAirport: booking.flight.departureAirport,
          arrivalAirport: booking.flight.arrivalAirport,
          status: 'SCHEDULED',
          departureTime: { gt: new Date() }
        },
        orderBy: { departureTime: 'asc' }
      });
      if (altFlight) {
        alternativeFlightId = altFlight.id;
      }
    }

    // Save Recommendation
    const recommendation = await prisma.recoveryRecommendation.create({
      data: {
        recoveryRequestId: recoveryRequest.id,
        action,
        reason,
        confidenceScore,
        alternativeFlightId
      }
    });

    // Fetch all alternative options
    const alternatives = await prisma.flight.findMany({
      where: {
        departureAirport: booking.flight.departureAirport,
        arrivalAirport: booking.flight.arrivalAirport,
        status: 'SCHEDULED',
        departureTime: { gt: new Date() }
      },
      orderBy: { departureTime: 'asc' }
    });

    // Determine if next flight is next day (for hotel voucher)
    const nextFlight = alternatives[0];
    const nextFlightNextDay =
      nextFlight != null &&
      nextFlight.departureTime.getDate() !== new Date().getDate();

    // Build vouchers object
    const vouchers = {
      meal: delayMinutes >= 120 || isCancelled,
      hotel: delayMinutes >= 480 || (isCancelled && nextFlightNextDay),
      compensation: calculateCompensation(delayMinutes, loyaltyStatus, isCancelled)
    };

    res.json({
      recoveryRequest,
      recommendation,
      disruption,
      delayMinutes,
      vouchers,
      alternatives
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Accept a recovery recommendation
router.post('/recovery/accept', async (req, res) => {
  const { bookingId, recommendationId, alternativeFlightId } = req.body;
  try {
    // Update the booking to the new flight
    await prisma.booking.update({
      where: { id: bookingId },
      data: { flightId: alternativeFlightId }
    });

    if (recommendationId) {
      // Mark recommendation as accepted
      await prisma.recoveryRecommendation.update({
        where: { id: recommendationId },
        data: { status: 'ACCEPTED' }
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to accept recovery' });
  }
});

// GET Notifications
router.get('/notifications/:passengerId', async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { passengerId: req.params.passengerId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(notifications);
  } catch (error) {
    console.error('Failed to get notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST Notification
router.post('/notifications', async (req, res) => {
  const { passengerId, type, title, description } = req.body;
  try {
    const notification = await prisma.notification.create({
      data: { passengerId, type, title, description }
    });
    res.json(notification);
  } catch (error) {
    console.error('Failed to create notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark all as read
router.post('/notifications/:passengerId/read-all', async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { passengerId: req.params.passengerId, unread: true },
      data: { unread: false }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to mark read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get All Passengers
router.get('/passengers', async (req, res) => {
  try {
    const passengers = await prisma.passenger.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        loyaltyStatus: true,
      },
    });
    res.json(passengers);
  } catch (error) {
    console.error('Failed to get passengers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET Chat History
router.get('/chat/:passengerId', async (req, res) => {
  const { passengerId } = req.params;
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { passengerId },
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages);
  } catch (error) {
    console.error('Failed to fetch chat history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST Chat Message
router.post('/chat', async (req, res) => {
  const { passengerId, text } = req.body;
  if (!passengerId || !text) {
    res.status(400).json({ error: 'passengerId and text are required' });
    return;
  }

  try {
    // 1. Save user message
    await prisma.chatMessage.create({
      data: { passengerId, role: 'user', text }
    });

    // 2. Fetch recent history (last 10 messages) to provide context to Gemini
    const history = await prisma.chatMessage.findMany({
      where: { passengerId },
      orderBy: { createdAt: 'asc' },
      take: -10, // Get the last 10 messages
    });

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const systemPrompt = `You are the SkyRecover AI Assistant. 
You exclusively help passengers with flight disruptions, refunds, compensations, meal vouchers, hotel accommodations, and rebooking. 
If the user asks about anything unrelated to airlines, travel, or flight recovery, you must refuse to answer and politely guide them back to flight recovery topics. 
Be concise, helpful, and professional.`;

    const contents = history.map(m => ({
      role: m.role === 'assistant' || m.role === 'ai' ? 'model' : 'user',
      parts: [{ text: m.text }]
    }));

    // 3. Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: contents,
        generationConfig: { maxOutputTokens: 500, temperature: 0.1 }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini error:', errText);
      throw new Error('Gemini API failed');
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";

    // 4. Save AI response
    const aiMessage = await prisma.chatMessage.create({
      data: { passengerId, role: 'assistant', text: replyText }
    });

    res.json(aiMessage);
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Demo Endpoint: Reset the database to initial state
router.post('/demo/reset', async (req, res) => {
  try {
    // Clean up existing data
    await prisma.notification.deleteMany();
    await prisma.chatMessage.deleteMany();
    await prisma.recoveryRecommendation.deleteMany();
    await prisma.recoveryRequest.deleteMany();
    await prisma.disruption.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.flight.deleteMany();
    await prisma.passenger.deleteMany();

    // Hash 'password123' for default accounts
    const passwordHash = await bcrypt.hash('password123', 10);

    // Create Passengers
    const p1 = await prisma.passenger.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        passwordHash,
        phone: '+15551234567',
        loyaltyStatus: 'GOLD',
      },
    });

    const p2 = await prisma.passenger.create({
      data: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        passwordHash,
        phone: '+15559876543',
        loyaltyStatus: 'MEMBER',
      },
    });

    const p3 = await prisma.passenger.create({
      data: {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@example.com',
        passwordHash,
        phone: '+15551112222',
        loyaltyStatus: 'PLATINUM',
      },
    });

    const p4 = await prisma.passenger.create({
      data: {
        firstName: 'Bob',
        lastName: 'Williams',
        email: 'bob.williams@example.com',
        passwordHash,
        phone: '+15553334444',
        loyaltyStatus: 'SILVER',
      },
    });

    const p5 = await prisma.passenger.create({
      data: {
        firstName: 'Charlie',
        lastName: 'Brown',
        email: 'charlie.brown@example.com',
        passwordHash,
        phone: '+15555556666',
        loyaltyStatus: 'MEMBER',
      },
    });

    // Create Flights
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

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

    const altFlight1 = await prisma.flight.create({
      data: {
        flightNumber: 'SJ241',
        departureAirport: 'JFK',
        arrivalAirport: 'LHR',
        departureTime: new Date(today.setHours(18, 45, 0, 0)),
        arrivalTime: new Date(today.setHours(2, 45, 0, 0)),
        status: 'SCHEDULED',
      },
    });

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
    await prisma.booking.create({
      data: {
        pnr: 'XJ9L2P',
        passengerId: p1.id,
        flightId: disruptedFlight.id,
        seatNumber: '12A',
        class: 'BUSINESS',
      },
    });

    await prisma.booking.create({
      data: {
        pnr: 'M4KL9Q',
        passengerId: p2.id,
        flightId: disruptedFlight.id,
        seatNumber: '24C',
        class: 'ECONOMY',
      },
    });

    await prisma.booking.create({
      data: {
        pnr: 'ALC77X',
        passengerId: p3.id,
        flightId: disruptedFlight.id,
        seatNumber: '2A',
        class: 'FIRST',
      },
    });

    await prisma.booking.create({
      data: {
        pnr: 'BW89PZ',
        passengerId: p4.id,
        flightId: disruptedFlight.id,
        seatNumber: '15F',
        class: 'ECONOMY',
      },
    });

    await prisma.booking.create({
      data: {
        pnr: 'CB44MM',
        passengerId: p5.id,
        flightId: disruptedFlight.id,
        seatNumber: '33B',
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

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to reset demo' });
  }
});

// Demo Endpoint: Simulate cancelling a specific flight
router.post('/demo/cancel-flight', async (req, res) => {
  const { flightId } = req.body;
  try {
    // Update flight status
    await prisma.flight.update({
      where: { id: flightId },
      data: { status: 'CANCELLED' }
    });

    // Create a disruption record
    await prisma.disruption.create({
      data: {
        flightId: flightId,
        type: 'CANCELLED',
        reason: 'OPERATIONAL'
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to cancel flight' });
  }
});

// Process a refund request
router.post('/recovery/refund', async (req, res) => {
  const { bookingId, reason } = req.body;

  if (!bookingId || !reason) {
    res.status(400).json({ error: 'Missing bookingId or reason' });
    return;
  }

  const validReasons = ['CANCELLED', 'VOLUNTARY', 'MEDICAL'];
  if (!validReasons.includes(reason)) {
    res.status(400).json({ error: `reason must be one of: ${validReasons.join(', ')}` });
    return;
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { passenger: true, flight: true }
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    // Determine refund amount by booking class
    const refundAmountMap: Record<string, number> = {
      BUSINESS: 450,
      FIRST: 700,
      ECONOMY: 200
    };
    const refundAmount = refundAmountMap[booking.class] ?? 200;

    // Confidence score based on reason
    const confidenceScoreMap: Record<string, number> = {
      CANCELLED: 0.99,
      MEDICAL: 0.95,
      VOLUNTARY: 0.72
    };
    const confidenceScore = confidenceScoreMap[reason];

    // Create a recovery request for this refund
    const recoveryRequest = await prisma.recoveryRequest.create({
      data: {
        bookingId: booking.id,
        status: 'AI_RECOMMENDED'
      }
    });

    // Store refund as a RecoveryRecommendation
    const recommendation = await prisma.recoveryRecommendation.create({
      data: {
        recoveryRequestId: recoveryRequest.id,
        action: 'REFUND',
        reason: `Refund requested — reason: ${reason}. Class: ${booking.class}. Refund amount: $${refundAmount}.`,
        confidenceScore,
        alternativeFlightId: null
      }
    });

    // Generate a deterministic-looking confirmation code
    const confirmationCode = `RFD-${booking.pnr}-${Date.now().toString(36).toUpperCase()}`;

    res.json({
      refundAmount,
      currency: 'USD',
      processingDays: 7,
      confirmationCode,
      recommendation
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process refund' });
  }
});

// Get recovery history for a booking
router.get('/recovery/history/:bookingId', async (req, res) => {
  const { bookingId } = req.params;
  try {
    const history = await prisma.recoveryRequest.findMany({
      where: { bookingId },
      include: {
        recommendations: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch recovery history' });
  }
});

// Get a single flight by ID
router.get('/flights/:flightId', async (req, res) => {
  const { flightId } = req.params;
  try {
    const flight = await prisma.flight.findUnique({
      where: { id: flightId },
      include: {
        disruptions: true,
        bookings: {
          include: { passenger: true }
        }
      }
    });

    if (!flight) {
      res.status(404).json({ error: 'Flight not found' });
      return;
    }

    res.json(flight);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch flight' });
  }
});

// Demo Endpoint: Simulate a flight delay
router.post('/demo/delay-flight', async (req, res) => {
  const { flightId, delayMinutes } = req.body;

  if (!flightId || delayMinutes == null) {
    res.status(400).json({ error: 'Missing flightId or delayMinutes' });
    return;
  }

  try {
    // Update flight status to DELAYED
    await prisma.flight.update({
      where: { id: flightId },
      data: { status: 'DELAYED' }
    });

    // Create a disruption record
    await prisma.disruption.create({
      data: {
        flightId,
        type: 'DELAYED',
        reason: 'WEATHER',
        delayMinutes: Number(delayMinutes)
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to simulate flight delay' });
  }
});

export default router;
