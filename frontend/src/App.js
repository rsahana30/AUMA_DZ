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

const App = () => (
  <Router>
    <Navbar />
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-3">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/" element={<h2>Welcome to Dashboard</h2>} />
          <Route path="/rfq" element={<RFQ/>} />
          <Route path="/" element={<RFQTable/>} />
          <Route path="/rfq/:rfqNo" element={<RFQDetailPage/>} />
          <Route path="/select-model/:rfqNo" element={<SelectModel />} />
          <Route path="/update-rfq/:rfqNo" element={<UpdateRFQ/>} />


        </Routes>
      </div>
    </div>
  </Router>
);

export default App;
