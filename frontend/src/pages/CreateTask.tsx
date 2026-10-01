import type { Task } from "../types/task";
import { useState } from "react";
import { apiFetch } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface CreateTaskBody {
  title: string;
  description: string;
  completed?: boolean;
}

interface CreateTaskResponse {
  message: string;
  task: Task;
}

export const CreateTask = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const inputTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setError("");
    setSuccess("");
  };

  const inputDescription = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (title.trim() === "") {
      setError("Title is required");
      return;
    }

    if (description.trim() === "") {
      setError("Description is required");
      return;
    }

    setLoading(true);
    try {
      const { res, data } = await apiFetch<CreateTaskResponse, CreateTaskBody>({
        url: "http://localhost:3000/api/tasks",
        token,
        method: "POST",
        body: {
          title: title,
          description: description,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          logout();
          navigate("/login");
        }
        setError(res.statusText || "Unable to Create Task");
        return;
      }
      setSuccess(
        `Task Created Successfully! Title : ${data.task.title} Description: ${data.task.description} Completed : ${data.task.completed}`,
      );
    } catch {
      setError("Unable to create task");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToTasks = () => {
    navigate("/tasks");
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          onChange={inputTitle}
          value={title}
        />
        <textarea
          placeholder="Description"
          onChange={inputDescription}
          value={description}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Creating Task..." : "Create Task"}
        </button>
        {error && <p>{error}</p>}
        {success && <p>{success}</p>}
      </form>
      {success && <button onClick={handleBackToTasks}>[Back to Tasks]</button>}
    </div>
  );
};
