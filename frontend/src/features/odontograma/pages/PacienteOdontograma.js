import { useContext, useMemo, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import BackBar from '../../../components/BackBar';
import { AuthCtx } from '../../../context/AuthProvider';
import usePaciente from '../../pacientes/hooks/usePaciente';
import useToast from '../../../hooks/useToast';

import useOdontogramaData from '../hooks/useOdontogramaData';
import useCarasMutations from '../hooks/useCarasMutations';

import OdontogramaGrid from '../components/OdontogramaGrid';
import FaceMenu from '../components/FaceMenu';
import OdontogramaLegend from '../components/OdontogramaLegend';
import TreatmentPicker from '../components/TreatmentPicker';

import { COLORS } from '../constants';
import { intToHex } from '../utils/color';

function clamp(n, min, max) { return Math.max(min, Math.min(n, max)); }

export default function PacienteOdontograma() {
  const { id } = useParams();
  const pid = Number(id);
  const { showToast } = useToast();
  const { hasPermiso } = useContext(AuthCtx);

  const canVerOdontograma    = hasPermiso?.('odontograma', 'ver') ?? true;
  const canEditarOdontograma = hasPermiso?.('odontograma', 'editar') ?? true;

  const { data: paciente } = usePaciente(pid, true);
  const { data: odoBox, isLoading } = useOdontogramaData(pid, canVerOdontograma);
  const odoDenied = !!odoBox?.denied;
  const odo = odoBox?.data;

  const { addCara, updateCara, delCara } = useCarasMutations(pid);

  const title = useMemo(() => {
    if (paciente) return `Odontograma · ${paciente.apellido || ''} ${paciente.nombre || ''}`.trim();
    return 'Odontograma';
  }, [paciente]);

  // selección + popover
  const [menu, setMenu] = useState({ open: false, x: 0, y: 0, diente: null, faceKey: null, current: null });
  const [selectedTooth, setSelectedTooth] = useState(null);

  // catálogo opcional
  const [showPicker, setShowPicker] = useState(false);

  const openMenu = useCallback((e, diente, faceKey, currentCara) => {
    if (!canEditarOdontograma) return;
    const vw = window.innerWidth, vh = window.innerHeight;
    const PAD = 8, MENU_W = 300, MENU_H = 220;
    const x = clamp(e.clientX + PAD, 8, vw - MENU_W - 8);
    const y = clamp(e.clientY + PAD, 8, vh - MENU_H - 8);
    setMenu({ open: true, x, y, diente, faceKey, current: currentCara || null });
    setSelectedTooth(diente);
  }, [canEditarOdontograma]);

  const closeMenu = useCallback(() => setMenu((m) => ({ ...m, open: false })), []);
  const onOpenCatalogFromMenu = () => { setShowPicker(true); closeMenu(); };

  const onMenuAction = async ({ estado, color, tipoTrazo, remove }) => {
    try {
      const target = menu;
      if (!target.diente || !target.faceKey) return;

      const current = target.current;
      const finalEstado = estado || current?.estadoCara || 'Planificado';
      const finalColor  = color  || (current ? intToHex(current.colorEstado) : COLORS.planificado);
      const finalTrazo  = tipoTrazo || current?.tipoTrazo || 'Continuo';

      if (remove && current) {
        await delCara.mutateAsync({ caraId: current.id });
        showToast('Cara eliminada', 'success');
      } else if (current) {
        await updateCara.mutateAsync({
          caraId: current.id,
          simbolo: target.faceKey,
          estadoCara: finalEstado,
          colorHex: finalColor,
          tipoTrazo: finalTrazo,
        });
        showToast('Cara actualizada', 'success');
      } else {
        await addCara.mutateAsync({
          dienteId: target.diente.id,
          simbolo: target.faceKey,
          estadoCara: finalEstado,
          colorHex: finalColor,
          tipoTrazo: finalTrazo,
        });
        showToast('Cara marcada', 'success');
      }
    } catch {
      showToast('No se pudo guardar la cara', 'error');
    } finally {
      closeMenu();
    }
  };

  const fechaBadge = (() => {
    const f = odo?.fechaCreacion || odo?.createdAt;
    return f ? new Date(f).toLocaleDateString() : '—';
  })();

  return (
    <div className="odo-page">
      <BackBar title={title} to={-1} />

      {isLoading && (
        <section className="card">
          <div className="odo-loader">Cargando odontograma…</div>
        </section>
      )}

      {!isLoading && !canVerOdontograma && (
        <section className="card empty-odo">
          <h3>Sin acceso</h3>
          <p className="muted">Tu rol no puede ver el odontograma de este paciente.</p>
        </section>
      )}

      {!isLoading && canVerOdontograma && odoDenied && (
        <section className="card empty-odo">
          <h3>Sección oculta</h3>
          <p className="muted">No tenés permisos para ver este odontograma.</p>
        </section>
      )}

      {!isLoading && canVerOdontograma && !odoDenied && odo === null && (
        <section className="card empty-odo">
          <h3>Sin odontograma</h3>
          <p className="muted">Este paciente aún no tiene odontograma.</p>
        </section>
      )}

      {!isLoading && canVerOdontograma && !odoDenied && odo && (
        <section className={`card odo-layout ${showPicker ? 'with-picker' : ''}`}>
          <div className="odo-left">
            <header className="odo-head">
              <div className="badge">Creado: {fechaBadge}</div>
              {odo.estadoGeneral && <div className="badge alt">{odo.estadoGeneral}</div>}
            </header>

            <OdontogramaGrid odo={odo} onOpenMenu={openMenu} />
            <OdontogramaLegend />

            <FaceMenu
              open={menu.open}
              x={menu.x}
              y={menu.y}
              diente={menu.diente}
              faceKey={menu.faceKey}
              current={menu.current}
              onAction={onMenuAction}
              onOpenCatalog={onOpenCatalogFromMenu}
              onClose={closeMenu}
            />
          </div>

          {showPicker && (
            <div className="odo-right">
              <TreatmentPicker
                pacienteId={pid}
                dienteSeleccionado={selectedTooth}
                onApplied={() => { setShowPicker(false); showToast('Tratamiento aplicado', 'success'); }}
                onClose={() => setShowPicker(false)}
              />
            </div>
          )}
        </section>
      )}
    </div>
  );
}
