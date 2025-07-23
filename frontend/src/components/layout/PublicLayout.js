// src/components/layout/PublicLayout.jsx
import { Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div className="public-wrapper">
      <h1 className="logo">OdontApp</h1>
      <Outlet />
    </div>
  );
}
