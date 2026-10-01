import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const { token } = useAuth();

  const inputEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    setError("");
    setSuccess("");
  };

  const inputPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    setError("");
    setSuccess("");
  };

  const inputConfirmPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(event.target.value);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (email.trim() === "") {
      setError("Email is required");
      return;
    }

    if (!email.includes("@")) {
      setError("Invalid Email format");
      return;
    }

    if (password.length < 8) {
      setError("Password should contain at least 8 characters");
      return;
    }

    if (confirmPassword !== password) {
      setError("Passwords do not match");
      return;
    }

    if (token) {
      console.log("Logged in");
    } else {
      console.log("Logged out");
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed!");
        return;
      }

      setSuccess("Registration Successful!");
    } catch {
      setError("Unable to connect backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        <input
          type="email"
          value={email}
          placeholder="Email"
          onChange={inputEmail}
        />
        <input
          type="password"
          value={password}
          placeholder="Password"
          onChange={inputPassword}
        />
        <input
          type="password"
          value={confirmPassword}
          placeholder="Confirm Password"
          onChange={inputConfirmPassword}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        {error && <p>{error}</p>}
        {success && <p>{success}</p>}
      </form>
    </div>
  );
}

export default Register;
