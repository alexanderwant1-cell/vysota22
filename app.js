const express = require('express');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isAuthenticated || false;
    res.locals.currentUser = req.session.user || null;
    next();
});

const sequelize = require('./database/connection');
const ConstructionObject = require('./models/Object');
const User = require('./models/User');

const indexRoutes = require('./routes/index');
const objectRoutes = require('./routes/objects');
const adminRoutes = require('./routes/admin');

app.use('/', indexRoutes);
app.use('/api', objectRoutes);
app.use('/admin', adminRoutes);

async function initDatabase() {
    try {
        await sequelize.authenticate();
        console.log('✅ База данных SQLite подключена');
        
        await sequelize.sync({ alter: true });
        console.log('✅ Таблицы созданы');
        
        const adminExists = await User.findOne({ where: { username: 'admin' } });
        if (!adminExists) {
            const hash = await bcrypt.hash('admin123', 10);
            await User.create({ username: 'admin', password_hash: hash });
            console.log('✅ Создан администратор: admin / admin123');
        }
        
        const count = await ConstructionObject.count();
        if (count === 0) {
            await ConstructionObject.bulkCreate([
                {
                    name: 'Дом на ул. Солнечной',
                    address: 'г. Барнаул, ул. Солнечная, 15',
                    latitude: 53.354,
                    longitude: 83.745,
                    status: 'building',
                    completion_date: '2025-12-31',
                    floors: 180,
                    material: 'Газобетон',
                    description: 'Двухэтажный частный дом 180 м² с участком 6 соток.',
                    price_from: 4500000
                },
                {
                    name: 'Коттеджный посёлок "Боровое"',
                    address: 'г. Барнаул, пос. Боровое, ул. Лесная, 7',
                    latitude: 53.38,
                    longitude: 83.72,
                    status: 'planning',
                    completion_date: '2026-06-30',
                    floors: 220,
                    material: 'Кирпич',
                    description: 'Кирпичный дом 220 м² в коттеджном посёлке.',
                    price_from: 6800000
                },
                {
                    name: 'Таунхаус "Зелёный квартал"',
                    address: 'г. Барнаул, ул. Зелёная, 42',
                    latitude: 53.33,
                    longitude: 83.78,
                    status: 'completed',
                    completion_date: '2023-12-20',
                    floors: 120,
                    material: 'Керамоблок',
                    description: 'Современный таунхаус 120 м² с террасой.',
                    price_from: 3800000
                }
            ]);
            console.log('✅ Добавлены тестовые объекты');
        }
        
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`✅ Сервер запущен на порту ${PORT}`);
            console.log(`👤 Админ-панель: http://localhost:${PORT}/admin/login`);
            console.log(`🔑 Логин: admin / Пароль: admin123\n`);
        });
    } catch (error) {
        console.error('❌ Ошибка:', error);
    }
}

initDatabase();