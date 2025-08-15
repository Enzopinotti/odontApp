import { useMutation, useQueryClient } from '@tanstack/react-query';
import { crearPaciente } from '../../../api/clinica';
import PacienteForm from '../components/PacienteForm';
import { handleApiError } from '../../../utils/handleApiError';
import useToast from '../../../hooks/useToast';
import useModal from '../../../hooks/useModal';
import { useNavigate } from 'react-router-dom';
import BackBar from '../../../components/BackBar';

const EMPTY = {
  nombre: '',
  apellido: '',
  dni: '',
  obraSocial: '',
  nroAfiliado: '',
  ultimaVisita: '',
  Contacto: {
    email: '',
    telefonoMovil: '',
    telefonoFijo: '',
    preferenciaContacto: 'email',
    Direccion: {
      calle: '',
      numero: '',
      detalle: '',
      codigoPostal: '',
      ciudad: '',
      provincia: '',
      pais: '',
    },
  },
};

export default function PacienteNuevo() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { showModal } = useModal();
  const navigate = useNavigate();

  const { mutate, isLoading } = useMutation({
    mutationFn: crearPaciente,
    onSuccess: () => {
      showToast('Paciente creado correctamente', 'success');
      queryClient.invalidateQueries(['pacientes']);
      navigate('/pacientes');
    },
    onError: (err, _, ctx) => handleApiError(err, showToast, ctx, showModal),
  });

  const handleSubmit = (form, setErrors) => {
    mutate(form, {
      onError: (err) => handleApiError(err, showToast, setErrors, showModal),
    });
  };

  return (
    <>
      <BackBar title="Nuevo paciente" to="/pacientes" />
      <PacienteForm
        initialData={EMPTY}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        pacienteId={null}
        onCancel={() => navigate(-1)} // botón “Cancelar/Volver”
      />
    </>
  );
}
