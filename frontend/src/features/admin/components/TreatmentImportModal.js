// frontend/src/features/admin/components/TreatmentImportModal.js
import { useState } from 'react';
import { FaTimes, FaFileExcel, FaDownload, FaUpload, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import useToast from '../../../hooks/useToast';

export default function TreatmentImportModal({ onImported, onClose }) {
    const { showToast } = useToast();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleUpload = async () => {
        if (!file) return;
        try {
            setLoading(true);
            // Simulación de procesamiento de excel
            await new Promise(r => setTimeout(r, 2000));
            showToast('Carga masiva completada con éxito', 'success');
            onImported();
        } catch {
            showToast('Error al procesar el archivo', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal-card import" onClick={e => e.stopPropagation()}>
                <header className="am-head">
                    <div className="am-title">
                        <FaFileExcel />
                        <div>
                            <h3>Importación Masiva</h3>
                            <p>Carga de catálogo clínico vía Excel/CSV</p>
                        </div>
                    </div>
                    <button className="close-x" onClick={onClose}><FaTimes /></button>
                </header>

                <div className="am-body">
                    <div className="import-info">
                        <p>Utilizá nuestra plantilla oficial para importar tu catálogo de servicios dental en segundos.</p>
                        <button className="btn-template"><FaDownload /> Descargar Plantilla .XLSX</button>
                    </div>

                    <div className={`drop-zone ${file ? 'has-file' : ''}`}>
                        <input type="file" onChange={e => setFile(e.target.files[0])} accept=".xlsx,.csv" />
                        <div className="drop-content">
                            <FaUpload className="icon" />
                            {file ? (
                                <div className="file-info">
                                    <strong>{file.name}</strong>
                                    <span>{(file.size / 1024).toFixed(1)} KB</span>
                                </div>
                            ) : (
                                <>
                                    <p>Arrastrá tu archivo o hacé click aquí</p>
                                    <span>Soporta .XLSX y .CSV</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="format-warning">
                        <FaExclamationTriangle />
                        <p>Asegurate de que las columnas coincidan con la plantilla (Nombre, Sigla, Descripción, Precio).</p>
                    </div>
                </div>

                <footer className="am-footer">
                    <button className="btn-cancel" onClick={onClose}>Cerrar</button>
                    <button className="btn-confirm" onClick={handleUpload} disabled={!file || loading}>
                        {loading ? 'Procesando...' : <><FaCheckCircle /> Procesar Importación</>}
                    </button>
                </footer>
            </div>
        </div>
    );
}
