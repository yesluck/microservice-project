
const Sequelize = require('sequelize');

// Simple utility packages that I use.
let logging = require('../lib/logging');         // Should replace with Winston or similar.
let env = require('../env');                     // Simple config info based on an environment variable.
let return_codes = require('./return_codes');      // Application standardized RCs.

// Ad hoc approach to getting information based on running local, beanstalk, etc.
// eb2_environment is the name of the environment variable.
// let environment_name = process.env.eb2_environment || 'local';
// logging.debug_message("environment_name = ", environment_name);

// // Use the environment variable to get the information about DB conn based on environment.
// let db_info = env.getEnv(environment_name)
// logging.debug_message("s_env = ", db_info);


// const sequelize = new Sequelize(
//     db_info.database,
//     db_info.username, 
//     db_info.password, 
//     db_info.options
// );
const sequelize = require('./db').sequelize;


const registerCollection = function(c) {
    let attrs = {};
    for (let key in c.attribute) {
        let value = c.attribute[key];
        if (typeof value === 'object' && value['type']) {
            value.allowNull = value.allowNull || false;
            attrs[key] = value;
        } else {
            attrs[key] = {
                type: value,
                allowNull: false
            };
        }
    }
    let model = sequelize.define(
        c.name,
        attrs,
        c.options
    );
    return model;
};


// I want to isolate high layer, external code from the fact that the underlying DB is MySQL.
// This module maps MySQL specific error codes to a generic set that all DAOs will implement,
// independently of the underlying database engine.
//
// Obviously, I have not rigorously figured out the DAO exceptions, the MySQL errors and the mapping.
// But, you get the idea.
//
// let mapError = function(e) {

//     let mapped_error = {};

//     switch(e.code) {

//         case "E_UNIQUE": {
//             mapped_error = return_codes.codes.uniqueness_violation;
//             break;
//         }

//         default: {
//             mapped_error = return_codes.codes.unknown_error;
//             break;
//         }

//     }

//     return mapped_error;
// };


// Generic class for accessing a table in MySQL.
let Dao = function(collection) {

    self = this;                                        // JavaScript "this" can act weird.

    self.collection = collection;                       // Configuration information.

    self.model = registerCollection(this.collection);  // Register config information with Waterline.


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
                console.log(JSON.stringify(retrieveInfo));
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
                if (result) {
                    resolve(result);
                } else {
                    reject("Error in Dao.create");
                }
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
