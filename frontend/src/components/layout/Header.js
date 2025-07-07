import React from 'react';

export default function Header() {
  // TODO: reemplazar datos de ejemplo por datos reales del usuario (contexto o redux)
  return (
    <header className="header">
      <div className="user-info">
        <img className="avatar" src="/assets/user.png" alt="avatar" />
        <span className="name">Nombre y Apellido</span>
      </div>
      <button className="dots">⋮</button>
    </header>
  );
}
