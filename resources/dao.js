
const Sequelize = require('sequelize');
// Simple utility packages that I use.
let logging = require('../lib/logging');         // Should replace with Winston or similar.
let return_codes = require('./return_codes');      // Application standardized RCs.

// Generic class for accessing a table in MySQL.
let Dao = function(model) {

    self = this;                                        // JavaScript "this" can act weird.

    self.model = model;  

    self.retrieveById = function(ids, fields) {
        return new Promise(async function(resolve, reject) {
            try {
                let template = {};
                for (let col of self.collection.primaryKey) {
                    if (ids[col]){
                        template[col] = ids[col];
                    } else {
                        reject(`Missing column "${col}"in retrieveById`);
                    }
                }
                result = await self.retrieveByTemplate(template, fields);
                if (result) {
                    result = result[0];
                } else {
                    result = null;
                }
                resolve(result);
            } catch (err) {
                logging.debug_message("Error in Dao.retrieveById = " + err);
                reject(err);
            }
        });
    };


    // A template is a dictionary of the form (column_name: values). This function returns
    // all of the rows that match the template.
    //
    // TODO: Add support for pagination!
    //
    self.retrieveByTemplate = function(template, fields) {
        return new Promise(async function(resolve, reject) {
            try {
                await self.model.sync();
                // sequelize model findAll seems does not support wildcard attributes
                if (fields && fields.length == 1 && fields[0] == "*") {
                    fields = null
                }
                let retrieveInfo = {
                    where: template,
                    attributes: fields
                }
                result = await self.model.findAll(retrieveInfo);
                if (result) {
                    resolve(result);
                } else {
                    reject("Error in Dao.retrieveByTemplate");
                }
            } catch (err) {
                logging.debug_message("Error in Dao.retrieveByTemplate = " + err);
                reject(err);
            }
        });
    };


    // Ditto
    self.create = function(data, fields) {
        return new Promise(async function(resolve, reject) {
            try {
                await self.model.sync();
                result = await self.model.create(data, {fields: fields});
                console.log("Created = " + JSON.stringify(result))
                resolve(result);
            } catch (err) {
                logging.debug_message("Error in Dao.create = " + err);
                reject(err);
            }
        
        });
    };


    self.update = function(template, updates) {
        return new Promise(async function (resolve, reject) {
            try {
                await self.model.sync();
                result = await self.model.update(updates, {where: template});
                resolve(result);
            } catch (err) {
                logging.debug_message("Error in Dao.update = " + err);
                reject(err);
            }
        });
    };


    // Ditto.
    self.delete = function(template) {
        return new Promise(async function (resolve, reject) {
            try {
                await self.model.sync();
                result = await self.model.destroy({where: template});
                resolve(result);
            } catch (err) {
                logging.debug_message("Error in Dao.delete = " + err);
                reject(err);
            }
        });
    };


    self.customQ = function(q) {
        return new Promise(async function (resolve, reject) {
            try {
                result = await sequelize.query(q);
                resolve(result);
            } catch (err) {
                logging.debug_message("Error in Dao.customQ = " + err);
                reject(err);
            }
        });
    };

};


exports.Dao = Dao;
