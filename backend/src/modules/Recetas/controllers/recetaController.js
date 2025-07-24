import { or, where } from 'sequelize';
import models from '../models/index.js';
import {v4  as uuidv4} from 'uuid';

const recetaController = {
    //crear receta requiere rol odontologo y paciente valido
    async crearReceta(req, res, next) {
        try {
            const{
                pacienteId,
                medicamentos,
                diagnostico,
                observaciones,      
            }= req.body;
            const paciente= await models.Paciente.findByPk(pacienteId);
            if(!paciente) {
                return res.fail(new Error('Paciente no encontrado'), 404);
            }
            const odontologo = await models.Odontologo.findOne({
                where: { userId: req.user.id }});
            if (!odontologo|| !odontologo.firmaDigital) {
                return res.fail(new Error('Odontólogo no encontrado o sin firma digital'), 404);
            }
            const nombreProfesional = `${odontologo.nombre} ${odontologo.apellido}`;
            const receta = await models.Receta.create({
                nombreProfesional,
                matricula: odontologo.matricula,
                firmaDigital: odontologo.firmaDigital,
                userId: req.user.id,
                pacienteId:paciente.id,
                nombrePaciente: paciente.nombre,
                dniPaciente: paciente.dni,
                fechaNacimientoPaciente: paciente.fechaNacimiento,
                sexoPaciente: paciente.sexo,
                diagnostico,
                codigoBarra: uuidv4(), // Genera un código de barras único
                medicamentos
            },{include:['medicamentosRecetados']});
            return res.created({recetaId: recetaId},'Receta creada correctamente');

    } catch (error) {
            console.error('Error al crear receta:', error);
            return res.fail(error, 500);
        }},
    //obtener receta por id
    async getRecetaById(req, res, next) {
        try{
            const receta= await modeld.Receta.findByPk(req.params.id, {
                include: [
                    {
                        model: models.Paciente,
                        as: 'paciente',
                        attributes: ['pacienteId', 'nombre', 'apellido', 'dni', 'fechaNacimiento', 'sexo']
                    },
                    {
                        model: models.Odontologo,
                        as: 'odontologo',
                        attributes: ['userId', 'nombre', 'apellido', 'matricula']
                    },
                    {
                        model: models.MedicamentoRecetado,
                        as: 'medicamentosRecetados',
                        attributes: ['medicamentoId', 'nombre', 'presentacion', 'cantidadUnidades']
                    }
                ]
            });
            if (!receta){
                return res.fail(new Error('Receta no encontrada'), 404);
            }
            return res.ok(receta, 'Receta obtenida correctamente');
    
        } catch (error) {
            console.error('Error al obtener receta:', error);
            return res.fail(error, 500);
        }
    },
    
    async listarRecetas(req,res,next){
        try{
            const recetas= await models.Receta.findAll({
                where: {
                    userId: req.user.id
                },
                include:['paciente'],
                order: [['createdAt', 'DESC']]
        });
            return res.ok(recetas, 'Recetas obtenidas correctamente');
        }catch (error) {
            console.error('Error al listar recetas:', error);
            return res.fail(error, 500);
        }
    },  

    async decargarRecetaPDF(req, res, next) {
        try{
            const receta= await models.Receta.findByPk(req.params.id, {
                include: ['medicamentosRecetados', 'paciente', 'odontologo']
        });
         if (!receta) {
            return res.fail(new Error('Receta no encontrada'), 404);   }
            const pdf = await models.Receta.generatePDF(receta);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=receta-${receta.id}.pdf`);
            return res.send(pdf);
        } catch (error) {
            console.error('Error al descargar receta en PDF:', error);
            return res.fail(error, 500);
        }
    } 

};
export default recetaController;