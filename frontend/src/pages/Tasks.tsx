import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import TaskCard from "../components/TaskCard";
import { EditTaskForm } from "../components/EditTaskForm";
import type { Task } from "../types/task";
import { useTasks } from "../hooks/useTasks";

export function Tasks() {
  const {
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
    handleDelete: deleteTask,
    handleToggleComplete,
    updateTask,
  } = useTasks();
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!success) {
      return;
    }

    const timer = setTimeout(() => {
      setSuccess("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [success]);

  const handleCreateNewTask = () => {
    navigate("/create-task");
  };

  const handleEdit = (id: string) => {
    setEditingId(editingId === id ? null : id);
  };

  const handleUpdate = (updatedTask: Task) => {
    updateTask(updatedTask);

    setSuccess(
      `Task Updated Successfully! Title : ${updatedTask.title} Description: ${updatedTask.description} Completed : ${updatedTask.completed}`,
    );

    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    const message = await deleteTask(id);
    if (message) {
      setSuccess(message);
    }
  };

  return (
    <div>
      {isFetching && <p>Loading tasks...</p>}
      <h4>Tasks</h4>
      <div>
        Search:
        <input
          type="search"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={() => {
            setSearchQuery(search);
            setPage(1);
          }}
        >
          [Search]
        </button>
      </div>

      <div>
        Filter:
        <div>
          <button
            onClick={() => {
              setCompletedFilter("all");
              setPage(1);
            }}
          >
            [All]
          </button>

          <button
            onClick={() => {
              setCompletedFilter("true");
              setPage(1);
            }}
          >
            [Completed]
          </button>

          <button
            onClick={() => {
              setCompletedFilter("false");
              setPage(1);
            }}
          >
            [Pending]
          </button>
        </div>
      </div>
      <div>
        {!isFetching && tasks.length === 0 ? (
          searchQuery.trim() !== "" ? (
            <p>No tasks found for your search.</p>
          ) : completedFilter === "true" ? (
            <p>No completed tasks found.</p>
          ) : completedFilter === "false" ? (
            <p>No pending tasks found.</p>
          ) : (
            <p>You don't have any tasks yet.</p>
          )
        ) : (
          tasks.map((task) => (
            <div key={task.id}>
              <TaskCard
                task={task}
                isDeleting={deletingId === task.id}
                isToggling={togglingId === task.id}
                onDelete={handleDelete}
                onToggleComplete={handleToggleComplete}
                onEdit={handleEdit}
              />

              {editingId === task.id && (
                <EditTaskForm
                  task={task}
                  onCancel={() => setEditingId(null)}
                  onUpdated={handleUpdate}
                />
              )}
            </div>
          ))
        )}
      </div>

      {error && <p>{error}</p>}
      {success && <p>{success}</p>}
      <button type="button" onClick={handleCreateNewTask}>
        [Create New Task]
      </button>

      <div>
        {totalPages > 1 && (
          <div>
            <button
              type="button"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              [Previous]
            </button>
            Page {page} of {totalPages}
            <button
              type="button"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              [Next]
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
