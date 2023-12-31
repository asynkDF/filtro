let { body, validationResult } = require('express-validator');
let mongoose = require('mongoose');
let Camper = require('../models/Camper');

exports.validateCamperPosting = [
    body('nombre').notEmpty(),
    body('típoIdentificacion').isIn(['T.I', 'C.C']),
    body('NroIdentificacion').isLength({ min: 10, max: 10 }),
    body('email').isEmail().custom(async (value) => {
        let existingCamper = await Camper.findOne({ email: value });
        if (existingCamper) {
            throw new Error('Este email ya está en uso');
        }
        return true;
    }),
    body('password').isLength({ min: 8 }),
    async (req, res, next) => {
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        if ( req.camper && req.camper.rol !== 'gerenteRol') {
            return res.status(403).json({ message: 'Acceso no autorizado'});
        }
        next();
    }
];
exports.validateDeletePermissions = async (req, res, next) => {
    if (req.camper && req.camper.rol !== 'gerenteRol') {
        let existingCamper = await Camper.findById(req.params.id);
        if (!existingCamper) {
            return res.status(404).json({ message: 'Camper no encontrado' });
        }
        next();
    } else {
        res.status(403).json({ message: 'Acceso no autorizado' });
    }
};
exports.validateUpdatePermissions = async (req, res, next) => {
    if (req.camper && req.camper.rol !== 'gerenteRol' || req.camper && req.camper.rol !== 'trainerRol') {
        let existingCamper = await Camper.findById(req.params.id);
        if (!existingCamper) {
            return res.status(404).json({ message: 'Camper no encontrado' });
        }
        next();
    } else {
        res.status(403).json({ message: 'Acceso no autorizado' });
    }
};
