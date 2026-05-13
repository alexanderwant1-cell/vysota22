const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    role: {
        type: DataTypes.STRING(20),
        defaultValue: 'admin'
    }
}, {
    tableName: 'users',
    timestamps: false
});

User.prototype.checkPassword = async function(password) {
    return await bcrypt.compare(password, this.password_hash);
};

module.exports = User;