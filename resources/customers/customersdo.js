
const Sequelize = require('sequelize');

const logging = require('../../lib/logging');
const Dao = require('../dao');
const sandh = require('../../lib/salthash');

// Metadata that defines the collection.
const customersCollection = {
    name: "customers",
    primaryKey: ["id"],
    attribute: {
        id: {type: Sequelize.STRING, allowNull: false, field: 'customers_id', primaryKey: true},
        email: {type: Sequelize.STRING, allowNull: false, field: "customers_email", unique:true},
        status: {type: Sequelize.ENUM('ACTIVE','PENDING','DELETED','SUSPENDED','LOCKED'), allowNull: false, field: 'customers_status'},
        firstName: {type: Sequelize.STRING, allowNull: false, field: 'customers_firstname'},
        lastName: {type: Sequelize.STRING, allowNull: false, field: 'customers_lastname'},
        pw: {type: Sequelize.STRING, allowNull: false, field: 'customers_password'},
        last_login: {type: Sequelize.DATE, allowNull: false, field: 'customers_last_login'},
        created: {type: Sequelize.DATE, allowNull: false, field: 'customers_created'},
        modified: {type: Sequelize.DATE, allowNull: false, field: 'customers_modified'},
        tenant_id: {type: Sequelize.STRING, allowNull: false, field: 'tenant_id'}
    },
    options: {
        timestamps: false
    }
};


let CustomersDAO = function() {

    // Make a DAO and initialize with the collection metadata.
    this.theDao = new Dao.Dao(customersCollection);

    let self = this;

    this.retrieveById = function(id,  fields, context) {

        // This is where we introduce multi-tenancy for data access.
        // We could have done in generic DAO but I wanted that to be focused just on Sails, Waterline and RDB.
        //
        // Convert and ID lookup to a template look up and add tenant_id from the context.
        return new Promise(async function (resolve, reject) {
            let template = {
                id: id,
                tenant_id: context.tenant,
                status: {
                    [Sequelize.Op.ne]: "DELETED"
                }
            };
    
            try {
                result = await self.theDao.retrieveByTemplate(template, fields);
                if (result) {
                    result = result[0];
                } else {
                    console.log("Cannot find the record with given id.");
                    result = null;
                }
                resolve(result);
            } catch(err) {
                logging.debug_message("PeopleDAO.retrieveById: error = ", err);
                reject(err);
            }
        });
    };


    // Basically the same logic.
    this.retrieveByTemplate = function(template, fields, context) {

        return new Promise(async function (resolve, reject) {
            // Add tenant_id to template.
            template.tenant_id = context.tenant;

            if (!template.status) {
                template.status = {
                    [Sequelize.Op.ne]: "DELETED"
                }
            }

            try {
                result = await self.theDao.retrieveByTemplate(template, fields);
                resolve(result);
            } catch(err) {
                logging.debug_message("PeopleDAO.retrieveByTemplate: error = ", err);
                reject(err);
            }
        });
    };



    this.create = function(data, context) {

        return new Promise(async function (resolve, reject) {
            // Add tenant_id to template.
            data.tenant_id = context.tenant;
            data.last_login = new Date();
            data.created = new Date();
            data.modified = new Date();

            // DO NOT STORE UNENCRYPTED PWs.
            data.pw = sandh.saltAndHash(data.pw);

            // NOTE: Business layer determines if the created customer's state is PENDING.
            // "Customer" may be an admin or being created manually through some admin tasl.

            try {
                result = await self.theDao.create(data);
                if (result === undefined || result == null) {
                    result = {}
                }
                console.log("Record created: " + result);
                resolve(result);
            } catch (err) {
                logging.error_message("customersdo.create: Error = ", err);
                reject(err);
            };

        });
    };

    // TODO: Need to figure out how to handle return codes, e.g. not found.
    // Will have to get row_count or do a findByTemplateFirst.
    self.update = function(template, fields, context) {

        return new Promise(async function (resolve, reject) {
            // Add tenant_id to template.
            template.tenant_id = context.tenant;
            template.status = {[Sequelize.Op.ne]: "DELETED"};

            try {
                result = await self.theDao.update(template, fields);
                if (result === undefined || result == null) {
                    result = {}
                }
                console.log("Records updated: " + result);
                resolve(result);
            } catch (err) {
                logging.error_message("customersdo.update: Error = ", err);
                reject(err);
            };

        });

    };

    // TODO: Need to figure out how to handle return codes, e.g. not found.
    // Will have to get row_count or do a findByTemplateFirst.
    self.delete = function(template, context) {

        return new Promise(async function (resolve, reject) {

            let data = { status: "DELETED"};

            try {
                result = await self.update(template, data, context);
                console.log("Records deleted: " + result);
                resolve(result);
            } catch (err) {
                logging.error_message("customersdo.delete: Error = ", err);
                reject(err);
            };

        });

    };

    // Custom function. Counts number of IDs matching a prefix.
    self.count_ids = function(prefix) {
        reject("Not implemented.");
    }
}


exports.CustomersDAO = CustomersDAO;
