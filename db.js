const {Sequelize} = require('sequelize')

module.exports = new Sequelize(
    'database',
    'viktor',
    'root',
    {
        host: '90.156.157.220',
        port: '5432',
        dialect: 'postgres'
    }
)