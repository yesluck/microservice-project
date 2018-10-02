

let logging = require('../../lib/logging');
let Dao = require('../dao');


// Metadata that defines the collection.
let socialCollection = {
    identity: 'social_information',
    // datastore: 'default',
    primaryKey: 'id_provider',

    // CREATE TABLE `social_information` (
    //     `customers_id` varchar(12) NOT NULL,
    //     `social_provider` varchar(8) NOT NULL,
    //     `customers_id_social_provider` varchar(20) NOT NULL,
    //     `social_id` varchar(64) NOT NULL,
    //     `social_token` varchar(2048) NOT NULL,
    //     `tenant_id` varchar(16) NOT NULL,
    //     PRIMARY KEY (`customers_id_social_provider`),
    //     KEY (`social_id`),
    //     FOREIGN KEY(`customers_id`) 
    //     references customers(`customers_id`)
    //     on delete cascade
    //   ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

    attributes: {
        id: {type: 'string', required: true, columnName: 'customers_id'},
        provider: {type: 'string', required: true, columnName: 'social_provider'},
        id_provider: {type: 'string', required: true, columnName: 'customers_id_social_provider'},
        social_id: {type: 'string', required: true, columnName: 'social_id'},
        token: {type: 'string', required: true, columnName: 'social_token'},
        tenant_id: {type: 'string', required: true, columnName: 'tenant_id'}
    }
};


let SocialDAO = function() {

    // Make a DAO and initialize with the collection metadata.
    this.theDao = new Dao.Dao(socialCollection);

    let self = this;

    this.retrieveById = function(id,  fields, context) {

        // This is where we introduce multi-tenancy for data access.
        // We could have done in generic DAO but I wanted that to be focused just on Sails, Waterline and RDB.
        //
        // Convert and ID lookup to a template look up and add tenant_id from the context.
        let template = {[socialCollection.primaryKey]: id, "tenant_id": context.tenant,
            status: {"!=": "DELETED"}};


        return self.theDao.retrieveByTemplate(template, fields).then(
            function (result) {
                //logging.debug_message("Result = ", result);
                return result[0];
            }
        ).catch(function(error) {
            logging.debug_message("social_information_do.retrieveById: error = ", error);
        });
    };

    // Basically the same logic.
    this.retrieveByTemplate = function(tmpl, fields, context) {

        // Add tenant_id to template.
        tmpl.tenant_id = context.tenant;

        if (!tmpl.status) {
            tmpl.status = {"!=": "DELETED"}
        }

        return self.theDao.retrieveByTemplate(tmpl, fields).then(
            function(result) {
                // result = result.map(convertToDate);
                return result;
            }
        ).catch(function(error) {
            logging.debug_message("social_information_do.retrieveByTemplate: error = ", error);
        });
    };

    this.create = function(data, context) {

        return new Promise(function (resolve, reject) {
            // Add tenant_id to template.
            data.tenant_id = context.tenant;
            data.id_provider = data.id + data.provider;

            // NOTE: Business layer determines if the created customer's state is PENDING.
            // "Customer" may be an admin or being created manually through some admin tasl.


            self.theDao.create(data).then(
                function (result) {
                    if (result === undefined || result == null) {
                        result = {}
                    }
                    resolve(result);
                },
                function(error) {
                    logging.error_message("social_information_do.create: Error = ", error);
                    reject(error);
                })
                .catch(function(exc) {
                    logging.error_message("social_information_do.create: Exception = " + exc);
                    reject(exc);
                });
        });
    };

    // TODO: Need to figure out how to handle return codes, e.g. not found.
    // Will have to get row_count or do a findByTemplateFirst.
    self.update = function(template, fields, context) {

        return new Promise(function (resolve, reject) {
            // Add tenant_id to template.

            template.tenant_id = context.tenant;
            template.status = {"!=": "DELETED"}

            self.theDao.update(template, fields).then(
                function (result) {
                    if (result === undefined || result == null) {
                        result = {}
                    }
                    resolve({});
                },
                function(error) {
                    logging.error_message("social_information_do.update: Error = ", error);
                    reject(error);
                })
                .catch(function(exc) {
                    logging.error_message("social_information_do.update: Exception = " + exc);
                    reject(exc);
                });
        });

    };

    // TODO: Need to figure out how to handle return codes, e.g. not found.
    // Will have to get row_count or do a findByTemplateFirst.
    self.delete = function(template, context) {

        return new Promise(function (resolve, reject) {
            // Add tenant_id to template.
            template.tenant_id = context.tenant;

            let data = { status: "DELETED"};

            self.update(template, data, context).then(
                function (result) {
                    if (result === undefined || result == null) {
                        result = {}
                    }
                    resolve({})
                },
                function(error) {
                    logging.error_message("social_information_do: Error = ", error);
                    reject(error);
                })
                .catch(function(exc) {
                    logging.error_message("social_information_do: Exception = " + exc);
                    reject(exc);
                });
        });

    };

    // Custom function. Counts number of IDs matching a prefix.
    self.count_ids = function(prefix) {
        reject("Not implemented.");
    }
}


exports.SocialDAO = SocialDAO;
