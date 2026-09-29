import { TodoApp } from './main';

export default function Preview() {
  return (
    <TodoApp
      initialTodos={[
        { id: 1, text: 'レッスンを読む', done: true },
        { id: 2, text: '演習を解く', done: false },
      ]}
    />
  );
}
