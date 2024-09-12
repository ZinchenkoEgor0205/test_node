
const {Sequelize, DataTypes} = require('sequelize');

const sequelize = new Sequelize('postgres', 'postgres', '8800', {
    host: 'localhost',    // database server address
    dialect: 'postgres',  // you can change this to 'mysql', 'sqlite', etc.
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();


module.exports = sequelize

