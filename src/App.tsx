import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import "./styles/globals.css";

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/news" element={<NewsList />} />
              <Route path="/news/:id" element={<NewsDetail />} />
              <Route path="/events" element={<EventList />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route
                path="/events/:id/register"
                element={<EventRegistration />}
              />
              <Route path="/membership" element={<Membership />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/events" element={<AdminEvents />} />
              <Route path="/admin/news" element={<AdminNews />} />
              <Route path="/admin/members" element={<AdminMembers />} />
              <Route path="/admin/accounts" element={<AdminAccounts />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/font-showcase" element={<FontShowcase />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </LanguageProvider>
  );
}
