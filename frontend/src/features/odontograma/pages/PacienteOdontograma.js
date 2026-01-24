// frontend/src/features/odontograma/pages/PacienteOdontograma.js
import { useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BackBar from '../../../components/BackBar';
import { AuthCtx } from '../../../context/AuthProvider';
import usePaciente from '../../pacientes/hooks/usePaciente';
import useToast from '../../../hooks/useToast';

import useOdontogramaData from '../hooks/useOdontogramaData';
import useCarasMutations from '../hooks/useCarasMutations';
import useApplyTratamiento from '../hooks/useApplyTratamiento';
import { useOdontologos } from '../../admin/hooks/useOdontologos';

import OdontogramaGrid from '../components/OdontogramaGrid';
import FaceMenu from '../components/FaceMenu';
import OdontogramaLegend from '../components/OdontogramaLegend';
import TreatmentPicker from '../components/TreatmentPicker';
import OdontogramaHistory from '../components/OdontogramaHistory';

import { COLORS, FDI_ORDER } from '../constants';
import { intToHex } from '../utils/color';

export default function PacienteOdontograma() {
  const { id } = useParams();
  const pid = Number(id);
  const { showToast } = useToast();
  const { hasPermiso, user } = useContext(AuthCtx);
  const { data: dentistsData } = useOdontologos();
  const dentists = dentistsData?.data || [];

  // Restricciones de rol
  const isAdmin = user?.Rol?.nombre?.toUpperCase() === 'ADMIN';
  const canVerOdontograma = hasPermiso?.('odontograma', 'ver') ?? true;
  const canEditarOdontograma = (hasPermiso?.('odontograma', 'editar') ?? true) && !isAdmin;

  const { data: paciente } = usePaciente(pid, true);
  const { data: odoBox, isLoading, refetch } = useOdontogramaData(pid, canVerOdontograma);
  const odoDenied = !!odoBox?.denied;
  const odo = odoBox?.data;

  const { addCara, updateCara, delCara } = useCarasMutations(pid);
  const { apply } = useApplyTratamiento(pid);

  const title = useMemo(() => {
    if (paciente) return `Odontograma · ${paciente.apellido || ''} ${paciente.nombre || ''}`.trim();
    return 'Odontograma';
  }, [paciente]);

  const [menu, setMenu] = useState({ open: false, dienteId: null, faceKey: null, fdi: null });
  const [selectedFaces, setSelectedFaces] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [pendingTreatment, setPendingTreatment] = useState(null);

  // Profesional Responsable (ID)
  const [clinicalUserId, setClinicalUserId] = useState('');

  useEffect(() => {
    if (user && !clinicalUserId) {
      setClinicalUserId(user.id);
    }
  }, [user, clinicalUserId]);

  const openMenu = useCallback((e, diente, faceKey, currentCara) => {
    if (!canEditarOdontograma) {
      if (isAdmin) showToast('Los administradores no pueden realizar cambios clínicos.', 'warning');
      return;
    }
    setMenu({ open: true, dienteId: diente.id, faceKey, fdi: diente._fdi });
    setSelectedFaces(faceKey && faceKey !== 'TODAS' ? [faceKey] : []);
    setPendingTreatment(null);
  }, [canEditarOdontograma, isAdmin, showToast]);

  // BUSCAR EL DIENTE ACTUALIZADO (Sincronización con odo.Dientes)
  const currentToothData = useMemo(() => {
    if (!menu.dienteId || !odo?.Dientes) return null;
    const found = odo.Dientes.find(d => d.id === menu.dienteId);
    if (!found) return null;
    return { ...found, _fdi: menu.fdi }; // Preservar número FDI
  }, [menu.dienteId, menu.fdi, odo]);

  const closeMenu = useCallback(() => {
    setMenu((m) => ({ ...m, open: false }));
    setPendingTreatment(null);
  }, []);

  const onOpenCatalogFromMenu = (faces) => {
    setSelectedFaces(faces || []);
    setShowPicker(true);
    setMenu(m => ({ ...m, open: false }));
  };

  const onHandlePickedTreatment = (t) => {
    setPendingTreatment(t);
    setShowPicker(false);
    setMenu(m => ({ ...m, open: true }));
  };

  const onMenuAction = async ({ estado, color, tipoTrazo, remove, faces, targetId, isCara, fromCatalog }) => {
    const finalUserId = clinicalUserId;
    if (!finalUserId && !remove) {
      showToast('Debes seleccionar un profesional responsable.', 'warning');
      return;
    }

    try {
      if (!menu.dienteId) return;

      // CASO: REGISTRO DESDE CATALOGO
      if (fromCatalog && pendingTreatment) {
        await apply.mutateAsync({
          dienteId: menu.dienteId,
          payload: {
            tratamientoId: pendingTreatment.id,
            estado: pendingTreatment._estado,
            color: pendingTreatment._color,
            usuarioId: pendingTreatment._profesionalId || finalUserId,
            caras: faces && faces.length > 0 ? faces : null
          }
        });
        showToast(`Tratamiento registrado correctamente`, 'success');
        closeMenu();
        refetch();
        return;
      }

      // CASO: ELIMINACIÓN
      if (remove && targetId) {
        const idNumeric = String(targetId).split('-')[1];
        if (isCara) await delCara.mutateAsync({ caraId: idNumeric });
        showToast('Intervención eliminada', 'success');
        refetch();
        return;
      }

      // CASO: MARCACIÓN RÁPIDA
      const targetFaces = faces && faces.length > 0 ? faces : [menu.faceKey || 'TODAS'];

      for (const face of targetFaces) {
        const currentRecord = (currentToothData?.CaraTratadas || []).find(c => c.simbolo === face);
        if (remove && currentRecord) {
          await delCara.mutateAsync({ caraId: currentRecord.id });
        } else if (currentRecord) {
          await updateCara.mutateAsync({
            caraId: currentRecord.id,
            simbolo: face,
            estadoCara: estado || currentRecord.estadoCara,
            colorHex: color || intToHex(currentRecord.colorEstado),
            tipoTrazo: tipoTrazo || currentRecord.tipoTrazo,
            usuarioId: finalUserId
          });
        } else if (!remove) {
          await addCara.mutateAsync({
            dienteId: menu.dienteId,
            simbolo: face,
            estadoCara: estado || 'Planificado',
            colorHex: color || '#ef4444',
            tipoTrazo: tipoTrazo || 'Continuo',
            usuarioId: finalUserId
          });
        }
      }

      showToast(remove ? 'Marca eliminada' : 'Cambios aplicados correctamente', 'success');
      refetch();
      if (!faces || faces.length <= 1) closeMenu();
    } catch (err) {
      console.error(err);
      showToast('Error al procesar la operación', 'error');
    }
  };

  const fechaBadge = odo?.createdAt ? new Date(odo.createdAt).toLocaleDateString() : '—';
  const [activeTab, setActiveTab] = useState('diagram');

  return (
    <div className="odo-page">
      <BackBar title={title} to={-1} />

      {isLoading ? (
        <section className="card"><div className="odo-loader">Sincronizando expediente dental...</div></section>
      ) : !canVerOdontograma || odoDenied ? (
        <section className="card empty-odo"><h3>Acceso Restringido</h3><p className="muted">No tiene permisos para ver esta sección clínica.</p></section>
      ) : odo === null ? (
        <section className="card empty-odo"><h3>Ficha Inexistente</h3><p className="muted">El paciente no posee un odontograma base.</p></section>
      ) : (
        <section className="odo-main-container">
          <header className="odo-premium-header">
            <div className="title-area">
              <h1>Odontograma Clínico</h1>
              <div className="patient-tag">{paciente?.apellido}, {paciente?.nombre} • DNI: {paciente?.dni}</div>
            </div>
            <div className="meta-area">
              <div className="odo-meta-badge">Última actualización: <strong>{fechaBadge}</strong></div>
              {isAdmin && <div className="odo-warning-badge">Modo Lectura (Administración)</div>}
            </div>
          </header>

          <nav className="odo-tabs">
            <button className={activeTab === 'diagram' ? 'active' : ''} onClick={() => setActiveTab('diagram')}>
              Diagrama Dental
            </button>
            <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>
              Historial de Intervenciones
            </button>
          </nav>

          <div className="odo-tab-content">
            {activeTab === 'diagram' ? (
              <div className="diag-view animate-fade">
                <div className="odo-layout-pro">
                  <div className="odo-grid-wrapper">
                    <OdontogramaGrid odo={odo} onOpenMenu={openMenu} />
                  </div>
                  <OdontogramaLegend />
                </div>
              </div>
            ) : (
              <div className="history-view animate-fade">
                <OdontogramaHistory odo={odo} />
              </div>
            )}
          </div>

          <FaceMenu
            open={menu.open}
            diente={currentToothData}
            initialFaces={selectedFaces}
            clinicalUserId={clinicalUserId}
            dentists={dentists}
            onUserChange={setClinicalUserId}
            onAction={onMenuAction}
            onOpenCatalog={onOpenCatalogFromMenu}
            onClose={closeMenu}
            pendingTreatment={pendingTreatment}
            onClearPending={() => setPendingTreatment(null)}
          />

          {showPicker && (
            <TreatmentPicker
              pacienteId={pid}
              dienteSeleccionado={currentToothData}
              selectedFaces={selectedFaces}
              onApplied={onHandlePickedTreatment}
              onClose={() => { setShowPicker(false); setMenu(m => ({ ...m, open: true })); }}
            />
          )}
        </section>
      )}
    </div>
  );
}
