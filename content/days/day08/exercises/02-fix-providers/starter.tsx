import { Header, UserList } from './components';
import { Providers } from './providers';

export function App() {
  return (
    <div className="app">
      <Header />
      <Providers>
        <main>
          <UserList />
        </main>
      </Providers>
    </div>
  );
}
