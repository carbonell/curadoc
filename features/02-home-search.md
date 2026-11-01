# Feature: Home Search & Provider Discovery

## 1. Intent
The **Home Search & Provider Discovery** feature serves as the primary landing page discovery mechanism. Its intent is to allow prospective and returning patients to quickly initiate targeted searches for certified physicians based on their specific health condition or medical specialty, geographic location (city or zip code), and health insurance network.

---

## 2. Explanation of How It Works (User Perspective)
1. **Landing on CuraDoc**: The user arrives at the CuraDoc homepage (`/`).
2. **Hero Section Interaction**:
   - The user sees the banner: *"NATIONWIDE NETWORK OF 45,000+ BOARD-CERTIFIED DOCTORS"* and the primary call-to-action headline *"Find and book top-rated doctors near you"*.
   - A 4-column search bar is placed prominently in the center of the hero viewport.
3. **Specifying Search Criteria**:
   - The user enters a medical specialty or condition (e.g., `"Cardiology"` or `"Cardiologist"`) into the first input field.
   - The user enters their target city or postal zip code into the second input field (pre-filled with `"Chicago, IL"` by default).
   - The user specifies their insurance provider/plan in the third input field (pre-filled with `"BCBS PPO"` by default).
4. **Executing the Search**:
   - The user clicks the **"Search Doctors"** button or presses Enter.
   - The application constructs a query string containing the user's inputs and immediately routes them to the `/doctors` directory page with matching results preloaded.

---

## 3. Inputs
The feature takes three search parameter inputs from the user:

| Input Field | Type | UI Control | Required | Description | Default Value |
|-------------|------|------------|----------|-------------|---------------|
| `specialty` | String | Text Input | No | Medical specialty, clinical subspecialty, or provider name | `""` (empty) |
| `location` | String | Text Input | No | City name or 5-digit ZIP code | `"Chicago, IL"` |
| `insurance` | String | Text Input | No | Health insurance carrier or plan name | `"BCBS PPO"` |

**Trigger**: Form submission via the **"Search Doctors"** button or keyboard Enter key.

---

## 4. Validations (What is Validated)
- **URL Parameter Encoding**: Inputs are serialized via `new URLSearchParams({ specialty, location, insurance }).toString()`, ensuring that special characters, commas, and spaces are correctly encoded for URL safety.
- **Null / Empty String Handling**: Empty inputs are handled gracefully without breaking URL syntax or triggering client-side crashes.
- **Frontend Submission Interception**: Form submission intercepts the standard HTML form action using `e.preventDefault()`, preventing unnecessary full-page browser reloads.

---

## 5. Outputs
- **URL Navigation Transition**: Navigates the browser to `/doctors` with the query string appended:
  ```
  /doctors?specialty={specialty}&location={location}&insurance={insurance}
  ```
- **Filter State Propagation**: The search parameters passed in the query string are automatically extracted by the Doctor Search directory page to trigger filtered provider querying against the backend.

---

## Technical References
- **Component**: [`frontend/src/pages/HomePage.tsx`](file:///C:/Users/carbo/repos/CuraDoc/frontend/src/pages/HomePage.tsx)
- **Route**: `/` (defined in [`frontend/src/App.tsx`](file:///C:/Users/carbo/repos/CuraDoc/frontend/src/App.tsx))
- **Target Destination**: [`frontend/src/pages/DoctorSearchPage.tsx`](file:///C:/Users/carbo/repos/CuraDoc/frontend/src/pages/DoctorSearchPage.tsx) (`/doctors`)
