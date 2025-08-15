// src/features/odontograma/utils/color.js
export const hexToInt = (hex) => parseInt(String(hex || '').replace('#', ''), 16);
export const intToHex = (num) => `#${Number(num).toString(16).padStart(6, '0')}`;