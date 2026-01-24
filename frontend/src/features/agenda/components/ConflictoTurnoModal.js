// src/features/agenda/components/ConflictoTurnoModal.js
import { useState } from 'react';
import '../../../styles/agenda.scss';

export default function ConflictoTurnoModal({ 
  isOpen, 
  onClose, 
  conflicto, 
  onCambiarOdontologo, 
  onReprogramar,
  fechaHoraOriginal,
  duracion
}) {
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(null);
  const [odontologoSeleccionado, setOdontologoSeleccionado] = useState(null);
  const [slotSeleccionado, setSlotSeleccionado] = useState(null);

  if (!isOpen || !conflicto) return null;

  const { opciones } = conflicto;
  const tieneOdontologosAlternativos = opciones?.cambiarOdontologo && opciones?.odontologosAlternativos?.length > 0;
  const tieneSlotsAlternativos = opciones?.reprogramarFecha && opciones?.slotsAlternativos?.length > 0;

  const handleConfirmar = () => {
    if (opcionSeleccionada === 'cambiar-odontologo' && odontologoSeleccionado) {
      onCambiarOdontologo(odontologoSeleccionado);
    } else if (opcionSeleccionada === 'reprogramar' && slotSeleccionado) {
      onReprogramar(slotSeleccionado);
    }
    onClose();
  };

  const formatearFechaHora = (fechaHora) => {
    if (!fechaHora) return '';
    const fecha = new Date(fechaHora);
    return fecha.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content conflicto-turno-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Conflicto de horario</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="conflicto-mensaje">
            <p className="conflicto-texto">
              {conflicto.message || 'El horario seleccionado se solapa con otro turno existente.'}
            </p>
          </div>

          <div className="conflicto-opciones">
            <h3>Opciones disponibles:</h3>

            {/* Opción 1: Cambiar odontólogo */}
            {tieneOdontologosAlternativos && (
              <div className="opcion-conflicto">
                <label className="opcion-radio">
                  <input
                    type="radio"
                    name="opcion-conflicto"
                    value="cambiar-odontologo"
                    checked={opcionSeleccionada === 'cambiar-odontologo'}
                    onChange={() => setOpcionSeleccionada('cambiar-odontologo')}
                  />
                  <span>Cambiar odontólogo</span>
                </label>
                
                {opcionSeleccionada === 'cambiar-odontologo' && (
                  <div className="opcion-detalle">
                    <p className="opcion-descripcion">
                      Seleccioná un odontólogo alternativo disponible para el mismo horario:
                    </p>
                    <div className="odontologos-lista">
                      {opciones.odontologosAlternativos.map((odonto) => (
                        <div
                          key={odonto.userId}
                          className={`odontologo-item ${odontologoSeleccionado?.userId === odonto.userId ? 'seleccionado' : ''}`}
                          onClick={() => setOdontologoSeleccionado(odonto)}
                        >
                          <div className="odontologo-info">
                            <strong>
                              Dr. {odonto.Usuario?.nombre} {odonto.Usuario?.apellido}
                            </strong>
                            {odonto.matricula && (
                              <span className="odontologo-matricula">Mat: {odonto.matricula}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Opción 2: Reprogramar fecha/hora */}
            {tieneSlotsAlternativos && (
              <div className="opcion-conflicto">
                <label className="opcion-radio">
                  <input
                    type="radio"
                    name="opcion-conflicto"
                    value="reprogramar"
                    checked={opcionSeleccionada === 'reprogramar'}
                    onChange={() => setOpcionSeleccionada('reprogramar')}
                  />
                  <span>Reprogramar turno</span>
                </label>
                
                {opcionSeleccionada === 'reprogramar' && (
                  <div className="opcion-detalle">
                    <p className="opcion-descripcion">
                      Seleccioná un horario alternativo disponible:
                    </p>
                    <div className="slots-lista">
                      {opciones.slotsAlternativos.map((slot, index) => (
                        <div
                          key={index}
                          className={`slot-item ${slotSeleccionado === slot ? 'seleccionado' : ''}`}
                          onClick={() => setSlotSeleccionado(slot)}
                        >
                          <div className="slot-info">
                            <strong>{formatearFechaHora(slot.fechaHora)}</strong>
                            <span className="slot-duracion">
                              Duración: {duracion || 30} min
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!tieneOdontologosAlternativos && !tieneSlotsAlternativos && (
              <div className="sin-opciones">
                <p>No hay opciones alternativas disponibles en este momento.</p>
                <p>Por favor, intentá con otra fecha u odontólogo.</p>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn-primary"
            onClick={handleConfirmar}
            disabled={
              !opcionSeleccionada ||
              (opcionSeleccionada === 'cambiar-odontologo' && !odontologoSeleccionado) ||
              (opcionSeleccionada === 'reprogramar' && !slotSeleccionado)
            }
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

