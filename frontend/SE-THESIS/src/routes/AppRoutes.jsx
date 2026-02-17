import { useState, useEffect, useRef } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import LoadingPage from "../components/pages/loadingPage.jsx";
import HomePage from "../pages/homepage.jsx";
import SignUpPage from "../auth/signUpPage.jsx";
import LoginPage from "../auth/loginPage.jsx";
import DashboardPage from "../pages/dashboardPage.jsx";
import ActivityPage from "../pages/activityPage.jsx";
import AnalyticsPage from "../pages/analyticsPage.jsx";
import NotificationPage from "../pages/notificationPage.jsx";
import Layout from "../components/layouts/layout.jsx";
import DevelopmentPage from "../components/pages/developmentPage.jsx";

import PageTransitions from "../components/animations/pageTransitions.jsx";

export default function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();

  const hasChecked = useRef(false);
  const SERVER_HEALTH = import.meta.env.VITE_SERVER_HEALTH;
  const BACKEND_HEALTH = import.meta.env.VITE_BACKEND_HEALTH;

  useEffect(() => {
    let interval;

    const checkServerStatus = async () => {
      try {
        const [serverRes, backendRes] = await Promise.all([
          fetch(SERVER_HEALTH),
          fetch(BACKEND_HEALTH),
        ]);

        console.log("Server Health Response:", serverRes.ok);
        console.log("Backend Health Response:", backendRes.ok);

        if (serverRes.ok && backendRes.ok) {
          hasChecked.current = true;
          clearInterval(interval);
          if (location.pathname === "/") {
            navigate("/iris");
          }
        } else {
          if (location.pathname !== "/") {
            navigate("/");
          }
        }
      } catch (error) {
        if (location.pathname !== "/") {
          navigate("/");
        }
      }
    };

    interval = setInterval(checkServerStatus, 3000);

    checkServerStatus();

    return () => clearInterval(interval);
  }, [navigate]);

  return (
      <Routes element={<PageTransitions />}>
        <Route path="/" element={<LoadingPage />} />
        <Route path="/iris" element={<HomePage />} />
        <Route path="/iris/login" element={<LoginPage />} />
        <Route path="/iris/signup" element={<SignUpPage />} />
        
        <Route path="iris" element={<Layout />}>
          <Route path="/iris/home" element={<DashboardPage />} />
          <Route path="/iris/activity" element={<ActivityPage />} />
          <Route path="/iris/development" element={<DevelopmentPage />} />
          <Route path="/iris/analytics" element={<AnalyticsPage />} />
          <Route path="/iris/notifications" element={<NotificationPage />} />
        </Route>
      </Routes>
  );
}
