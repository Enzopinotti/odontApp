import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Lottie from 'lottie-react';
import loadingAnim from '../../assets/video/pacientes-loading.json';
import PacienteForm from '../../components/pacientes/PacienteForm';
import usePaciente from '../../hooks/usePaciente';
import usePacienteMutations from '../../hooks/usePacienteMutations';
import useToast from '../../hooks/useToast';
import useModal from '../../hooks/useModal';
import { handleApiError } from '../../utils/handleApiError';
import BackBar from '../../components/BackBar';

/* Normalizador → form-friendly */
const normalizePacienteForForm = (p = {}) => ({
  nombre      : p.nombre      || '',
  apellido    : p.apellido    || '',
  dni         : p.dni         || '',
  obraSocial  : p.obraSocial  || '',
  nroAfiliado : p.nroAfiliado || '',
  ultimaVisita: p.ultimaVisita || '',
  Contacto: {
    email              : p.Contacto?.email               || '',
    telefonoMovil      : p.Contacto?.telefonoMovil       || '',
    telefonoFijo       : p.Contacto?.telefonoFijo        || '',
    preferenciaContacto: p.Contacto?.preferenciaContacto || 'email',
    Direccion: {
      calle       : p.Contacto?.Direccion?.calle        || '',
      numero      : p.Contacto?.Direccion?.numero       || '',
      detalle     : p.Contacto?.Direccion?.detalle      || '',
      codigoPostal: p.Contacto?.Direccion?.codigoPostal || '',
      ciudad      : p.Contacto?.Direccion?.ciudad       || '',
      provincia   : p.Contacto?.Direccion?.provincia    || '',
      pais        : p.Contacto?.Direccion?.pais         || '',
    },
  },
});

export default function PacienteEditar() {
  const { id } = useParams();
  const pacienteId = Number(id);
  const navigate = useNavigate();
  const location = useLocation(); // ← necesitamos state y pathname
  const { showToast } = useToast();
  const { showModal } = useModal();
  const { updatePaciente } = usePacienteMutations();

  // Back inteligente: si hay backTo úsalo; si no, si hay history usa -1; si no, /pacientes
  const backTo =
    location.state?.backTo ??
    (window.history.length > 2 ? -1 : '/pacientes');

  const enabled = Number.isFinite(pacienteId) && pacienteId > 0;
  const { data, isLoading, isError, error } = usePaciente(pacienteId, enabled);

  if (isError) {
    handleApiError(error, showToast, null, showModal);
    navigate('/pacientes');
    return null;
  }

  // Título “instantáneo” con preview (si lo tenemos) mientras carga
  const preview = location.state?.pacientePreview;
  const fallbackTitle = preview
    ? `Editar: ${preview.apellido || ''} ${preview.nombre || ''}`.trim()
    : 'Editar paciente';

  if (isLoading || !data) {
    return (
      <>
        <BackBar title={fallbackTitle} to={backTo} />
        <div className="pacientes-loader">
          <Lottie animationData={loadingAnim} loop autoplay style={{ width: 180 }} />
        </div>
      </>
    );
  }

  const initial = normalizePacienteForForm(data);

  const handleSubmit = (form, setErrors) => {
    updatePaciente.mutate(
      { id: pacienteId, data: form },
      {
        onError: (err) => handleApiError(err, showToast, setErrors, showModal),
        onSuccess: () => {
          showToast('Paciente actualizado correctamente', 'success');
          navigate(backTo); // ← volvemos a donde vinimos
        },
      }
    );
  };

  return (
    <>
      <BackBar
        title={`Editar: ${data.apellido || ''} ${data.nombre || ''}`.trim()}
        to={backTo} // ← usa el back inteligente
      />
      <PacienteForm
        key={pacienteId}
        initialData={initial}
        onSubmit={handleSubmit}
        isLoading={updatePaciente.isLoading}
        pacienteId={pacienteId}
        onCancel={() => navigate(backTo)} // ← mismo criterio para cancelar
      />
    </>
  );
}
