// src/pages/Login.js
import { useState } from 'react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: llamar a la API de auth
    console.log(form);
  };

  return (
    <div className="login-card">
      <h2 className="login-title">INICIAR SESIÓN</h2>

      <form onSubmit={handleSubmit} className="login-form">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Iniciar Sesión</button>

        <a href="#forgot" className="forgot-link">
          ¿Olvidaste la contraseña?
        </a>
      </form>
    </div>
  );
}
