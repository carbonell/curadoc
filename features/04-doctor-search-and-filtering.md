# Feature: Doctor Search, Filtering & Selection

## 1. Intent
The **Doctor Search, Filtering & Selection** feature empowers patients to find, filter, compare, and select board-certified physicians that fit their clinical needs, geographic proximity, financial requirements (insurance co-pay vs. self-pay rates), and calendar availability.

---

## 2. Explanation of How It Works (User Perspective)
1. **Navigating to the Specialist Directory**:
   - The user reaches the `/doctors` directory by:
     - Submitting a search from the home page.
     - Clicking **"Find Doctors"** or **"Specialties"** in the top navigation bar.
     - Directly entering `/doctors` in the browser.
2. **Reviewing Specialist Results**:
   - The user sees the total count of matching physicians found in their area (e.g., *"2 board-certified specialists found in your area"*).
   - In the left pane, the user browses individual doctor cards:
     - **Provider Identity & Credentials**: Doctor's full name and post-nominal credentials (e.g., `Dr. Sarah Jenkins, MD, FACC`).
     - **Specialty Designation**: Primary specialty and specific subspecialty (e.g., `Cardiology - Cardiologist & Electrophysiologist`).
     - **Patient Satisfaction**: Aggregate rating and count of verified patient reviews (e.g., `★ 4.96 (428 verified reviews)`).
     - **Special Honors**: Visual pill badge if recognized as `"Top Rated"`.
     - **Affiliated Facility**: Hospital or clinical center where the physician practices.
     - **Next Available Slot**: Clear indication of earliest opening (e.g., formatted date/time or `"Tomorrow"`).
     - **Financial Transparency**: Co-pay estimate with in-network insurance (e.g., `"$45 Copay (with BCBS)"`) alongside self-pay rates (`"$180 Self-pay"`).
3. **Interactive Selection & Location Preview**:
   - Clicking any doctor card immediately selects that provider.
   - The selected card highlights with an active dark emerald border and focus ring.
   - The right pane updates dynamically with a dedicated preview card showing:
     - The selected doctor's name and credentials.
     - A clinical match indicator (e.g., `"98% Match"`).
     - The full street address of the practice location.
     - A primary scheduling button: **"Select & Schedule at This Location"**.
4. **Initiating Booking**:
   - The user clicks either **"Book Appointment"** on the physician card or **"Select & Schedule at This Location"** in the preview pane to transition to the 3-step booking flow for that doctor (`/book/:doctorId`).

---

## 3. Inputs

### Search & Filter Parameters (URL Query String or API Query)
| Parameter | Type | Source | Description | Example Values |
|-----------|------|--------|-------------|----------------|
| `specialty` | String | URL Query (`?specialty=...`) | Keyword matched against primary specialty, subspecialty, or doctor's full name | `"Cardiology"`, `"Jenkins"` |
| `location` | String | URL Query (`?location=...`) | Matched against clinic city or postal ZIP code | `"Chicago"`, `"60611"` |
| `insurance` | String | URL Query (`?insurance=...`) | Insurance plan context for co-pay calculations | `"BCBS PPO"` |
| `gender` | String | API Query Parameter | Filter by doctor gender | `"Female"`, `"Male"`, `"Any"` |
| `minRating` | Decimal | API Query Parameter | Minimum average rating threshold | `4.5` |
| `sortBy` | String | API Query Parameter | Sorting mode | `"rating"`, `"availability"` |

### User UI Interactions
- **Doctor Card Click**: Sets the active `selectedDoctor` state.
- **"Book Appointment" Link Click**: Navigates to `/book/${doc.id}`.
- **"Select & Schedule at This Location" Link Click**: Navigates to `/book/${selectedDoctor.id}`.

---

## 4. Validations (What is Validated)

### Backend Validations & Query Execution (`DoctorsController.SearchDoctors`)
- **Specialty Keyword Filtering**:
  ```csharp
  if (!string.IsNullOrWhiteSpace(filter.Specialty))
  {
      var term = filter.Specialty.Trim().ToLower();
      query = query.Where(d =>
          d.PrimarySpecialty.ToLower().Contains(term) ||
          (d.SubSpecialty != null && d.SubSpecialty.ToLower().Contains(term)) ||
          d.FullName.ToLower().Contains(term));
  }
  ```
  Ensures case-insensitive containment across primary specialty, subspecialty, and doctor full name.
- **Location Filtering**:
  ```csharp
  if (!string.IsNullOrWhiteSpace(filter.Location))
  {
      var loc = filter.Location.Trim().ToLower();
      query = query.Where(d =>
          d.Clinic != null &&
          (d.Clinic.City.ToLower().Contains(loc) || d.Clinic.ZipCode.Contains(loc)));
  }
  ```
  Validates clinic linkage and matches against city or postal ZIP code.
- **Gender Filter Validation**: Ignores empty or `"Any"` values; filters by exact gender equality when specified.
- **Minimum Rating Boundary**: Enforces `d.AverageRating >= filter.MinRating.Value`.
- **Sorting Logic**:
  - `sortBy=availability`: Sorts ascending by `NextAvailableSlot`.
  - Default / fallback: Sorts descending by `AverageRating`.

### Frontend Validations
- **Array Safety**: Checks `if (list.length > 0) setSelectedDoctor(list[0]);` so that the preview panel is never bound to a null doctor reference when results exist.
- **Date Formatting Fallback**: Checks `doc.nextAvailableSlot ? new Date(doc.nextAvailableSlot).toLocaleString() : 'Tomorrow'`.

---

## 5. Outputs

### API Response (`GET /api/doctors?specialty=...&location=...`)
- **HTTP Status**: `200 OK`
- **Output Payload (`DoctorCardDto[]`)**:
  ```json
  [
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
        "reviewCount": 1240,
        "availableSlotsToday": 18,
        "hasParkingValidation": true,
        "isAdaCompliant": true,
        "latitude": 41.8947,
        "longitude": -87.6216
      }
    }
  ]
  ```

### UI Outputs
- Real-time specialist count banner.
- List of clickable doctor cards with active indicator borders.
- Interactive clinic and map preview pane with match badge (`98% Match`) and full physical location details.
- Direct booking navigation buttons linking to `/book/:doctorId`.

---

## Technical References
- **Component**: [`frontend/src/pages/DoctorSearchPage.tsx`](file:///C:/Users/carbo/repos/CuraDoc/frontend/src/pages/DoctorSearchPage.tsx)
- **Route**: `/doctors` (defined in [`frontend/src/App.tsx`](file:///C:/Users/carbo/repos/CuraDoc/frontend/src/App.tsx))
- **API Client**: [`frontend/src/services/curaDocApi.ts`](file:///C:/Users/carbo/repos/CuraDoc/frontend/src/services/curaDocApi.ts) (`searchDoctors`)
- **Backend Controller**: [`backend/CuraDoc.Api/Controllers/ApiControllers.cs`](file:///C:/Users/carbo/repos/CuraDoc/backend/CuraDoc.Api/Controllers/ApiControllers.cs) (`DoctorsController.SearchDoctors`)
