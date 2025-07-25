import { Router} from 'express';
import * as medicamentoRecetadoController from '../controllers/MedicamentoRecetadoController.js';

const router = Router({mergeParams: true});

router.get('/', medicamentoRecetadoController.listarItems);

export default router;