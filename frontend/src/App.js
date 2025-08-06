import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
import RFQ from "./forms/RFQ";
import RFQDetailPage from "./forms/RFQDetailPage";
import RFQTable from "./forms/RFQTable";
import SelectModel from "./forms/SelectModel";
import UpdateRFQ from "./forms/UpdateRFQ";
import Quotation from "./forms/Quotation";

const App = () => (
  <Router>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="*"
        element={
          <>
            <div className="d-flex">
              <Sidebar />
              <div className="flex-grow-1 p-3">
                <Navbar />
                <Routes>
                  <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                  <Route path="/" element={<h2>Welcome to Dashboard</h2>} />
                  <Route path="/rfq" element={<RFQ />} />
                  <Route path="/" element={<RFQTable />} />
                  <Route path="/rfq/:rfqNo" element={<RFQDetailPage />} />
                  <Route path="/select-model/:rfqNo" element={<SelectModel />} />
                  <Route path="/update-rfq/:rfqNo" element={<UpdateRFQ />} />
                  <Route path="/quotation/:rfqNo" element={<Quotation/>} />

                </Routes>
              </div>
            </div>
          </>
        }
      />
    </Routes>
  </Router>
);

export default App;
