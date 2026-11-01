# Feature: Featured Clinics & Accredited Health Networks Discovery

## 1. Intent
The **Featured Clinics & Accredited Health Networks** feature builds trust and clinical credibility by highlighting top-rated partner hospitals, university health pavilions, and accredited regional medical centers directly on the homepage. It gives patients instant visibility into high-acuity facilities, accreditation statuses, aggregate patient satisfaction, and immediate same-day appointment availability.

---

## 2. Explanation of How It Works (User Perspective)
1. **Navigating to Featured Clinics**:
   - The user visits the homepage (`/`) and scrolls down to the **"Featured Medical Centers & Partner Hospitals"** section.
   - Alternatively, clicking the **"Clinics & Centers"** link in the navigation header anchors the viewport directly to `/#clinics`.
2. **Browsing Partner Medical Centers**:
   - The user is presented with a responsive grid displaying accredited medical organizations (e.g., *Northwestern Memorial Heart Center*, *Rush University Health Pavilion*).
   - For each facility, the user sees:
     - **Accreditation Badge**: Highlights clinical honors such as `"Level 1 Trauma Center"` or `"Magnet Recognized"`.
     - **Location**: City and State of the main medical campus (e.g., `Chicago, IL`).
     - **Center Name**: The official facility or medical system name.
     - **Patient Rating & Reviews**: Aggregate star rating and review count (e.g., `★ 4.9 (1240 reviews)`).
     - **Today's Availability**: Real-time counter of available scheduling slots today (e.g., `● 18 Slots Today`).
3. **Informed Provider Choice**:
   - Patients can confirm whether doctors affiliated with these reputable institutions are available for consultation.

---

## 3. Inputs
The feature relies on automated data retrieval when the homepage mounts:

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| None (Automated Request) | N/A | Component `useEffect` hook | Dispatches a call to `curaDocApi.getFeaturedClinics()` (`GET /api/clinics/featured`) on page load. |
| Anchor Click | URL Hash | `<a href="/#clinics">` | Navigation bar trigger that smoothly anchors the user's viewport to the clinics section. |

---

## 4. Validations (What is Validated)

### Backend Validations & Logic (`ClinicsController.GetFeaturedClinics`)
- **Rating Ordering**: Queries the `Clinics` dataset ordered descending by `AverageRating`:
  ```csharp
  _db.Clinics.AsNoTracking().OrderByDescending(c => c.AverageRating).Take(4)
  ```
- **Limit Enforcement**: Caps the output to the top 4 featured centers (`.Take(4)`) to optimize mobile and desktop page layout performance.
- **Read-Only Optimization**: Employs EF Core `AsNoTracking()` to avoid unnecessary change-tracking overhead.

### Frontend Validations
- **Optional Accreditation Badge Rendering**: Evaluates `c.badgeLabel && (...)` to ensure the badge container is rendered only when clinical designations are defined.
- **Asynchronous Error Catching**: API promise includes `.catch(console.error)` to prevent unhandled promise rejections from crashing the landing page if the backend service is offline.

---

## 5. Outputs

### API Response (`GET /api/clinics/featured`)
- **HTTP Status**: `200 OK`
- **Payload Schema (`ClinicSummaryDto[]`)**:
  ```json
  [
    {
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
  ]
  ```

### UI Rendered Elements
- Dynamic grid cards displaying facility name, accreditation badges, ratings, geographic location, and real-time appointment slot counters.

---

## Technical References
- **Frontend Page**: [`frontend/src/pages/HomePage.tsx`](file:///C:/Users/carbo/repos/CuraDoc/frontend/src/pages/HomePage.tsx)
- **API Client**: [`frontend/src/services/curaDocApi.ts`](file:///C:/Users/carbo/repos/CuraDoc/frontend/src/services/curaDocApi.ts) (`getFeaturedClinics`)
- **Backend Controller**: [`backend/CuraDoc.Api/Controllers/ApiControllers.cs`](file:///C:/Users/carbo/repos/CuraDoc/backend/CuraDoc.Api/Controllers/ApiControllers.cs) (`ClinicsController.GetFeaturedClinics`)
- **Entity**: [`backend/CuraDoc.Api/Domain/Entities/DomainEntities.cs`](file:///C:/Users/carbo/repos/CuraDoc/backend/CuraDoc.Api/Domain/Entities/DomainEntities.cs) (`Clinic`)
