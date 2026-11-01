import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MainLayout } from './components/MainLayout';
import { HomePage } from './pages/HomePage';
import { DoctorSearchPage } from './pages/DoctorSearchPage';
import { BookConsultationPage } from './pages/BookConsultationPage';
import { AppointmentConfirmationPage } from './pages/AppointmentConfirmationPage';
import { SignInPage } from './pages/SignInPage';
import { DoctorSignUpPage } from './pages/DoctorSignUpPage';
import { BackofficePage } from './pages/BackofficePage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/doctors" element={<DoctorSearchPage />} />
          <Route path="/book/:doctorId" element={<BookConsultationPage />} />
          <Route path="/appointments/:code" element={<AppointmentConfirmationPage />} />
          <Route path="/for-doctors/apply" element={<DoctorSignUpPage />} />
          <Route path="/backoffice" element={<BackofficePage />} />
          <Route path="/sign-in" element={<SignInPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
