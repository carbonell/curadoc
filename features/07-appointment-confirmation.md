# Feature: Appointment Confirmation & Digital Check-In

## 1. Intent
The **Appointment Confirmation & Digital Check-In** feature provides patients with an official, tamper-evident digital receipt and check-in confirmation for their medical consultation. It ensures patients have immediate access to their unique booking identifier, provider credentials, facility logistics, exact appointment date/time, and financial copay records.

---

## 2. Explanation of How It Works (User Perspective)
1. **Landing on the Confirmation Page**:
   - The user arrives at `/appointments/:code` either via automatic redirection after completing booking or by clicking a link sent to their email or SMS.
2. **Reviewing Confirmation Status**:
   - The user sees a header badge: **"● DIGITAL CHECK-IN READY"**.
   - A clear success message confirms: *"Appointment Confirmed! A confirmation email and SMS receipt have been securely sent to [patient email]"*.
3. **Receipt Details & Clipboard Copy**:
   - **Confirmation Code Card**: A dedicated highlight box displays the unique code (e.g., `MED-8942-CH`) alongside an interactive **"Copy"** button. Clicking the button immediately copies the code to the user's clipboard for easy reference.
   - **Provider Information**: Displays the attending physician's full name, credentials, and specialty (e.g., `Dr. Sarah Jenkins, MD, FACC (Cardiology)`).
   - **Date & Time**: Displays the local date and time of the appointment formatted according to the user's locale.
   - **Clinic Address**: Lists the complete clinical name and street address for in-person arrival.
   - **Estimated Co-Pay**: Clearly displays the co-pay amount (e.g., `$45.00`) to be collected at check-in.
4. **Post-Booking Experience Feedback**:
   - Below the receipt, an optional feedback widget invites the patient to rate their booking experience (see [Post-Booking Feedback](08-post-booking-feedback.md)).
5. **Return to Home**:
   - A button labeled **"← Back to Home"** allows the user to return to the landing page.

---

## 3. Inputs

### Route Parameter
| Input | Type | Source | Required | Description | Example |
|-------|------|--------|----------|-------------|---------|
| `code` | String | URL Path (`/appointments/:code`) | Yes | Unique appointment confirmation code | `"MED-8942-CH"` |

### UI Interactive Actions
- **"Copy" Button Click**: Triggers clipboard write via `navigator.clipboard.writeText(appointment.confirmationCode)`.
- **"← Back to Home" Link Click**: Navigates back to `/`.

---

## 4. Validations (What is Validated)

### Frontend Validations
- **Loading State Guard**: If data is fetching or `code` is unresolved, renders a placeholder message: *"Loading confirmation receipt..."*.
- **URL Encoding**: In the API client, `encodeURIComponent(code)` is used to ensure codes with hyphens or symbols are transmitted safely over HTTP.

### Backend Validations (`AppointmentsController.GetByConfirmationCode`)
- **Appointment Lookup & Relational Completeness**:
  ```csharp
  var appointment = await _db.Appointments
      .Include(a => a.Doctor)
      .ThenInclude(d => d!.Clinic)
      .AsNoTracking()
      .FirstOrDefaultAsync(a => a.ConfirmationCode == code);

  if (appointment?.Doctor?.Clinic == null) return NotFound();
  ```
  Returns `404 Not Found` if the confirmation code does not match any record in the database or if associated relational doctor or clinic records are missing.

---

## 5. Outputs

### API Response (`GET /api/appointments/{code}`)
- **HTTP Status**: `200 OK` (or `404 Not Found`)
- **Response Payload (`AppointmentConfirmationDto`)**:
  ```json
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "confirmationCode": "MED-8942-CH",
    "providerFullName": "Dr. Sarah Jenkins, MD, FACC",
    "providerSpecialty": "Cardiology",
    "appointmentDateTime": "2024-10-24T10:15:00Z",
    "deliveryMode": 1,
    "clinicName": "Northwestern Memorial Heart Center",
    "clinicAddress": "676 N Saint Clair St, Suite 1400, Chicago, IL 60611",
    "estimatedCopay": 45.00,
    "patientEmail": "alex.morgan@email.com",
    "status": 2
  }
  ```

### User Interface Outputs
- Verified confirmation receipt card with confirmation code, provider details, formatted date/time, clinic location, and estimated copay.
- Clipboard copy interaction copying the code string directly to the patient's operating system clipboard.
- Embedded post-booking feedback module.

---

## Technical References
- **Component**: [`frontend/src/pages/AppointmentConfirmationPage.tsx`](file:///C:/Users/carbo/repos/CuraDoc/frontend/src/pages/AppointmentConfirmationPage.tsx)
- **Route**: `/appointments/:code` (defined in [`frontend/src/App.tsx`](file:///C:/Users/carbo/repos/CuraDoc/frontend/src/App.tsx))
- **API Client**: [`frontend/src/services/curaDocApi.ts`](file:///C:/Users/carbo/repos/CuraDoc/frontend/src/services/curaDocApi.ts) (`getAppointmentByCode`)
- **Backend Controller**: [`backend/CuraDoc.Api/Controllers/ApiControllers.cs`](file:///C:/Users/carbo/repos/CuraDoc/backend/CuraDoc.Api/Controllers/ApiControllers.cs) (`AppointmentsController.GetByConfirmationCode`)
- **Entity**: [`backend/CuraDoc.Api/Domain/Entities/DomainEntities.cs`](file:///C:/Users/carbo/repos/CuraDoc/backend/CuraDoc.Api/Domain/Entities/DomainEntities.cs) (`Appointment`)
