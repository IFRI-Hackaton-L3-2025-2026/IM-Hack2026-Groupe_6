import { BrowserRouter as Router, Routes, Route } from "react-router";
import NotFound from "./pages/OtherPage/NotFound";

import AlertsPage from "./pages/Alerts";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Equipments from "./pages/Equipments";
import History from "./pages/History";
import Analytics from "./pages/Analytics";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />
            <Route path="/machines" element={<Equipments />} />
            <Route path="/history" element={<History />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/analytics" element={<Analytics />} />

          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
