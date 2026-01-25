const { Sequelize, DataTypes } = require('sequelize');
const config = require('./config');

const environment = process.env.NODE_ENV || 'development';
const sequelize = new Sequelize(config[environment]);

const Article = require('./models/article')(sequelize, DataTypes);

module.exports = {
  sequelize,
  Article,
};
