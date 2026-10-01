import type { Task } from "../types/task";

interface TaskCardProps {
  task: Task;
  isDeleting: boolean;
  isToggling: boolean;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  onEdit: (id: string) => void;
}

function TaskCard({
  task,
  isDeleting,
  isToggling,
  onDelete,
  onToggleComplete,
  onEdit,
}: TaskCardProps) {
  return (
    <div>
      <p>Title : {task.title}</p>
      <p>Description : {task.description}</p>
      <p>
        Completed:{" "}
        <label>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggleComplete(task.id, task.completed)}
            disabled={isToggling}
          />
          {isToggling
            ? "Updating..."
            : task.completed
              ? "Checked!"
              : "Unchecked"}
        </label>
      </p>

      <div>
        <button onClick={() => onEdit(task.id)}>Edit</button>

        <button onClick={() => onDelete(task.id)} disabled={isDeleting}>
          {isDeleting ? "Deleting..." : "[Delete]"}
        </button>
      </div>
    </div>
  );
}

export default TaskCard;
