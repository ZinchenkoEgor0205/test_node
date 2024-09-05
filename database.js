
const {Sequelize, DataTypes} = require('sequelize');

// Create a Sequelize instance
const sequelize = new Sequelize('postgres', 'postgres', '8800', {
    host: 'localhost',    // database server address
    dialect: 'postgres',  // you can change this to 'mysql', 'sqlite', etc.
});

// Test the connection
(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();


module.exports = sequelize

