import { Outlet } from 'react-router';

export function AppLayout() {
  return (
    <div className="app-layout">
      <main>
        <Outlet /> 
      </main>
    </div>
  );
}