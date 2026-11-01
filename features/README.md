# CuraDoc Features Documentation

This directory contains specifications and documentation for every feature currently implemented in the **CuraDoc** medical booking platform.

## Application Overview

CuraDoc is a digital health platform enabling patients to discover board-certified healthcare specialists, review clinical credentials and copay estimates, schedule in-person or virtual appointments, complete digital patient intake, and access digital check-in receipts.

- **Frontend Tech Stack**: React 18, TypeScript, Vite, Tailwind CSS, React Router v6
- **Backend Tech Stack**: .NET 10 Web API, ASP.NET Core, Entity Framework Core, SQLite
- **Architecture**: REST API with OpenAPI specifications and decoupled Single Page Application (SPA)

---

## Catalog of Features

| # | Feature | Scope | Route / Endpoint | Description |
|---|---------|-------|------------------|-------------|
| 1 | [Sign In](01-sign-in.md) | Auth / Portal | `/sign-in` | Portal authentication gateway for patients and practitioners to manage clinical records. |
| 2 | [Home Search & Provider Discovery](02-home-search.md) | Discovery | `/` | Hero search form allowing patients to query specialists by condition, location, and insurance. |
| 3 | [Featured Clinics & Health Networks](03-featured-clinics.md) | Discovery / Trust | `GET /api/clinics/featured` | Showcase of accredited medical centers and partner hospitals with ratings and real-time slot availability. |
| 4 | [Doctor Search, Filtering & Selection](04-doctor-search-and-filtering.md) | Directory | `/doctors`<br>`GET /api/doctors` | Interactive doctor directory with faceted filtering (specialty, location, gender, rating) and location preview. |
| 5 | [Doctor Details & Schedule Slots](05-doctor-details-and-availability.md) | Scheduling | `GET /api/doctors/{id}`<br>`GET /api/doctors/{id}/slots` | Provider profile inspection and real-time schedule slot retrieval. |
| 6 | [Consultation Booking & Patient Intake](06-book-consultation.md) | Booking Flow | `/book/:doctorId`<br>`POST /api/appointments` | 3-step consultation booking flow with delivery mode selection, calendar slots, patient intake form, and conflict check. |
| 7 | [Appointment Confirmation & Digital Check-In](07-appointment-confirmation.md) | Post-Booking | `/appointments/:code`<br>`GET /api/appointments/{code}` | Digital check-in receipt with unique confirmation code (`MED-XXXX-CH`), provider logistics, and clipboard copy. |
| 8 | [Post-Booking Experience Feedback](08-post-booking-feedback.md) | Quality / Sentiment | `POST /api/appointments/{code}/feedback` | In-flow 1–5 star rating and feedback submission for appointment booking experience. |

---

## Documentation Structure per Feature

Each feature specification document adheres to the required template:
1. **Intent**: The core objective and business purpose of the feature.
2. **User Perspective**: Step-by-step description of the user experience and UI interactions.
3. **Inputs**: Form fields, parameters, URL tokens, and interactive triggers.
4. **Validations**: Client-side validations, DTO rules, API business logic, and error handling.
5. **Outputs**: Rendered states, database changes, API responses, and user receipts.
