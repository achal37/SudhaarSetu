"use client";

import React, { useState } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function SignupPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("")
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [ward, setWard] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, phone, city, state, ward }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      // Redirect to login after successful signup
      window.location.href = "/login";
    } catch (err) {
      setError("Failed to signup: " + err.message);
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

        {/* Signup Heading */}
        <h1 className="text-xl font-bold text-black mt-10">SIGN UP</h1>
        <p className="text-gray-500 text-sm mb-6">
          Be a part of the change! <br />
          Sign up to report and track issues
        </p>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          {/* Name */}
          <div className="relative">
            <label className="absolute top-[-10px] left-3 bg-background text-sm px-1 text-gray-600">
              Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-500 rounded-md bg-background outline-none text-gray-700"
              placeholder="Rohan Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Phone Number */}
          <div className="relative">
            <label className="absolute top-[-10px] left-3 bg-background text-sm px-1 text-gray-600">
              Phone Number
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-500 rounded-md bg-background outline-none text-gray-700"
              placeholder="9876543219"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="relative">
            <label className="absolute top-[-10px] left-3 bg-background text-sm px-1 text-gray-600">
              Email
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-500 rounded-md bg-background outline-none text-gray-700"
              placeholder="+91 9999999999"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* State */}
          <div className="relative">
            <label className="absolute top-[-10px] left-3 bg-background text-sm px-1 text-gray-600">
              State
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-500 rounded-md bg-background outline-none text-gray-700"
              placeholder="Rajasthan"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            />
          </div>

          {/* City */}
          <div className="relative">
            <label className="absolute top-[-10px] left-3 bg-background text-sm px-1 text-gray-600">
              City
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-500 rounded-md bg-background outline-none text-gray-700"
              placeholder="Jaipur"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>

          {/* Ward Number*/}
          <div className="relative">
            <label className="absolute top-[-10px] left-3 bg-background text-sm px-1 text-gray-600">
              Ward Number
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-500 rounded-md bg-background outline-none text-gray-700"
              placeholder="Ward 15"
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              required
            />
          </div>


          {/* Password */}
          <div className="relative">
            <label className="absolute top-[-10px] left-3 bg-background text-sm px-1 text-gray-600">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-500 rounded-md bg-background outline-none text-gray-700"
              placeholder="**********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Continue Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-primary text-white font-semibold rounded-full shadow-md hover:bg-[#3A4F2C] transition"
          >
            {loading ? "Signing up..." : "Continue"}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-4 text-gray-600 text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-primary font-semibold">
            Log in
          </a>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;

