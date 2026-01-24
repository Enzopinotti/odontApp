// src/features/odontograma/constants.js
export const FACE_LABELS = {
  O: 'Oclusal/Incisal',
  M: 'Mesial',
  D: 'Distal',
  B: 'Vestibular',
  L: 'Palatino/Lingual',
};

export const FDI_ORDER = {
  1: [18, 17, 16, 15, 14, 13, 12, 11],
  2: [21, 22, 23, 24, 25, 26, 27, 28],
  3: [31, 32, 33, 34, 35, 36, 37, 38],
  4: [48, 47, 46, 45, 44, 43, 42, 41],
};


// Paleta clínica estandarizada (Convención Internacional)
export const COLORS = {
  realizado: '#1d4ed8', // Azul (Sólido/Realizado)
  planificado: '#dc2626', // Rojo (Patología/A realizar)
  preventivo: '#d97706', // Ámbar (Sellantes/Profilaxis)
  provisorio: '#059669', // Esmeralda (Temporal/Provisorio)
  antiguo: '#4b5563', // Gris (Pre-existente fuera de clínica)
};

export const COLOR_SWATCHES = [
  '#dc2626', // Rojo
  '#1d4ed8', // Azul
  '#d97706', // Ámbar
  '#059669', // Verde
  '#4b5563', // Gris
  '#7c3aed', // Violeta
  '#db2777', // Rosa
];