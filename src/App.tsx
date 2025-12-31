import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useLayoutEffect } from "react";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Home } from "@/pages/public/Home";
import { About } from "@/pages/public/About";
import { NewsList } from "@/pages/public/news/NewsList";
import { NewsDetail } from "@/pages/public/news/NewsDetail";
import { EventList } from "@/pages/public/events/EventList";
import { EventDetail } from "@/pages/public/events/EventDetail";
import { EventRegistration } from "@/pages/public/events/EventRegistration";
import { Membership } from "@/pages/public/Membership";
import { AdminLogin } from "@/pages/admin/AdminLogin";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminEvents } from "@/pages/admin/AdminEvents";
import { AdminNews } from "@/pages/admin/AdminNews";
import { AdminMembers } from "@/pages/admin/AdminMembers";
import { AdminSettings } from "@/pages/admin/AdminSettings";
import { AdminAccounts } from "@/pages/admin/AdminAccounts";
import { FontShowcase } from "@/pages/dev/FontShowcase";
import { AnimatePresence } from "motion/react";
import { PageTransition } from "./components/PageTransition";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import "./styles/globals.css";

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <AppLayout />
      </Router>
    </LanguageProvider>
  );
}

function AppLayout() {
  const location = useLocation();
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <PageTransition>
                  <Home />
                </PageTransition>
              }
            />
            <Route
              path="/about"
              element={
                <PageTransition>
                  <About />
                </PageTransition>
              }
            />
            <Route
              path="/news"
              element={
                <PageTransition>
                  <NewsList />
                </PageTransition>
              }
            />
            <Route
              path="/news/:id"
              element={
                <PageTransition>
                  <NewsDetail />
                </PageTransition>
              }
            />
            <Route
              path="/events"
              element={
                <PageTransition>
                  <EventList />
                </PageTransition>
              }
            />
            <Route
              path="/events/:id"
              element={
                <PageTransition>
                  <EventDetail />
                </PageTransition>
              }
            />
            <Route
              path="/events/:id/register"
              element={
                <PageTransition>
                  <EventRegistration />
                </PageTransition>
              }
            />
            <Route
              path="/membership"
              element={
                <PageTransition>
                  <Membership />
                </PageTransition>
              }
            />
            <Route
              path="/admin"
              element={
                <PageTransition>
                  <AdminLogin />
                </PageTransition>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <PageTransition>
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                </PageTransition>
              }
            />
            <Route
              path="/admin/events"
              element={
                <PageTransition>
                  <ProtectedRoute>
                    <AdminEvents />
                  </ProtectedRoute>
                </PageTransition>
              }
            />
            <Route
              path="/admin/news"
              element={
                <PageTransition>
                  <ProtectedRoute>
                    <AdminNews />
                  </ProtectedRoute>
                </PageTransition>
              }
            />
            <Route
              path="/admin/members"
              element={
                <PageTransition>
                  <ProtectedRoute>
                    <AdminMembers />
                  </ProtectedRoute>
                </PageTransition>
              }
            />
            <Route
              path="/admin/accounts"
              element={
                <PageTransition>
                  <ProtectedRoute ownerOnly>
                    <AdminAccounts />
                  </ProtectedRoute>
                </PageTransition>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <PageTransition>
                  <ProtectedRoute>
                    <AdminSettings />
                  </ProtectedRoute>
                </PageTransition>
              }
            />
            <Route
              path="/font-showcase"
              element={
                <PageTransition>
                  <FontShowcase />
                </PageTransition>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
