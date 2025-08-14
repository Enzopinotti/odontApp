// src/features/odontograma/constants.js
export const FACE_LABELS = {
  O: 'Oclusal/Incisal',
  B: 'Bucal/vestibular',
  L: 'Lingual/Palatino',
  M: 'Mesial',
  D: 'Distal',
};

export const FDI_ORDER = {
  1: [18,17,16,15,14,13,12,11], // sup. derecha
  2: [21,22,23,24,25,26,27,28], // sup. izquierda
  3: [38,37,36,35,34,33,32,31], // inf. izquierda
  4: [41,42,43,44,45,46,47,48], // inf. derecha
};

export const COLORS = {
  realizado: '#22c55e',
  planificado: '#f59e0b',
  antiguo: '#ef4444',
};

export const COLOR_SWATCHES = [
  '#22c55e', '#f59e0b', '#ef4444', '#0ea5e9', '#8b5cf6', '#94a3b8'
];
