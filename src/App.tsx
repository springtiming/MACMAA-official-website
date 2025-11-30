import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { NewsList } from "./pages/NewsList";
import { NewsDetail } from "./pages/NewsDetail";
import { EventList } from "./pages/EventList";
import { EventDetail } from "./pages/EventDetail";
import { EventRegistration } from "./pages/EventRegistration";
import { Membership } from "./pages/Membership";
import { AdminLogin } from "./pages/AdminLogin";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminEvents } from "./pages/AdminEvents";
import { AdminNews } from "./pages/AdminNews";
import { AdminMembers } from "./pages/AdminMembers";
import { AdminSettings } from "./pages/AdminSettings";
import { AdminAccounts } from "./pages/AdminAccounts";
import { FontShowcase } from "./pages/FontShowcase";
import { AnimatePresence } from "motion/react";
import { PageTransition } from "./components/PageTransition";
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
                  <AdminDashboard />
                </PageTransition>
              }
            />
            <Route
              path="/admin/events"
              element={
                <PageTransition>
                  <AdminEvents />
                </PageTransition>
              }
            />
            <Route
              path="/admin/news"
              element={
                <PageTransition>
                  <AdminNews />
                </PageTransition>
              }
            />
            <Route
              path="/admin/members"
              element={
                <PageTransition>
                  <AdminMembers />
                </PageTransition>
              }
            />
            <Route
              path="/admin/accounts"
              element={
                <PageTransition>
                  <AdminAccounts />
                </PageTransition>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <PageTransition>
                  <AdminSettings />
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
