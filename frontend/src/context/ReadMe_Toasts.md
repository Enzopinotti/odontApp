# 📢 ReadMe – Sistema de Toasts (Mensajes Flotantes)

Este sistema permite mostrar mensajes breves (toasts) en cualquier parte de la app de forma global y con diferentes tipos (`success`, `error`, `info`, etc).

---

## 🚀 ¿Cómo usarlo?

1. **Ya está disponible globalmente desde `ToastProvider`**  
   Asegurate de que esté envolviendo toda tu app:

```jsx
import ToastProvider from './context/ToastProvider';

<ToastProvider>
  <AppRouter />
</ToastProvider>
```

## 2. **Usalo en cualquier componente con el hook `useToast`:**

```js
import useToast from '../hooks/useToast';

const { showToast } = useToast();
```

## 3. **Llamá a `showToast` así:**

```js
showToast('Mensaje de éxito');
showToast('Algo salió mal', 'error');
showToast('Información útil', 'info');
```

---

## 🧱 ¿Cómo funciona internamente?

### 📂 Archivos involucrados

- `/src/context/ToastProvider.jsx`: Define el contexto global, renderiza el `<div className="toast">` y elimina el toast luego de 3.5s.
- `/src/hooks/useToast.js`: Hook que consume el contexto.

---

## 🎨 Estilos esperados (ejemplo SCSS)

```scss
.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.9rem 1.4rem;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  z-index: 9999;
  animation: fadeIn 0.3s ease, fadeOut 0.3s ease 3.2s;
}

.toast--success { background: #28a745; }
.toast--error   { background: #dc3545; }
.toast--info    { background: #007bff; }

@keyframes fadeIn {
  from { opacity: 0; transform: translate(-50%, 10px); }
  to   { opacity: 1; transform: translate(-50%, 0); }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to   { opacity: 0; }
}
```

---

## 🛠️ Ejemplo en acción

```js
const { showToast } = useToast();

useEffect(() => {
  showToast('Bienvenido a OdontApp', 'success');
}, []);
```

---

Listo para usar en toda tu app sin necesidad de repetir lógica.
¡Espero que te sea útil! 😊
