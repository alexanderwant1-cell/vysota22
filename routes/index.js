const express = require('express');
const router = express.Router();
const ConstructionObject = require('../models/Object');
const Message = require('../models/Message');

// Главная страница
router.get('/', async (req, res) => {
    try {
        const totalObjects = await ConstructionObject.count();
        const buildingObjects = await ConstructionObject.count({ where: { status: 'building' } });
        const completedObjects = await ConstructionObject.count({ where: { status: 'completed' } });
        const planningObjects = await ConstructionObject.count({ where: { status: 'planning' } });
        
        res.render('index', {
            title: 'ООО "Высота22" - Строительство частных домов в Барнауле',
            stats: { total: totalObjects, building: buildingObjects, completed: completedObjects, planning: planningObjects },
            mapCenter: { lat: 53.354, lng: 83.745 },
            mapZoom: 11
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка сервера');
    }
});

// Страница контактов
router.get('/contacts', (req, res) => {
    res.render('contacts', { title: 'Контакты - ООО "Высота22"' });
});

// Страница справки
router.get('/help', (req, res) => {
    res.render('help', { title: 'Справочная система - ООО "Высота22"' });
});

// Детальная страница объекта
router.get('/object/:id', async (req, res) => {
    try {
        const object = await ConstructionObject.findByPk(req.params.id);
        if (!object) {
            return res.status(404).render('404', { title: 'Объект не найден' });
        }
        
        const statusMap = {
            planning: { text: '📋 Проектируется', class: 'planning' },
            building: { text: '🏗️ Строится', class: 'building' },
            completed: { text: '✅ Сдан в эксплуатацию', class: 'completed' }
        };
        
        res.render('object', {
            title: object.name,
            object: object,
            statusInfo: statusMap[object.status]
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка сервера');
    }
});

// Обработка формы обратной связи
router.post('/send-message', async (req, res) => {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
        return res.json({ success: false, message: 'Заполните все поля' });
    }
    
    try {
        await Message.create({ name, email, message });
        res.json({ success: true, message: 'Сообщение отправлено!' });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'Ошибка отправки' });
    }
});

// Получение списка сообщений (API для админки)
router.get('/api/messages', async (req, res) => {
    try {
        const messages = await Message.findAll({ order: [['createdAt', 'DESC']] });
        res.json({ success: true, data: messages });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

module.exports = router;