// src/hooks/useModal.js
import { useContext } from 'react';
import { ModalCtx } from '../context/ModalProvider';

export default function useModal() {
  return useContext(ModalCtx);
}
