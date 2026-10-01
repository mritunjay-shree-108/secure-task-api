import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate("/profile");
  };

  const handleViewTasks = () => {
    navigate("/tasks");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div>
      <h3>Welcome to Secure Task Manager</h3>
      <button onClick={handleViewProfile}>[View profile]</button>
      <button onClick={handleViewTasks}>[View Tasks]</button>
      <button onClick={handleLogout}>[Logout]</button>
    </div>
  );
};
