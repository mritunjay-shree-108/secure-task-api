import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";

interface ProfileResponse {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export const Profile = () => {
  const [user, setUser] = useState({
    id: "",
    email: "",
    role: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { res, data } = await apiFetch<ProfileResponse>({
          url: "http://localhost:3000/api/auth/profile",
          token: token,
        });
        if (!res.ok) {
          if (res.status === 401) {
            logout();
            navigate("/login");
          }
          setError(res.statusText || "Unable to load profile");
          return;
        }
        setUser(data.user);
      } catch {
        setError("Unable to load Profile");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token, logout, navigate]);

  return (
    <div>
      {loading ? (
        "Loading..."
      ) : (
        <div>
          <h4>Profile</h4>
          <p>ID: {user.id}</p>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
        </div>
      )}
      {error && <p>{error}</p>}
    </div>
  );
};
