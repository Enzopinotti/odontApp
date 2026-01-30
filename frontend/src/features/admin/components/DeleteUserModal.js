import { useState } from 'react';
import { FaTimes, FaExclamationTriangle, FaTrashAlt } from 'react-icons/fa';

export default function DeleteUserModal({ user, onClose, onConfirm, isDeleting }) {
    const [confirmText, setConfirmText] = useState('');
    const isConfirmValid = confirmText === 'ELIMINAR';

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isConfirmValid) {
            onConfirm();
        }
    };

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <form
                className="admin-modal-card danger"
                onClick={e => e.stopPropagation()}
                onSubmit={handleSubmit}
            >
                <header className="am-head">
                    <div className="am-title">
                        <FaExclamationTriangle style={{ color: '#e74c3c' }} />
                        <div>
                            <h3>Eliminar Usuario</h3>
                            <p>Esta acción es irreversible</p>
                        </div>
                    </div>
                    <button type="button" className="close-x" onClick={onClose}>
                        <FaTimes />
                    </button>
                </header>

                <div className="am-body">
                    <div style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginBottom: '1.5rem'
                    }}>
                        <p style={{ margin: 0, color: '#991b1b', fontSize: '0.95rem', lineHeight: '1.5' }}>
                            <strong>⚠️ Advertencia:</strong> Estás a punto de eliminar permanentemente a{' '}
                            <strong>{user.nombre} {user.apellido}</strong> ({user.email}).
                            Esta acción no se puede deshacer.
                        </p>
                    </div>

                    <div className="field">
                        <label>
                            Para confirmar, escribe <strong style={{ color: '#e74c3c' }}>ELIMINAR</strong> en el campo:
                        </label>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="Escribe ELIMINAR en mayúsculas"
                            autoComplete="off"
                            autoFocus
                            style={{
                                padding: '0.75rem',
                                borderRadius: '6px',
                                border: `2px solid ${isConfirmValid ? '#10b981' : '#e5e7eb'}`,
                                fontSize: '1rem',
                                fontFamily: 'monospace',
                                textAlign: 'center',
                                transition: 'border-color 0.2s'
                            }}
                        />
                    </div>

                    {confirmText && !isConfirmValid && (
                        <p style={{
                            color: '#dc2626',
                            fontSize: '0.85rem',
                            marginTop: '0.5rem',
                            marginBottom: 0
                        }}>
                            Debe escribir exactamente "ELIMINAR" en mayúsculas
                        </p>
                    )}
                </div>

                <footer className="am-footer">
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="btn-danger"
                        disabled={!isConfirmValid || isDeleting}
                        style={{
                            background: isConfirmValid ? '#e74c3c' : '#9ca3af',
                            opacity: isConfirmValid ? 1 : 0.6,
                            cursor: isConfirmValid && !isDeleting ? 'pointer' : 'not-allowed'
                        }}
                    >
                        <FaTrashAlt />
                        {isDeleting ? 'Eliminando...' : 'Eliminar Usuario'}
                    </button>
                </footer>
            </form>
        </div>
    );
}
