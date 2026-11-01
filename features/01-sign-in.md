# Feature: Sign In (Patient & Practitioner Portal Access)

## 1. Intent
The primary intent of the **Sign In** feature is to provide an authentication gateway for patients and healthcare practitioners to access their personal health management portal. Through this portal, users can review scheduled appointments, retrieve digital check-in receipts, manage profile details, and access verified clinical review history.

---

## 2. Explanation of How It Works (User Perspective)
1. **Accessing the Portal**: The user accesses the Sign In page either by clicking the **"Sign In"** link in the top navigation header on any page or by navigating directly to `/sign-in`.
2. **Visual Presentation & Assurance**:
   - The user is greeted by a two-column portal card.
   - The left pane reinforces trust with clinical accreditation highlights (*"Accredited Clinical Gateway"*, *"Over 1.2M verified patient appointments booked nationwide through CuraDoc"*, and a *4.9 / 5.0* rating badge).
   - The right pane contains the authentication form labeled **"PATIENT & PRACTITIONER PORTAL - Sign In to Your Account"**.
3. **Entering Credentials**:
   - The user enters their registered **Email Address** (prefilled with sample demo data `alex.morgan@email.com` for rapid review).
   - The user enters their confidential **Password** into a masked input field.
4. **Submitting the Form**:
   - The user clicks the **"Sign In →"** button.
   - Upon form submission, the application routes the user into the active doctor directory (`/doctors`) where they can proceed with finding and scheduling specialist care.

---

## 3. Inputs
The feature accepts the following user inputs:

| Input Field | Type | UI Control | Required | Description | Default / Example Value |
|-------------|------|------------|----------|-------------|-------------------------|
| `email` | String | Email Input (`<input type="email">`) | Yes | Registered account email address | `alex.morgan@email.com` |
| `password` | String | Password Input (`<input type="password">`) | Yes | Confidential account access password | `••••••••••••` |

**Trigger**: Form submission event via clicking the **"Sign In →"** button or pressing Enter within the form fields.

---

## 4. Validations (What is Validated)
The following validations are enforced:

### Frontend Validations
- **Presence Validation**: Both the `email` and `password` fields have HTML5 `required` attributes set. The browser prevents submission if either field is blank.
- **Email Format Validation**: The email input utilizes `type="email"`, validating that the entered string adheres to standard email structure (e.g., must contain `@` and domain elements).
- **Default Event Prevention**: `e.preventDefault()` halts default browser postback to allow client-side SPA routing.

### Backend & Architectural Notes
- The current implementation serves as the prototype front-end gateway for authentication.
- In production, credentials will be verified against a secure identity store (e.g., ASP.NET Core Identity with PBKDF2/bcrypt hashing) returning a JWT Bearer token or HttpOnly authentication cookie, with validation against locked accounts, invalid password attempts, and email confirmation status.

---

## 5. Outputs
Upon interaction with the Sign In feature, the following outputs are produced:

- **Navigation Transition**: The user is navigated to the doctor directory route (`/doctors`).
- **Session Continuity**: User flow transitions from portal login to provider search and booking.
- **Visual Feedback**: Interactive focus states on input fields (`focus:ring`), button hover state transitions (`hover:bg-emerald-900`), and form validation tooltips on missing inputs.

---

## Technical References
- **Component**: [`frontend/src/pages/SignInPage.tsx`](file:///C:/Users/carbo/repos/CuraDoc/frontend/src/pages/SignInPage.tsx)
- **Route**: `/sign-in` (defined in [`frontend/src/App.tsx`](file:///C:/Users/carbo/repos/CuraDoc/frontend/src/App.tsx))
