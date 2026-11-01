# Feature: Consultation Booking & Patient Intake

## 1. Intent
The **Consultation Booking & Patient Intake** feature is the core transaction engine of CuraDoc. Its intent is to guide patients through an intuitive 3-step scheduling process where they:
1. Select care delivery mode (In-Person Visit vs. Virtual Video).
2. Reserve a convenient consultation date and appointment time slot.
3. Complete patient intake documentation (legal identity, demographics, contact details, insurance identifiers, and chief clinical complaint) while guaranteeing slot concurrency and preventing double-booking.

---

## 2. Explanation of How It Works (User Perspective)
1. **Navigating to Booking**:
   - The user enters the booking workflow by clicking **"Book Appointment"** or **"Select & Schedule at This Location"** from the doctor search page (`/book/:doctorId`).
2. **Reviewing Provider Summary & Delivery Selection (Left Sidebar)**:
   - The user views the doctor's name, credentials, and specialty.
   - The user toggles their preferred **Care Delivery Mode**:
     - **In-Person Visit** (selected by default)
     - **Virtual Video**
   - The sidebar displays real-time pricing transparency:
     - Specialist Consultation Rate (e.g., `$220.00`)
     - Estimated Co-Pay (e.g., `$45.00`)
3. **Step 1 & 2: Select Date & Time (Main Form)**:
   - The user selects a date using the native calendar date picker.
   - The user clicks on an available time slot chip from the time grid:
     `09:00 AM`, `09:45 AM`, `10:15 AM`, `11:30 AM`, `01:30 PM`, `02:15 PM`, `03:00 PM`.
   - The active time slot chip highlights in solid dark emerald.
4. **Step 3: Patient Intake Details**:
   - The user inputs patient information (pre-filled with demo values for testing convenience):
     - **Full Legal Name**: Patient's legal first and last name (`Alex Morgan`).
     - **Date of Birth**: Date picker input (`1988-08-14`).
     - **Phone Number**: Patient contact number for appointment reminders (`+1 (555) 019-2834`).
     - **Email Address**: Patient email for confirmation and digital receipt delivery (`alex.morgan@email.com`).
     - **Insurance Member ID**: Insurance card policy ID (`XEJ98234189`).
     - **Group Number**: Employer/plan group number (`GRP-4401`).
     - **Primary Reason for Visit**: Multiline textarea explaining clinical concerns (e.g., *"Annual cardiac checkup and routine ECG review."*).
5. **Submitting the Booking**:
   - The user clicks the submission button: **"Confirm Appointment • $45.00 Co-Pay"**.
   - The system validates the submission, secures the appointment slot, generates a confirmation code, and redirects the user to the confirmation page (`/appointments/:confirmationCode`).

---

## 3. Inputs

### Route Parameter
- `doctorId` (GUID, required): The unique identifier of the doctor being booked.

### Form Inputs (`CreateAppointmentPayload`)
| Field Name | Type | UI Control | Required | Description | Example / Default |
|------------|------|------------|----------|-------------|-------------------|
| `deliveryMode` | Enum (`1` or `2`) | Toggle Button Group | Yes | `1` = InPersonVisit, `2` = VirtualVideo | `CareDeliveryMode.InPersonVisit` |
| `selectedDate` | String (`YYYY-MM-DD`) | Date Input | Yes | Calendar date of consultation | `"2024-10-24"` |
| `selectedTime` | String (`HH:MM AM/PM`) | Time Chip Button | Yes | Chosen consultation time | `"10:15 AM"` |
| `patientFullName` | String | Text Input | Yes | Patient's full legal name | `"Alex Morgan"` |
| `patientDateOfBirth`| DateOnly (`YYYY-MM-DD`)| Date Input | Yes | Patient's date of birth | `"1988-08-14"` |
| `patientPhoneNumber`| String | Tel Input | Yes | Patient's contact telephone number | `"+1 (555) 019-2834"` |
| `patientEmail` | String | Email Input | Yes | Patient's email address | `"alex.morgan@email.com"` |
| `insuranceMemberId`| String | Text Input | No | Insurance member/subscriber ID | `"XEJ98234189"` |
| `insuranceGroupNumber`| String | Text Input | No | Group identifier on insurance card | `"GRP-4401"` |
| `primaryReasonForVisit`| String | Textarea | No | Primary reason or symptoms for visit | `"Annual cardiac checkup..."` |
| `isForSelf` | Boolean | Backend Flag | Yes | Booking for self vs family member | `true` |
| `smsRemindersOptIn`| Boolean | Backend Flag | Yes | SMS reminder notifications opt-in | `true` |
| `scheduleSlotId` | GUID | Payload Parameter | No | Specific schedule slot ID if bound | `null` |

---

## 4. Validations (What is Validated)

### Frontend Validations
- **Required Fields**: HTML5 `required` constraints on Full Legal Name, Date of Birth, Phone Number, and Email Address.
- **Type Constraints**: Native `type="date"` for valid date parsing and `type="email"` for email address syntax.
- **Doctor Load Safety**: Form submission terminates immediately if the doctor profile is not yet loaded into state (`if (!doctor) return;`).

### Backend Model Validations (`CreateAppointmentRequest`)
Using Data Annotations in .NET:
- `DoctorId`: `[Required]` GUID.
- `AppointmentDateTime`: `[Required]` DateTime.
- `DeliveryMode`: `[Required]` Enum value (`CareDeliveryMode`).
- `PatientFullName`: `[Required]`, `[StringLength(150, MinimumLength = 2)]`.
- `PatientDateOfBirth`: `[Required]` DateOnly.
- `PatientPhoneNumber`: `[Required]`, `[Phone]` format validation.
- `PatientEmail`: `[Required]`, `[EmailAddress]`, max length 150 characters.
- `InsuranceMemberId`: `[StringLength(64)]`.
- `InsuranceGroupNumber`: `[StringLength(64)]`.
- `PrimaryReasonForVisit`: `[StringLength(1000)]`.

### Backend Business Logic & Integrity Checks (`AppointmentsController.CreateAppointment`)
1. **Doctor & Clinic Existence**:
   ```csharp
   var doctor = await _db.Doctors.Include(d => d.Clinic).FirstOrDefaultAsync(d => d.Id == request.DoctorId);
   if (doctor == null || doctor.Clinic == null)
       return BadRequest(new { message = "Selected healthcare provider was not found." });
   ```
   Rejects invalid or unlinked doctor IDs with `400 Bad Request`.
2. **Double-Booking Prevention / Concurrency Lock**:
   ```csharp
   if (request.ScheduleSlotId.HasValue)
   {
       var slot = await _db.ScheduleSlots.FirstOrDefaultAsync(s => s.Id == request.ScheduleSlotId.Value && s.DoctorId == doctor.Id);
       if (slot is { IsBooked: true })
           return Conflict(new { message = "The requested time slot has already been reserved." });

       if (slot != null)
           slot.IsBooked = true;
   }
   ```
   Returns `409 Conflict` if another patient has already booked the targeted slot. Marks slot `IsBooked = true` atomically on save.
3. **Database Unique Constraints**: `ConfirmationCode` column is indexed with unique constraint (`entity.HasIndex(a => a.ConfirmationCode).IsUnique()`).

---

## 5. Outputs

### Database Entity Creation
A new `Appointment` record is persisted in SQLite with:
- `ConfirmationCode`: Randomly generated code formatted as `MED-{4-digit random}-CH` (e.g. `MED-7824-CH`).
- `Status`: Set to `AppointmentStatus.Confirmed` (`2`).
- `EstimatedCopay`: Copied directly from the doctor's `StandardCopay`.
- `DeliveryMode`: Specified delivery mode (`InPersonVisit` or `VirtualVideo`).
- Full intake attributes persisted for clinical check-in.

### API Response (`POST /api/appointments`)
- **HTTP Status**: `201 Created`
- **Location Header**: `/api/appointments/{confirmationCode}`
- **Response Payload (`AppointmentConfirmationDto`)**:
  ```json
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "confirmationCode": "MED-7824-CH",
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

### User Navigation
- The client navigates automatically to the confirmation receipt page:
  `/appointments/MED-7824-CH`

---

## Technical References
- **Component**: [`frontend/src/pages/BookConsultationPage.tsx`](file:///C:/Users/carbo/repos/CuraDoc/frontend/src/pages/BookConsultationPage.tsx)
- **Route**: `/book/:doctorId` (defined in [`frontend/src/App.tsx`](file:///C:/Users/carbo/repos/CuraDoc/frontend/src/App.tsx))
- **API Client**: [`frontend/src/services/curaDocApi.ts`](file:///C:/Users/carbo/repos/CuraDoc/frontend/src/services/curaDocApi.ts) (`createAppointment`)
- **Backend Controller**: [`backend/CuraDoc.Api/Controllers/ApiControllers.cs`](file:///C:/Users/carbo/repos/CuraDoc/backend/CuraDoc.Api/Controllers/ApiControllers.cs) (`AppointmentsController.CreateAppointment`)
- **DTOs**: [`backend/CuraDoc.Api/Application/DTOs/Contracts.cs`](file:///C:/Users/carbo/repos/CuraDoc/backend/CuraDoc.Api/Application/DTOs/Contracts.cs) (`CreateAppointmentRequest`, `AppointmentConfirmationDto`)
- **Entities**: [`backend/CuraDoc.Api/Domain/Entities/DomainEntities.cs`](file:///C:/Users/carbo/repos/CuraDoc/backend/CuraDoc.Api/Domain/Entities/DomainEntities.cs) (`Appointment`, `DoctorScheduleSlot`)
