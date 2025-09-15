import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    regId: "",
    dob: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isRegister) {
        // Registration: create user in Supabase Auth
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password
        });
        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }

        // Save user info in users table
        const { error: insertError } = await supabase
          .from("users")
          .insert([{
            email: formData.email,
            name: formData.name,
            reg_id: formData.regId,
            dob: formData.dob
          }]);

        if (insertError) {
          setError("Could not save user info. Please contact support.");
          setLoading(false);
          return;
        }

        setError("Registration successful! You can now log in.");
        setIsRegister(false);
      } else {
        // Login: sign in with email/password
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });
        if (signInError) {
          setError(signInError.message);
          setLoading(false);
          return;
        }

        // Fetch user info from users table
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("email", formData.email)
          .single();

        if (userError || !userData) {
          setError("Could not find user info in database. Please register first.");
          setLoading(false);
          return;
        }

        navigate("/dashboard", { state: { user: userData } });
      }
    } catch (err) {
      console.error(err);
      setError("Login/Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2 className="login-title">{isRegister ? "Register" : "Login"}</h2>

        {error && <p className="login-error">{error}</p>}

        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          className="login-input"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="login-input"
          required
        />
        {isRegister && (
          <>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              className="login-input"
              required
            />
            <input
              type="text"
              name="regId"
              placeholder="Registration ID"
              value={formData.regId}
              onChange={handleChange}
              className="login-input"
              required
            />
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="login-input"
              required
            />
          </>
        )}

        <button type="submit" disabled={loading} className="login-button">
          {loading ? (isRegister ? "Registering..." : "Logging in...") : (isRegister ? "Register" : "Login")}
        </button>

        <button
          type="button"
          className="login-button"
          style={{ background: '#e5e7eb', color: '#2563eb', marginTop: 8 }}
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? "Already have an account? Login" : "New user? Register"}
        </button>
      </form>
    </div>
  );
}


