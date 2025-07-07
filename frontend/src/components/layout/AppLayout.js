import Header from './Header';
import SideBar from './SideBar';
import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="app-layout">
      <Header />
      <div className="app-body">
        <SideBar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
