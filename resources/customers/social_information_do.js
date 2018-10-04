
const Sequelize = require('sequelize');

const logging = require('../../lib/logging');
const Dao = require('../dao');



// Metadata that defines the collection.
let socialCollection = {
    name: 'social',
    primaryKey: ['id', 'provider'],
    attribute: {
        id: {
            type: Sequelize.STRING, 
            allowNull: false, 
            field: 'customers_id', 
            primaryKey: true,
            references: {
                model: 'customer',
                key: 'customers_id'
            }
        },
        provider: {type: Sequelize.STRING, allowNull: false, field: 'social_provider', primaryKey: true},
        social_id: {type: Sequelize.STRING, allowNull: false, field: 'social_id'},
        token: {type: Sequelize.STRING, allowNull: false, field: 'social_token'},
        tenant_id: {type: Sequelize.STRING, allowNull: false, field: 'tenant_id'}
    }
};


let SocialDAO = function() {

    // Make a DAO and initialize with the collection metadata.
    this.theDao = new Dao.Dao(socialCollection);

    let self = this;

    this.retrieveById = async function(pk,  fields, context) {

        // This is where we introduce multi-tenancy for data access.
        // We could have done in generic DAO but I wanted that to be focused just on Sails, Waterline and RDB.
        //
        // Convert and ID lookup to a template look up and add tenant_id from the context.

        if (!pk['id'] || !pk['provider']) {
            console.log("Error: At least one column missing in primary key.");
            return null;
        }

        let template = {
            id: pk['id'],
            provider: pk['provider'],
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
                console.log("Cannot find the record with given key.");
            }
            return result;
        } catch(err) {
            logging.debug_message("SocialDAO.retrieveById: error = ", error);
        }

    };

    // Basically the same logic.
    this.retrieveByTemplate = async function(template, fields, context) {

        // Add tenant_id to template.
        template.tenant_id = context.tenant;

        if (!template.status) {
            template.status = {
                [Sequelize.Op.ne]: "DELETED"
            }
        }

        try {
            result = await self.theDao.retrieveByTemplate(template, fields);
            return result;
        } catch(err) {
            logging.debug_message("SocialDAO.retrieveByTemplate: error = ", error);
        }
    };


    this.create = function(data, context) {

        return new Promise(async function (resolve, reject) {
            // Add tenant_id to template.
            data.tenant_id = context.tenant;

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
                logging.error_message("socialInfoDo.create: Error = ", error);
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
                logging.error_message("socialInfoDo.update: Error = ", error);
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
                logging.error_message("socialInfoDo.delete: Error = ", error);
                reject(err);
            };

        });
    };

    // Custom function. Counts number of IDs matching a prefix.
    self.count_ids = function(prefix) {
        reject("Not implemented.");
    }
}


exports.SocialDAO = SocialDAO;
