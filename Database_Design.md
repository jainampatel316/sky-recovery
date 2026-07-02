# Sky-Recovery
**Jainam Patel**

---

## Database Design (ER Diagram)

The application follows a normalized relational database schema designed to maintain high data integrity.

```mermaid
erDiagram
    Passenger ||--o{ Booking : "has many"
    Passenger ||--o{ ChatMessage : "has many"
    Passenger ||--o{ Notification : "has many"
    
    Flight ||--o{ Booking : "has many"
    Flight ||--o{ Disruption : "has many"
    
    Booking ||--o{ RecoveryRequest : "has many"
    
    RecoveryRequest ||--o{ RecoveryRecommendation : "has many"

    Passenger {
        String id PK
        String firstName
        String lastName
        String email UK
        String phone
        String loyaltyStatus
    }

    Flight {
        String id PK
        String flightNumber
        String departureAirport
        String arrivalAirport
        DateTime departureTime
        DateTime arrivalTime
        String status
    }

    Booking {
        String id PK
        String pnr UK
        String passengerId FK
        String flightId FK
        String seatNumber
        String class
    }

    Disruption {
        String id PK
        String flightId FK
        String type
        String reason
        Int delayMinutes
    }

    RecoveryRequest {
        String id PK
        String bookingId FK
        String status
    }

    RecoveryRecommendation {
        String id PK
        String recoveryRequestId FK
        String action
        String reason
        Float confidenceScore
    }
```

### ACID Compliance & Database Practices

The SkyRecover platform is fully **ACID compliant** and follows modern database design principles:

1. **Atomicity & Consistency**: We utilize **Prisma ORM**, which wraps complex database operations (like logging a chat message and retrieving history) in atomic transactions. If a recovery request fails midway, the entire transaction rolls back, preventing orphaned data or partial states.
2. **Referential Integrity (Isolation)**: We enforce strict foreign key constraints at the database level. For example, a `Booking` cannot exist without a valid `Passenger` and `Flight`. Deleting a passenger cascades correctly or gets blocked depending on the foreign key constraints to prevent dangling references.
3. **Durability**: Using SQLite ensures that all committed transactions are persisted immediately to the disk/volume. For production, Prisma trivially allows a switch to PostgreSQL, maintaining identical schema and queries while unlocking distributed durability.
4. **Normalization**: The schema is strictly normalized to 3rd Normal Form (3NF). We avoid data duplication (e.g., flight details are stored in the `Flight` table, not duplicated inside the `Booking` table), which eliminates anomalies during updates.
