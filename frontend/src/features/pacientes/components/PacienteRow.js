// src/components/pacientes/PacienteRow.jsx
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { AuthCtx } from '../../../context/AuthProvider';
import useModal from '../../../hooks/useModal';
import usePacienteMutations from '../hooks/usePacienteMutations';
import { handleApiError } from '../../../utils/handleApiError';
import useToast from '../../../hooks/useToast';

export default function PacienteRow({ paciente }) {
  const navigate = useNavigate();
  const { hasPermiso } = useContext(AuthCtx);
  const { showModal, closeModal } = useModal();
  const { deletePaciente } = usePacienteMutations();
  const { showToast } = useToast();
  const [swiped, setSwiped] = useState(false);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setSwiped(true),
    onSwipedRight: () => setSwiped(false),
    delta: 40,
    trackTouch: true,
  });

  const { id, nombre, apellido, dni, createdAt, ultimaVisita, Contacto } = paciente;
  const tel = Contacto?.telefonoMovil || Contacto?.telefonoFijo || '—';

  const handleDelete = () => {
    showModal({
      type: 'confirm',
      title: 'Eliminar paciente',
      message: `¿Seguro que deseas eliminar a ${apellido}, ${nombre}? Esta acción no se puede deshacer.`,
      onConfirm: () => {
        deletePaciente.mutate(id, {
          onSuccess: () => showToast('Paciente eliminado', 'success'),
          onError: (err) => handleApiError(err, showToast),
        });
      },
    });
  };

  return (
    <div
      {...swipeHandlers}
      className={`paciente-item ${swiped ? 'swiped' : ''}`}
      onClick={() => setSwiped(false)}
    >
      <div className="info">
        <strong className="col nombre" data-label="Paciente">{`${apellido}, ${nombre}`}</strong>
        <p className="col dni" data-label="DNI">{dni}</p>
        <p className="col tel" data-label="Teléfono">{tel}</p>
        <p className="col registro" data-label="Registro">{new Date(createdAt).toLocaleDateString()}</p>
        <p className="col visita" data-label="Últ. visita">
          {ultimaVisita ? new Date(ultimaVisita).toLocaleDateString() : '—'}
        </p>
      </div>

      <div className="acciones col acc">
        {hasPermiso('pacientes', 'listar') && (
          <button title="Ver" onClick={() => navigate(`/pacientes/${id}`)}>
            <FaEye />
          </button>
        )}
        {hasPermiso('pacientes', 'editar') && (
          <button title="Editar" onClick={() => navigate(`/pacientes/${id}/editar`)}>
            <FaEdit />
          </button>
        )}
        {hasPermiso('pacientes', 'eliminar') && (
          <button title="Eliminar" className="danger" onClick={handleDelete}>
            <FaTrash />
          </button>
        )}
      </div>

      <div className="swipe-actions">
        {hasPermiso('pacientes', 'editar') && (
          <button onClick={() => navigate(`/pacientes/${id}/editar`)}>
            <FaEdit />
          </button>
        )}
        {hasPermiso('pacientes', 'eliminar') && (
          <button className="danger" onClick={handleDelete}>
            <FaTrash />
          </button>
        )}
      </div>
    </div>
  );
}
