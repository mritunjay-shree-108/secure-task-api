import "./App.css";
import Navbar from "./components/Navbar";
// import Counter from "./components/Counter";
// import Card from "./components/Card";
// import TaskList from "./components/TaskList";
// import UserForm from "./components/UserForm";
// import Message from "./components/Message";
// // import BackendStatus from "./components/BackendStatus";
// import BackendHealth from "./components/BackendHealth";
// import Timer from "./components/Timer";
import Register from "./pages/Register";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";
import { Tasks } from "./pages/Tasks";
import { CreateTask } from "./pages/CreateTask";

function App() {
  return (
    <div>
      <AuthProvider>
        <BrowserRouter>
          <Navbar
            title="Secure Task Manager"
            subtitle="Manage your tasks efficiently"
          />
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/create-task" element={<CreateTask />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
