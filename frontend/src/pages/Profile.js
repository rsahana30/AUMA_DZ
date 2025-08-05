// pages/Profile.js
import React from "react";
import { getUserFromToken } from "../utils/auth";

const Profile = () => {
  const user = getUserFromToken();
  if (!user) {
    return (
      <div className="container mt-5">
        <h2>User Profile</h2>
        <p>No user info available.</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-body d-flex align-items-center">
          {/* Avatar on the left */}
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
            style={{ width: "70px", height: "70px", fontSize: "28px" }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>

          {/* User Info on the right */}
          <div className="ms-3">
            <h5 className="mb-1">{user.name}</h5>
            <p className="mb-0 text-muted">
              <strong>Email:</strong> {user.email}
            </p>
          </div>
        </div>
      </div>
    </div>


  );
};

export default Profile;
