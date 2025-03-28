"use client";

import React, { useState } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("citizen");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const officerRoles = new Set(["field_officer", "admin", "call_center"]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const loginUrl = officerRoles.has(role)
      ? "/api/officer/login"
      : "/api/auth/login";

    try {
      const response = await fetch(`${BASE_URL}${loginUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Login failed.");
        return;
      }

      const data = await response.json();
      const userData = role === "citizen" ? data.user : data.officer;

      localStorage.setItem("token", data.token);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userId", userData?.id || "");
      localStorage.setItem("user-name", userData?.name || "");
      localStorage.setItem("user-city", userData?.city || "");

      // Redirect user based on role
      const roleRedirects = {
        citizen: "/citizen",
        field_officer: "/field-officer",
        admin: "/admin",
        call_center: "/call-center",
      };

      window.location.href = roleRedirects[role] || "/citizen";
    } catch (err) {
      setError("Failed to login, Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#F9F5EC]">
      <div className="w-[350px] p-6">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="Logo" className="h-12" />
          <p className="text-primary text-4xl font-bold">SudhaarSetu</p>
        </div>

        {/* Login Heading */}
        <h1 className="text-xl font-bold text-black mt-20">LOGIN</h1>
        <p className="text-gray-500 text-sm mb-6">
          Glad to see you again! <br />
          Let's get back to making a difference
        </p>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Input */}
          <div className="relative">
            <label className="absolute top-[-10px] left-3 bg-background text-sm px-1 text-gray-600">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 border border-gray-500 rounded-md bg-background outline-none text-gray-700"
              placeholder="sudhaar@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <label className="absolute top-[-10px] left-3 bg-background text-sm px-1 text-gray-600">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-background border border-gray-500 rounded-md outline-none text-gray-700"
              placeholder="**********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Role Selection */}
          <div className="relative">
            <label className="absolute top-[-10px] left-3 bg-background text-sm px-1 text-gray-600">
              Select Role
            </label>
            <select
              className="w-full px-4 py-3 border border-gray-500 rounded-md bg-background outline-none text-gray-700"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="citizen">Citizen</option>
              <option value="field_officer">Field Officer</option>
              <option value="admin">Admin</option>
              <option value="call_center">Call Center Representative</option>
            </select>
          </div>

          {/* Continue Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-primary text-white font-semibold rounded-full shadow-md hover:bg-[#3A4F2C] transition"
          >
            {loading ? "Logging in..." : "Continue"}
          </button>
        </form>

        {/* Signup Link */}
        <div className="text-center mt-4 text-gray-600 text-sm">
          Don't have an account?{" "}
          <a href="/signup" className="text-primary font-semibold">
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

