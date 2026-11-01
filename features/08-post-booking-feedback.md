# Feature: Post-Booking Experience Feedback

## 1. Intent
The **Post-Booking Experience Feedback** feature collects immediate patient sentiment and qualitative observations following the booking process. By capturing a numerical satisfaction score (1 to 5 stars) alongside optional comments, the platform gathers actionable insights to optimize booking ergonomics, clinical intake transparency, and patient satisfaction.

---

## 2. Explanation of How It Works (User Perspective)
1. **Locating the Feedback Widget**:
   - Immediately beneath the appointment receipt details on `/appointments/:code`, the user sees an optional section titled **"Share Your Initial Experience (Optional)"**.
2. **Selecting a Star Rating**:
   - The user sees five interactive star icons (`★ ★ ★ ★ ★`).
   - The stars dynamically highlight in amber up to the chosen rating (defaulted to 5 stars for high patient delight).
   - The user can click any star from 1 through 5 to adjust their satisfaction level.
3. **Adding Optional Comments**:
   - The user can type remarks into the provided textarea: *"Tell us how we can make booking even easier..."*.
4. **Submitting Feedback**:
   - The user clicks the **"Submit Feedback"** button.
   - The form is instantly replaced with a friendly confirmation message:
     *"Thank you for your feedback!"*.
   - The user is prevented from accidentally submitting duplicate feedback.

---

## 3. Inputs

### Route Parameter
| Input | Type | Source | Required | Description |
|-------|------|--------|----------|-------------|
| `code` | String | URL Path (`/appointments/:code`) | Yes | Appointment confirmation code associating the feedback |

### Form Inputs (`SubmitFeedbackRequest`)
| Input Field | Type | UI Control | Required | Description | Constraints / Default |
|-------------|------|------------|----------|-------------|-----------------------|
| `rating` | Integer | Interactive Star Buttons (1–5) | Yes | Numerical patient experience rating | `Range(1, 5)`, default `5` |
| `comment` | String | Textarea | No | Qualitative feedback remarks | Max 1000 characters, optional |

**Trigger**: Form submission via the **"Submit Feedback"** button.

---

## 4. Validations (What is Validated)

### Frontend Validations
- **Presence of Code**: Ensures `code` parameter is present before issuing the API request (`if (!code) return;`).
- **Star Range Bound**: Star selector buttons strictly correspond to integers `[1, 2, 3, 4, 5]`.
- **Duplicate Prevention**: State variable `feedbackSent` toggles to `true` upon completion, unmounting the form to prevent double submissions.

### Backend Validations (`SubmitFeedbackRequest` & `AppointmentsController.SubmitFeedback`)
- **Range Attribute**:
  ```csharp
  [Range(1, 5)]
  public int Rating { get; set; }
  ```
  Enforces that rating values outside the 1–5 range return `400 Bad Request`.
- **String Length Constraint**:
  ```csharp
  [StringLength(1000)]
  public string? Comment { get; set; }
  ```
  Prevents payload overflow by restricting comments to a maximum of 1,000 characters.
- **Appointment Existence Check**:
  ```csharp
  var appointment = await _db.Appointments.FirstOrDefaultAsync(a => a.ConfirmationCode == code);
  if (appointment == null) return NotFound();
  ```
  Returns `404 Not Found` if the confirmation code is invalid or does not correspond to an existing record.

---

## 5. Outputs

### Database Updates
The target `Appointment` record in SQLite is updated with:
- `ExperienceRating = request.Rating`
- `ExperienceFeedback = request.Comment`
- `UpdatedAt = DateTime.UtcNow` (automatically set by EF Core `ChangeTracker` in `CuraDocDbContext.SaveChangesAsync`)

### API Response (`POST /api/appointments/{code}/feedback`)
- **HTTP Status**: `204 No Content`

### User Interface Feedback
- The feedback form transitions to an emerald confirmation text:
  *"Thank you for your feedback!"*

---

## Technical References
- **Component**: [`frontend/src/pages/AppointmentConfirmationPage.tsx`](file:///C:/Users/carbo/repos/CuraDoc/frontend/src/pages/AppointmentConfirmationPage.tsx)
- **API Client**: [`frontend/src/services/curaDocApi.ts`](file:///C:/Users/carbo/repos/CuraDoc/frontend/src/services/curaDocApi.ts) (`submitFeedback`)
- **Backend Controller**: [`backend/CuraDoc.Api/Controllers/ApiControllers.cs`](file:///C:/Users/carbo/repos/CuraDoc/backend/CuraDoc.Api/Controllers/ApiControllers.cs) (`AppointmentsController.SubmitFeedback`)
- **DTO**: [`backend/CuraDoc.Api/Application/DTOs/Contracts.cs`](file:///C:/Users/carbo/repos/CuraDoc/backend/CuraDoc.Api/Application/DTOs/Contracts.cs) (`SubmitFeedbackRequest`)
- **Entity**: [`backend/CuraDoc.Api/Domain/Entities/DomainEntities.cs`](file:///C:/Users/carbo/repos/CuraDoc/backend/CuraDoc.Api/Domain/Entities/DomainEntities.cs) (`Appointment.ExperienceRating`, `Appointment.ExperienceFeedback`)
