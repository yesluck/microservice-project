const Sequelize = require('sequelize');

const db = require('../db');

// Metadata that defines the collection.
const customersCollection = {
    name: "customer",
    primaryKey: ["id"],
    attribute: {
        id: {type: Sequelize.STRING, allowNull: false, field: 'customers_id', primaryKey: true},
        email: {type: Sequelize.STRING, allowNull: false, field: "customers_email", unique: true},
        lastName: {type: Sequelize.STRING, allowNull: false, field: 'customers_lastname'},
        firstName: {type: Sequelize.STRING, allowNull: false, field: 'customers_firstname'},
        status: {type: Sequelize.ENUM('ACTIVE','PENDING','DELETED','SUSPENDED','LOCKED'), allowNull: false, field: 'customers_status'},
        pw: {type: Sequelize.STRING, allowNull: false, field: 'customers_password'},
        last_login: {type: Sequelize.DATE, allowNull: false, field: 'customers_last_login'},
        tenant_id: {type: Sequelize.STRING, allowNull: false, field: 'tenant_id'}
    }
};

const Customer = db.registerCollection(customersCollection);

exports.Customer = Customer;