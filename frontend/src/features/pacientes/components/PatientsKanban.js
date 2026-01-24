// frontend/src/features/pacientes/components/PatientsKanban.js
import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FaUserAlt, FaPhoneAlt, FaIdCard } from 'react-icons/fa';

export default function PatientsKanban({ columns, pacientes, onDragEnd, onCardClick, loading }) {
    if (loading && !pacientes.length) return <p>Cargando pacientes...</p>;

    // Agrupar pacientes por estadoId (y asignar nulls a la primera columna)
    const firstColId = columns[0]?.id ? Number(columns[0].id) : null;
    const groups = columns.reduce((acc, col) => {
        const colId = Number(col.id);
        acc[col.id] = pacientes.filter(p => {
            const pEstadoId = p.estadoId ? Number(p.estadoId) : null;
            if (pEstadoId === colId) return true;
            if (pEstadoId === null && colId === firstColId) return true;
            return false;
        });
        return acc;
    }, {});



    return (
        <div className="kanban-board">
            <DragDropContext onDragEnd={onDragEnd}>
                {columns.map((column) => (
                    <Droppable key={column.id} droppableId={column.id.toString()}>
                        {(provided, snapshot) => (
                            <div
                                className={`kanban-column ${snapshot.isDraggingOver ? 'active' : ''}`}
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                <div className="kanban-column-header" style={{ borderTop: `4px solid ${column.color}` }}>
                                    <h3>{column.nombre}</h3>
                                    <span className="count">{groups[column.id]?.length || 0}</span>
                                </div>

                                <div className="kanban-cards">
                                    {groups[column.id]?.map((paciente, index) => (
                                        <Draggable
                                            key={paciente.id}
                                            draggableId={paciente.id.toString()}
                                            index={index}
                                        >
                                            {(provided, snapshot) => (
                                                <div
                                                    className={`kanban-card ${snapshot.isDragging ? 'dragging' : ''}`}
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    onClick={() => onCardClick(paciente)}
                                                >
                                                    <div className="card-header">
                                                        <FaUserAlt className="icon-main" style={{ color: column.color }} />
                                                        <h4>{paciente.apellido}, {paciente.nombre}</h4>
                                                    </div>

                                                    <div className="card-body">
                                                        <p><FaIdCard /> <span>{paciente.dni}</span></p>
                                                        {paciente.Contacto?.telefonoMovil && (
                                                            <p><FaPhoneAlt /> <span>{paciente.Contacto.telefonoMovil}</span></p>
                                                        )}
                                                    </div>

                                                    {paciente.uvisita && (
                                                        <div className="card-footer">
                                                            <small>Últ. visita: {new Date(paciente.uvisita).toLocaleDateString()}</small>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            </div>
                        )}
                    </Droppable>
                ))}
            </DragDropContext>
        </div>
    );
}
