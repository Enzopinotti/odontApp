# 🪟 ModalProvider – Sistema de Modales Globales

Este archivo explica cómo usar el sistema de modales de manera global en OdontApp usando `ModalProvider`. Con este sistema podés mostrar un modal desde cualquier componente, sin importar dónde estés en la app.

---

## ✅ ¿Qué hace?

Te permite usar `showModal({ ... })` desde cualquier parte y automáticamente muestra un modal en pantalla con título, mensaje y (opcionalmente) botones o formularios personalizados.

---

## 🛠 Cómo usar un modal en un componente

### 1. Importar el hook

```js
import useModal from '../hooks/useModal';

```

### 2. Llamar a `showModal` cuando lo necesites

```js
const { showModal } = useModal();
showModal({
  title: 'Atención',
  message: 'Tu sesión expiró, iniciá sesión de nuevo.',
});

```

También podés pasar `email` u otros datos para ciertos casos:

```js
showModal({
  title: 'Cuenta no verificada',
  message: 'Te enviamos un email. Verificalo para continuar.',
  email: 'tucorreo@ejemplo.com',
});

```

---

## 🧩 ¿Cómo agregar un nuevo tipo de modal?

Si querés que el modal tenga algo más que título y texto (por ejemplo, botones o un componente especial), seguí estos pasos:

### 1. Pasar una `type` al `showModal`

```js
showModal({
  type: 'confirmLogout',
  title: '¿Cerrar sesión?',
  message: 'Perderás el acceso a los datos hasta que vuelvas a entrar.',
});
```

### 2. Editar `ModalProvider.jsx`

Dentro de:

```jsx
{modal && (
  <div className="modal-backdrop">
    <div className="modal-card">
      <h3>{modal.title}</h3>
      <p>{modal.message}</p>

      {modal.type === 'confirmLogout' && (
        <div className="modal-actions">
          <button onClick={handleLogout}>Sí, cerrar</button>
          <button onClick={closeModal}>Cancelar</button>
        </div>
      )}

      <div className="modal-actions">
        <button onClick={closeModal}>Cerrar</button>
      </div>
    </div>
  </div>
)}
```

> 🎯 Tip: Si necesitás lógica más compleja, podés importar y renderizar un componente nuevo (`<CustomModal />`) dentro del modal.

---

## 🎯 Casos ya cubiertos

- Reenviar verificación de correo → `type: 'resend'` + `email`
- Alerta de inicio con Google → `type: 'google'`
- Mensajes genéricos → solo `title` y `message`

---

## 🧪 ¿Dónde está definido todo esto?

- `src/context/ModalProvider.jsx` → Componente que renderiza los modales
- `src/hooks/useModal.js` → Hook para usar el modal
- `src/components/ResendConfirmationModal.jsx` → Modal para reenviar correo

---

## 📦 ¿Qué incluye cada modal?

```js
showModal({
  title: 'Título del modal',
  message: 'Mensaje a mostrar',
  email: 'opcional@correo.com',
  type: 'opcional-tipo',
});
```

---

## ✅ Para cerrar un modal manualmente

```js
const { closeModal } = useModal();
closeModal();
```

---

## 🧼 Buenas prácticas

- Siempre llamá `closeModal()` al finalizar una acción para cerrar el modal.
- Si vas a reutilizar un mismo modal en varios lugares (por ejemplo, confirmaciones), definilo con `type` y manejalo en `ModalProvider`.
- No uses modales para validaciones simples (usá toasts mejor).

---
Con esto, cualquier persona del equipo puede mostrar modales sin necesidad de repetir componentes o manejar estados en cada archivo. 🎉
