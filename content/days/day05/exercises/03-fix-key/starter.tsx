export type Task = { id: number; title: string };

export function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <ul>
      {tasks.map((task) => (
        <li>
          <span>{task.title}</span>
          <input aria-label={`${task.title} のメモ`} />
        </li>
      ))}
    </ul>
  );
}
