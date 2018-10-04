const Sequelize = require('sequelize');

let env = require('../env');   
let logging = require('../lib/logging');

// Ad hoc approach to getting information based on running local, beanstalk, etc.
// eb2_environment is the name of the environment variable.
let environment_name = process.env.eb2_environment || 'local';
logging.debug_message("environment_name = ", environment_name);

// Use the environment variable to get the information about DB conn based on environment.
let db_info = env.getEnv(environment_name)
logging.debug_message("s_env = ", db_info);


const sequelize = new Sequelize(
    db_info.database,
    db_info.username, 
    db_info.password, 
    db_info.options
);

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


exports.sequelize = sequelize;
exports.registerCollection = registerCollection;