# Sky-Recovery
**Jainam Patel**

---

## API Documentation

The Sky-Recovery backend exposes a RESTful API serving the React frontend. It handles passenger authentication, data retrieval, recovery logic processing, and generative AI chat integration.

### Base URL
All API endpoints are prefixed with `/api` unless otherwise specified.

---

### Authentication (`/api/auth`)

#### `POST /auth/login`
Authenticates a passenger using email and password.
- **Request Body:** `{ email, password }`
- **Response:** Passenger details including `id`, `firstName`, `lastName`, `loyaltyStatus`, etc.

#### `POST /auth/forgot-password`
Initiates a password reset flow (simulated).
- **Request Body:** `{ email }`
- **Response:** Reset token (for demo purposes)

#### `POST /auth/reset-password`
Completes the password reset process.
- **Request Body:** `{ token, newPassword }`
- **Response:** Success confirmation

---

### Passengers (`/api`)

#### `GET /passenger/:id`
Retrieves a passenger by their UUID, including their bookings and flight details.
- **Response:** Detailed `Passenger` object

#### `GET /passenger/email/:email`
Retrieves a passenger by their email address.
- **Response:** Detailed `Passenger` object

#### `GET /passengers`
Retrieves all passengers (utility endpoint for demo).

---

### Flights & Bookings (`/api`)

#### `GET /flights`
Retrieves all flights in the system.

#### `GET /flights/:flightId`
Retrieves a specific flight and all active disruptions associated with it.

---

### Disruption Recovery (`/api/recovery`)

#### `POST /recovery/analyze`
Core engine endpoint. Analyzes a disrupted booking and generates AI-driven recovery recommendations using the Gemini API based on loyalty tier, flight schedules, and delay reasons.
- **Request Body:** `{ bookingId }`
- **Response:** A proposed `RecoveryRecommendation` (Rebook, Refund, or Wait)

#### `POST /recovery/accept`
Accepts a proposed recovery recommendation (e.g. Reschedule).
- **Request Body:** `{ bookingId, recommendationId, selectedFlightId (optional) }`
- **Response:** Updates the request status to `PENDING` (simulating admin review).

#### `POST /recovery/refund`
Requests a refund for a disrupted flight.
- **Request Body:** `{ bookingId }`
- **Response:** Updates the request status to `PENDING` (simulating admin review).

#### `GET /recovery/history/:bookingId`
Fetches the historical recovery requests for a specific booking.

---

### Generative AI Chat (`/api/chat`)

#### `POST /chat`
Streams or returns a generated response from Google's Gemini AI acting as the SkyRecover Assistant.
- **Request Body:** `{ passengerId, message }`
- **Response:** AI Assistant reply based on live passenger context (e.g. "Your flight SJ238 is delayed due to weather").

#### `GET /chat/:passengerId`
Retrieves the chat history between the passenger and the Gemini AI.

---

### Notifications (`/api/notifications`)

#### `GET /notifications/:passengerId`
Fetches all unread notifications for a passenger.

#### `POST /notifications`
Pushes a new notification to a passenger.
- **Request Body:** `{ passengerId, type, title, description }`

#### `POST /notifications/:passengerId/read-all`
Marks all notifications as read for a passenger.

---

### Evaluation / Demo Utilities (`/api/demo`)

*These endpoints exist purely for the hackathon evaluation to simulate live operational events.*

#### `POST /demo/delay-flight`
Simulates a flight delay and injects a disruption record into the database.
- **Request Body:** `{ flightId, delayMinutes, reason }`

#### `POST /demo/cancel-flight`
Simulates a flight cancellation.
- **Request Body:** `{ flightId, reason }`

#### `POST /demo/reset`
Resets the database for a specific user to its original seeded state to allow judges to re-evaluate the recovery flow.
- **Request Body:** `{ email }`
