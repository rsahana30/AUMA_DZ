import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
// index.js or App.js
import './App.css'; // or './App.css'

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
          <PrivateRoute>
            <Navbar />
            <div className="d-flex">
              <Sidebar />
              <div className="flex-grow-1 p-3">
                <Routes>
                  <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                  <Route path="/" element={<PrivateRoute><RFQ /></PrivateRoute>} />
                  <Route path="/rfq" element={<PrivateRoute><RFQTable /></PrivateRoute>} />
                  <Route path="/rfq/:rfqNo" element={<PrivateRoute><RFQDetailPage /></PrivateRoute>} />
                  <Route path="/select-model/:rfqNo" element={<PrivateRoute><SelectModel /></PrivateRoute>} />
                  <Route path="/update-rfq/:rfqNo" element={<PrivateRoute><UpdateRFQ /></PrivateRoute>} />
                  <Route path="/quotation/:rfqNo" element={<PrivateRoute><Quotation /></PrivateRoute>} />

                </Routes>
              </div>
            </div>
          </PrivateRoute>
        }
      />
    </Routes>
  </Router>
);

export default App;
