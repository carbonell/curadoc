# Feature: Doctor Profile & Schedule Slots Availability

## 1. Intent
The **Doctor Profile & Schedule Slots Availability** feature provides detailed, physician-specific clinical data and real-time appointment calendar availability. It ensures that when a patient decides to book an appointment with a given provider, the application can verify provider credentials, retrieve financial rates, and obtain unreserved scheduling slots.

---

## 2. Explanation of How It Works (User Perspective)
1. **Transition from Search to Booking**:
   - When a patient selects a doctor from the directory or enters a booking URL (`/book/:doctorId`), the application queries the doctor's complete profile using the doctor's unique identifier.
2. **Reviewing Doctor Details**:
   - The user sees the verified clinical profile:
     - Board Certification badge (*"Board Certified Specialist"*).
     - Full name and post-nominal designations (e.g., `Dr. Sarah Jenkins, MD, FACC`).
     - Primary medical specialty.
     - Affiliated clinic information.
     - Out-of-pocket specialist consultation rate and estimated insurance co-pay rate.
3. **Retrieving Available Slots**:
   - The system checks available calendar dates and time slots for the provider.
   - Any booked or unavailable slots are locked out, allowing the patient to choose only open consultation windows.

---

## 3. Inputs

### Path & Query Parameters
| Input | Type | Source | Required | Description | Example Value |
|-------|------|--------|----------|-------------|---------------|
| `id` / `doctorId` | GUID (UUID v4) | Route Path (`/api/doctors/{id}` or `/book/:doctorId`) | Yes | Unique identifier of the physician | `7f8b9a10-2345-4cde-8901-abcdef123456` |
| `date` | DateOnly (`YYYY-MM-DD`) | Query Parameter (`/api/doctors/{id}/slots?date=...`) | No | Target calendar date for retrieving open schedule slots | `2026-11-02` |

---

## 4. Validations (What is Validated)

### Backend Validations (`DoctorsController`)

#### 1. Provider Identity Verification (`GetDoctorById`)
- **Route Constraint**: `{id:guid}` guarantees that non-GUID values are rejected at the routing layer with HTTP 404/400.
- **Null / Relational Integrity Check**:
  ```csharp
  var d = await _db.Doctors.Include(x => x.Clinic).AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
  if (d == null || d.Clinic == null) return NotFound();
  ```
  Returns `404 Not Found` if the doctor ID does not exist in the database or has no active clinic affiliation.

#### 2. Slot Date Filtering & Availability Logic (`GetAvailableSlots`)
- **Date Range Boundary Validation**:
  ```csharp
  if (date.HasValue)
  {
      var start = date.Value.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
      var end = date.Value.ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc);
      query = query.Where(s => s.StartTimeUtc >= start && s.StartTimeUtc <= end);
  }
  ```
  Ensures UTC timestamp bounds match the full 24-hour day without timezone skew.
- **Chronological Ordering**: Slots are ordered by `StartTimeUtc` ascending.

---

## 5. Outputs

### Doctor Profile API Response (`GET /api/doctors/{id}`)
- **HTTP Status**: `200 OK` (or `404 Not Found`)
- **Payload (`DoctorCardDto`)**:
  ```json
  {
    "id": "7f8b9a10-2345-4cde-8901-abcdef123456",
    "fullName": "Dr. Sarah Jenkins",
    "credentials": "MD, FACC",
    "primarySpecialty": "Cardiology",
    "subSpecialty": "Cardiologist & Electrophysiologist",
    "isBoardCertified": true,
    "isTopRated": true,
    "averageRating": 4.96,
    "verifiedReviewCount": 428,
    "consultationRate": 220.00,
    "standardCopay": 45.00,
    "selfPayRate": 180.00,
    "nextAvailableSlot": "2026-11-02T10:15:00Z",
    "clinic": {
      "id": "e4b2d358-1011-4770-bc0f-c35017df854e",
      "name": "Northwestern Memorial Heart Center",
      "streetAddress": "676 N Saint Clair St, Suite 1400",
      "city": "Chicago",
      "state": "IL",
      "zipCode": "60611",
      "phoneNumber": "(312) 555-0198",
      "badgeLabel": "Level 1 Trauma Center",
      "averageRating": 4.9,
      "reviewCount": 1240",
      "availableSlotsToday": 18,
      "hasParkingValidation": true,
      "isAdaCompliant": true,
      "latitude": 41.8947,
      "longitude": -87.6216
    }
  }
  ```

### Available Slots API Response (`GET /api/doctors/{id}/slots`)
- **HTTP Status**: `200 OK`
- **Payload (`ScheduleSlotDto[]`)**:
  ```json
  [
    {
      "id": "3c91e102-4f32-48a0-9c11-9a7428f521b4",
      "startTimeUtc": "2026-11-02T14:15:00Z",
      "durationMinutes": 30,
      "isBooked": false
    }
  ]
  ```

---

## Technical References
- **API Client**: [`frontend/src/services/curaDocApi.ts`](file:///C:/Users/carbo/repos/CuraDoc/frontend/src/services/curaDocApi.ts) (`getDoctorById`, `getDoctorSlots`)
- **Backend Controller**: [`backend/CuraDoc.Api/Controllers/ApiControllers.cs`](file:///C:/Users/carbo/repos/CuraDoc/backend/CuraDoc.Api/Controllers/ApiControllers.cs) (`DoctorsController.GetDoctorById`, `DoctorsController.GetAvailableSlots`)
- **Entities**: [`backend/CuraDoc.Api/Domain/Entities/DomainEntities.cs`](file:///C:/Users/carbo/repos/CuraDoc/backend/CuraDoc.Api/Domain/Entities/DomainEntities.cs) (`Doctor`, `DoctorScheduleSlot`)
