const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const ConstructionObject = require('../models/Object');
const User = require('../models/User');
const Message = require('../models/Message');
const { requireAuth, requireLogout } = require('../middleware/auth');

// Настройка загрузки фото
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Только изображения!'));
    }
});

// Страница входа
router.get('/login', requireLogout, (req, res) => {
    res.render('admin/login', { title: 'Вход в админ-панель', error: null });
});

// Обработка входа
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ where: { username } });
        if (!user || !(await user.checkPassword(password))) {
            return res.render('admin/login', { title: 'Вход', error: 'Неверный логин или пароль' });
        }
        req.session.isAuthenticated = true;
        req.session.user = { id: user.id, username: user.username, role: user.role };
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.render('admin/login', { title: 'Вход', error: 'Ошибка сервера' });
    }
});

// Выход
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Панель управления
router.get('/dashboard', requireAuth, async (req, res) => {
    try {
        const objects = await ConstructionObject.findAll({ order: [['createdAt', 'DESC']] });
        res.render('admin/dashboard', { title: 'Админ-панель', objects, user: req.session.user });
    } catch (error) {
        res.status(500).send('Ошибка загрузки');
    }
});

// Форма добавления объекта
router.get('/add', requireAuth, (req, res) => {
    res.render('admin/add', { title: 'Добавить объект', error: null });
});

// Обработка добавления
router.post('/add', requireAuth, upload.single('image'), async (req, res) => {
    try {
        const { name, address, latitude, longitude, status, completion_date, floors, material, description, price_from } = req.body;
        
        const objectData = {
            name,
            address,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            status,
            completion_date: completion_date || null,
            floors: floors ? parseInt(floors) : null,
            material,
            description,
            price_from: price_from ? parseInt(price_from) : null
        };
        
        if (req.file) {
            objectData.preview_image = req.file.filename;
        }
        
        await ConstructionObject.create(objectData);
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.render('admin/add', { title: 'Добавить объект', error: error.message });
    }
});

// Форма редактирования
router.get('/edit/:id', requireAuth, async (req, res) => {
    try {
        const object = await ConstructionObject.findByPk(req.params.id);
        if (!object) {
            return res.status(404).send('Объект не найден');
        }
        res.render('admin/edit', { title: 'Редактировать объект', object, error: null });
    } catch (error) {
        res.status(500).send('Ошибка');
    }
});

// Обработка редактирования
router.post('/edit/:id', requireAuth, upload.single('image'), async (req, res) => {
    try {
        const object = await ConstructionObject.findByPk(req.params.id);
        if (!object) {
            return res.status(404).send('Объект не найден');
        }
        
        const { name, address, latitude, longitude, status, completion_date, floors, material, description, price_from } = req.body;
        
        object.name = name;
        object.address = address;
        object.latitude = parseFloat(latitude);
        object.longitude = parseFloat(longitude);
        object.status = status;
        object.completion_date = completion_date || null;
        object.floors = floors ? parseInt(floors) : null;
        object.material = material;
        object.description = description;
        object.price_from = price_from ? parseInt(price_from) : null;
        
        if (req.file) {
            object.preview_image = req.file.filename;
        }
        
        await object.save();
        res.redirect('/admin/dashboard');
    } catch (error) {
        const object = await ConstructionObject.findByPk(req.params.id);
        res.render('admin/edit', { title: 'Редактировать объект', object, error: error.message });
    }
});

// Удаление объекта
router.get('/delete/:id', requireAuth, async (req, res) => {
    try {
        const object = await ConstructionObject.findByPk(req.params.id);
        if (object) {
            await object.destroy();
        }
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.status(500).send('Ошибка удаления');
    }
});

// Просмотр сообщений
router.get('/messages', requireAuth, async (req, res) => {
    try {
        const messages = await Message.findAll({ order: [['createdAt', 'DESC']] });
        res.render('admin/messages', { title: 'Сообщения от клиентов', messages });
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка загрузки сообщений');
    }
});

// Удаление сообщения
router.get('/messages/delete/:id', requireAuth, async (req, res) => {
    try {
        await Message.destroy({ where: { id: req.params.id } });
        res.redirect('/admin/messages');
    } catch (error) {
        res.status(500).send('Ошибка удаления');
    }
});

module.exports = router;
