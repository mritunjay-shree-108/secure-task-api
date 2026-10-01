import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";
import type { Task } from "../types/task";

interface TaskResponse {
  page: number;
  limit: number;
  totalTasks: number;
  totalPages: number;
  tasks: Task[];
}

interface DeleteResponse {
  message: string;
}

interface PatchTaskBody {
  completed: boolean;
}

interface PatchTaskResponse {
  task: Task;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [completedFilter, setCompletedFilter] = useState<
    "all" | "true" | "false"
  >("all");
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      setIsFetching(true);
      const params = new URLSearchParams();

      params.set("page", page.toString());
      params.set("limit", "5");
      params.set("search", searchQuery);
      if (completedFilter !== "all") {
        params.set("completed", completedFilter);
      }

      try {
        const { res, data } = await apiFetch<TaskResponse>({
          url: `http://localhost:3000/api/tasks?${params.toString()}`,
          token,
        });
        if (!res.ok) {
          if (res.status === 401) {
            logout();
            navigate("/login");
          }
          setError(res.statusText || "Unable to load Tasks");
          return;
        }
        setTasks(data.tasks);
        setPage(data.page);
        setTotalPages(data.totalPages);
      } catch {
        setError("Unable to load Tasks");
      } finally {
        setIsFetching(false);
      }
    };
    fetchTasks();
  }, [token, logout, navigate, page, searchQuery, completedFilter]);

  const handleDelete = async (id: string): Promise<string | undefined> => {
    setDeletingId(id);
    try {
      const { res, data } = await apiFetch<DeleteResponse>({
        url: `http://localhost:3000/api/tasks/${id}`,
        token,
        method: "DELETE",
      });
      if (!res.ok) {
        if (res.status === 401) {
          logout();
          navigate("/login");
        }
        setError(res.statusText || "Unable to delete Task");
        return;
      }
      const newTasks = tasks.filter((task) => task.id !== id);
      setTasks(newTasks);
      if (newTasks.length === 0 && page > 1) {
        setPage((prev) => prev - 1);
      }
      return data.message;
    } catch {
      setError("Unable to delete Tasks");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    setTogglingId(id);
    try {
      const { res, data } = await apiFetch<PatchTaskResponse, PatchTaskBody>({
        url: `http://localhost:3000/api/tasks/${id}`,
        token,
        method: "PATCH",
        body: {
          completed: !completed,
        },
      });
      if (!res.ok) {
        if (res.status === 401) {
          logout();
          navigate("/login");
        }
        setError(res.statusText || "Unable to toggle");
        return;
      }
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? data.task : task)),
      );
    } catch {
      setError("Unable to toggle");
    } finally {
      setTogglingId(null);
    }
  };

  const updateTask = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
    );
  };

  return {
    tasks,
    isFetching,
    deletingId,
    togglingId,
    error,
    page,
    totalPages,
    search,
    searchQuery,
    completedFilter,
    setSearch,
    setSearchQuery,
    setPage,
    setCompletedFilter,
    handleDelete,
    handleToggleComplete,
    updateTask,
  };
}
