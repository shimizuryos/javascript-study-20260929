import { Header, UserList } from './components';
import { Providers } from './providers';

export function App() {
  return (
    <Providers>
      <div className="app">
        <Header />
        <main>
          <UserList />
        </main>
      </div>
    </Providers>
  );
}
