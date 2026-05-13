const express = require('express');
const router = express.Router();
const ConstructionObject = require('../models/Object');

// GET /api/objects - получить все объекты с фильтрацией
router.get('/objects', async (req, res) => {
    try {
        const { status } = req.query;
        let whereClause = {};
        
        if (status && status !== 'all') {
            whereClause.status = status;
        }
        
        const objects = await ConstructionObject.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });
        
        res.json({ success: true, data: objects });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/objects/:id - получить один объект
router.get('/objects/:id', async (req, res) => {
    try {
        const object = await ConstructionObject.findByPk(req.params.id);
        if (!object) {
            return res.status(404).json({ success: false, error: 'Объект не найден' });
        }
        res.json({ success: true, data: object });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;