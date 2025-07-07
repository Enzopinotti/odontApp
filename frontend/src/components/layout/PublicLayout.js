import { Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div className="public-wrapper">
      <div className="public-card">
        <Outlet />
      </div>
    </div>
  );
}
