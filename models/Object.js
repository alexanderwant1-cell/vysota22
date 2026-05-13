const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const ConstructionObject = sequelize.define('ConstructionObject', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: { notEmpty: true }
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: false,
        validate: { min: -90, max: 90 }
    },
    longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: false,
        validate: { min: -180, max: 180 }
    },
    status: {
        type: DataTypes.ENUM('planning', 'building', 'completed'),
        defaultValue: 'planning'
    },
    completion_date: {
        type: DataTypes.DATEONLY
    },
    floors: {
        type: DataTypes.INTEGER
    },
    material: {
        type: DataTypes.STRING(100)
    },
    description: {
        type: DataTypes.TEXT
    },
    preview_image: {
        type: DataTypes.STRING(255),
        defaultValue: 'default.jpg'
    },
    images_gallery: {
        type: DataTypes.TEXT,
        comment: 'JSON строка с массивом путей к фото'
    },
    price_from: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'construction_objects',
    timestamps: true
});

module.exports = ConstructionObject;
