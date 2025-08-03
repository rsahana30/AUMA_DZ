// pages/Profile.js
import React from "react";
import { getUserFromToken } from "../utils/auth";

const Profile = () => {
  const user = getUserFromToken();

  return (
    <div className="container mt-5">
      <h2>User Profile</h2>
      {user ? (
        <p>Logged in as: <strong>{user.email}</strong></p>
      ) : (
        <p>No user info available.</p>
      )}
    </div>
  );
};

export default Profile;
