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

## 📝 Modal con formularios personalizados

Para mostrar un formulario completo dentro de un modal, usá el tipo `'form'`:

```js
const { showModal } = useModal();

const handleSubmit = (values) => {
  // Lógica de envío
  showModal(null); // Cerrar el modal después de enviar
};

showModal({
  type: 'form',
  title: 'Nueva historia clínica',
  component: (
    <MiFormulario 
      onSubmit={handleSubmit}
      onCancel={() => showModal(null)}
    />
  )
});
```

**Puntos clave:**
- El `component` puede ser cualquier JSX (formularios, componentes complejos, etc.)
- Para cerrar el modal, llamá `showModal(null)` desde dentro del componente
- El título es opcional, si no lo pasás solo se renderiza el componente

---

## 🧩 ¿Cómo agregar un nuevo tipo de modal?

Si querés que el modal tenga algo más que título y texto (por ejemplo, botones o un componente especial), seguí estos pasos:

### 1. Pasar una `type` al `showModal`

```js
showModal({
  type: 'confirm',
  title: '¿Cerrar sesión?',
  message: 'Perderás el acceso a los datos hasta que vuelvas a entrar.',
  onConfirm: () => console.log('Confirmado'),
  onCancel: () => console.log('Cancelado')
});
```

### 2. Editar `ModalProvider.js`

Si necesitás un tipo totalmente nuevo, agregalo en `ModalProvider.js`:

```jsx
{modal.type === 'miNuevoTipo' && (
  <div className="modal-actions">
    <button onClick={handleMiAccion}>Mi acción</button>
    <button onClick={closeModal}>Cancelar</button>
  </div>
)}
```

> 🎯 Tip: Si necesitás lógica más compleja, podés importar y renderizar un componente nuevo (`<CustomModal />`) dentro del modal.

---

## 🎯 Tipos de modales disponibles

- **`info`**: Mensaje simple con botón "Cerrar"
- **`confirm`**: Confirmación con botones Sí/No (requiere `onConfirm`, `onCancel`)
- **`form`**: Formulario o componente personalizado (requiere `component`)
- **`resend`**: Reenviar verificación de correo (requiere `email`)
- **`google`**: Login con Google

---

## 🧪 ¿Dónde está definido todo esto?

- `src/context/ModalProvider.js` → Componente que renderiza los modales
- `src/hooks/useModal.js` → Hook para usar el modal
- `src/components/ResendConfirmationModal.jsx` → Modal para reenviar correo

---

## 📦 ¿Qué incluye cada modal?

```js
showModal({
  title: 'Título del modal',           // Opcional para type='form'
  message: 'Mensaje a mostrar',        // Solo para modales de texto
  email: 'opcional@correo.com',        // Para type='resend'
  type: 'info',                        // Tipo de modal
  component: <MiComponente />,         // Para type='form'
  onConfirm: () => {},                 // Para type='confirm'
  onCancel: () => {}                   // Para type='confirm'
});
```

---

## ✅ Para cerrar un modal manualmente

```js
const { showModal } = useModal();

// Cerrar el modal
showModal(null);
```

---

## 🧼 Buenas prácticas

- Siempre cerrá el modal al finalizar una acción (usá `showModal(null)`).
- Si vas a reutilizar un mismo modal en varios lugares (por ejemplo, confirmaciones), definilo con `type` y manejalo en `ModalProvider`.
- No uses modales para validaciones simples (usá toasts mejor).
- Para formularios complejos, usá `type: 'form'` en lugar de crear nuevos tipos específicos.
- Recordá pasar `onCancel={() => showModal(null)}` a tus formularios para que el usuario pueda cerrarlos.

---

Con esto, cualquier persona del equipo puede mostrar modales sin necesidad de repetir componentes o manejar estados en cada archivo. 🎉