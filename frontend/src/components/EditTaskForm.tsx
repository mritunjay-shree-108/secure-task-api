import type { Task } from "../types/task";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";

interface PutTaskBody {
  title: string;
  description: string;
  completed: boolean;
}

interface PutTaskResponse {
  task: Task;
}

interface EditTaskFormProps {
  task: Task;
  onUpdated: (updatedTask: Task) => void;
  onCancel: () => void;
}

export function EditTaskForm({ task, onUpdated, onCancel }: EditTaskFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [completed, setCompleted] = useState(task.completed);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const inputTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setError("");
  };

  const inputDescription = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

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
      const { res, data } = await apiFetch<PutTaskResponse, PutTaskBody>({
        url: `http://localhost:3000/api/tasks/${task.id}`,
        token,
        method: "PUT",
        body: {
          title: title,
          description: description,
          completed: completed,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          logout();
          navigate("/login");
        }
        setError(res.statusText || "Unable to Update Task");
        return;
      }
      onUpdated(data.task);
    } catch {
      setError("Unable to update task");
    } finally {
      setLoading(false);
    }
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
        completed:{" "}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={completed}
            onChange={(e) => setCompleted(e.target.checked)}
          />

          {completed ? "Checked!" : "Unchecked"}
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </button>
        <button type="button" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        {error && <p>{error}</p>}
      </form>
    </div>
  );
}
