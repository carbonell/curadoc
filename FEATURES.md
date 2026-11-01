# CuraDoc — System Features & Functional Specification

This document serves as the official, living catalog of all implemented features, domain models, API endpoints, and frontend modules in **CuraDoc**.

> **Project Rule:** Every time a new requirement or feature is requested and implemented in this repository, this `FEATURES.md` document MUST be updated to document the new entities, endpoints, UI screens, and security rules.

---

## 1. Patient Discovery & Appointment Booking

### 1.1 Landing & Discovery Page (`/`)
- **Frontend Component:** [`HomePage.tsx`](frontend/src/pages/HomePage.tsx)
- **Capabilities:**
  - Search bar filtering doctors by **Condition/Specialty**, **City/Zip Code**, and **Insurance Coverage**.
  - Displays **Featured Medical Centers & Partner Hospitals** (`GET /api/clinics/featured`) with accreditation badges (e.g., *Level 1 Trauma Center*, *Magnet Recognized*), average rating, review counts, and live slot counts.

### 1.2 Specialist Search & Split-Map View (`/doctors`)
- **Frontend Component:** [`DoctorSearchPage.tsx`](frontend/src/pages/DoctorSearchPage.tsx)
- **API Endpoint:** `GET /api/doctors`
- **Capabilities:**
  - Filters board-certified doctors by specialty, location, gender, minimum rating, and sort order.
  - Displays verified ratings, next available slot, in-network co-pay (`$45`), self-pay rate, and an interactive location card.

### 1.3 3-Step Consultation Scheduling (`/book/:doctorId`)
- **Frontend Component:** [`BookConsultationPage.tsx`](frontend/src/pages/BookConsultationPage.tsx)
- **API Endpoints:** `GET /api/doctors/{id}`, `GET /api/doctors/{id}/slots`, `POST /api/appointments`
- **Capabilities:**
  - **Step 1 & 2:** Care delivery mode toggle (`In-Person Visit` vs. `Virtual Video`), date selection, and time slot picker.
  - **Step 3:** Patient intake form (Full Legal Name, Date of Birth, Phone, Email, Insurance Member ID, Group Number, Primary Reason for Visit, SMS opt-in) with financial co-pay breakdown.

### 1.4 Appointment Confirmation & Experience Poll (`/appointments/:code`)
- **Frontend Component:** [`AppointmentConfirmationPage.tsx`](frontend/src/pages/AppointmentConfirmationPage.tsx)
- **API Endpoints:** `GET /api/appointments/{code}`, `POST /api/appointments/{code}/feedback`
- **Capabilities:**
  - Displays unique confirmation code (`MED-XXXX-CH`), digital check-in status, provider summary, clinic address, and an optional 5-star post-booking experience rating poll.

---

## 2. Practitioner Credentialing & Doctor Sign-Up Workflow

### 2.1 Public Doctor Sign-Up Form (`/for-doctors/apply`)
- **Frontend Component:** [`DoctorSignUpPage.tsx`](frontend/src/pages/DoctorSignUpPage.tsx)
- **Domain Entity:** [`DoctorApplication`](backend/CuraDoc.Api/Domain/Entities/DomainEntities.cs)
- **API Endpoints:**
  - `POST /api/doctorapplications` — Submits a new doctor onboarding application with `Pending` status.
  - `GET /api/doctorapplications/{id}` — Retrieves application status.
- **Captured Fields:**
  - **Personal & Clinical Identity:** Full Legal Name, Medical Credentials (`MD, FACC`), Institutional Email, Direct Phone Number, Gender, Primary Specialty, Sub-Specialty, Preferred Medical Center, Proposed Consultation Rate, and Standard Co-Pay.
  - **Mandatory Regulatory Fields:**
    - `ExequaturNumber` — Medical Exequatur license number.
    - `IdentityDocumentNumber` — National Identity Document / Passport number.
  - **Social Media & Professional Profiles:**
    - `LinkedInUrl` — LinkedIn professional profile link.
    - `InstagramOrXUrl` — Professional Instagram / X link.
    - `WebsiteOrResearchGateUrl` — ResearchGate or clinical publication profile link.
- **Manual Validation Lifecycle:** Newly submitted applications are stored with `DoctorApplicationStatus.Pending` and do not appear in the public doctor search until manually reviewed and approved by a **SuperAdmin** in the Backoffice.

---

## 3. SuperAdmin Backoffice & Governance Portal

### 3.1 Role-Based Access Control (SuperAdmin Only)
- **Backend Security Filter:** [`RequireSuperAdminAttribute`](backend/CuraDoc.Api/Infrastructure/Auth/SuperAdminAuth.cs) & [`SimpleTokenService`](backend/CuraDoc.Api/Infrastructure/Auth/SuperAdminAuth.cs)
- **Authentication Endpoint:** `POST /api/auth/login`
- **Frontend Portal:** [`SignInPage.tsx`](frontend/src/pages/SignInPage.tsx) & [`BackofficePage.tsx`](frontend/src/pages/BackofficePage.tsx) (`/backoffice`)
- **Access Enforcement:**
  - All `/api/backoffice/*` endpoints require a valid `Bearer` token belonging to a user with `UserRole.SuperAdmin`. Unauthenticated requests return `401 Unauthorized`; non-SuperAdmin users receive `403 Forbidden`.
  - Default seeded **SuperAdmin** credentials: `admin@curadoc.com` / `Admin123!`.

### 3.2 Doctor Sign-Up Validation Module
- **Endpoints:**
  - `GET /api/backoffice/doctor-applications` — Lists all pending, approved, and rejected doctor applications.
  - `POST /api/backoffice/doctor-applications/{id}/review` — Approves or rejects an application with `ReviewerNotes`, `ReviewedAt`, and `ReviewedByEmail`.
- **Automatic Provisioning on Approval:** When a SuperAdmin approves a `DoctorApplication`, the system automatically creates and links a verified [`Doctor`](backend/CuraDoc.Api/Domain/Entities/DomainEntities.cs) entity (carrying over the doctor's `ExequaturNumber`, `IdentityDocumentNumber`, social media profile URLs, specialty, rates, and preferred clinic) so the practitioner immediately becomes bookable in the public directory.

### 3.3 Core Catalog CRUD Modules
The SuperAdmin Backoffice (`/backoffice`) provides management interfaces and REST CRUD endpoints for all core catalog entities used across the application:
1. **Medical Specialties CRUD** (`/api/backoffice/specialties` — `GET`, `POST`, `PUT`, `DELETE` + public `GET /api/catalog/specialties`)
2. **Clinics & Medical Centers CRUD** (`/api/backoffice/clinics` — `GET`, `POST`, `PUT`, `DELETE` + public `GET /api/clinics`)
3. **Insurance Providers & Plans CRUD** (`/api/backoffice/insurances` — `GET`, `POST`, `PUT`, `DELETE` + public `GET /api/catalog/insurances`)
4. **Verified Doctors Directory Management** (`/api/backoffice/doctors` — `GET`, `DELETE`)
