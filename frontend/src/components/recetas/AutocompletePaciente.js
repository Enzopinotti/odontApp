import { useBuscarPacientes } from "../../hooks/useBuscarPacientes";
import { useId, useState, useEffect, useRef } from "react";

export default function AutocompletePaciente({ value, onChange }) {
  const { busqueda, setBusqueda, sugerencias, setSugerencias } =
    useBuscarPacientes();

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listboxId = useId();
  const inputRef = useRef(null);

  useEffect(() => {
    const has = Boolean(sugerencias?.length);
    setOpen(has);
    setActiveIndex(has ? 0 : -1);
  }, [sugerencias]);

  const manejarSeleccion = (paciente) => {
    const nombreCompleto = `${paciente.nombre} ${paciente.apellido}`;
    setBusqueda(nombreCompleto);
    setSugerencias([]);
    setOpen(false);
    setActiveIndex(-1);
    onChange(paciente);
  };
  const onChangeInput = (e) => {
    const value = e.target.value;
    setBusqueda(value);
    if (value.trim() === "") {
      onChange(null);
    }
  };

  const onKeyDown = (e) => {
    if (!sugerencias?.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i + 1) % sugerencias.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i <= 0 ? sugerencias.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0) {
        e.preventDefault();
        manejarSeleccion(sugerencias[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const activeId =
    activeIndex >= 0 && sugerencias?.[activeIndex]
      ? `opt-${sugerencias[activeIndex].id}`
      : undefined;

  return (
    <div className="auto">
      <input
        ref={inputRef}
        type="text"
        value={busqueda || (value && `${value.nombre} ${value.apellido}`) || ""}
        onChange={onChangeInput}
        onKeyDown={onKeyDown}
        onFocus={() => setOpen(Boolean(sugerencias?.length))}
        placeholder="Buscar por nombre o DNI"
        autoComplete="off"
        className="auto__input"
        role="combobox"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-expanded={open}
        {...(activeId ? { "aria-activedescendant": activeId } : {})}
      />

      {open && Array.isArray(sugerencias) && sugerencias.length > 0 && (
        <ul className="auto__list" role="listbox" id={listboxId}>
          {sugerencias.map((paciente, i) => (
            <li
              key={paciente.id}
              id={`opt-${paciente.id}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => manejarSeleccion(paciente)}
              className={`auto__item${i === activeIndex ? " is-active" : ""}`}
              role="option"
              aria-selected={i === activeIndex}
            >
              {paciente.nombre} {paciente.apellido} — {paciente.dni}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
