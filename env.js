
let env = {
    // beanstalk: {
    //     host:  'microservice-e6156-mysql-db.cgsatnyccg2j.us-east-1.rds.amazonaws.com',
    //     port: 3306,
    //     adapter: 'db',
    //     url: `mysql://yl3786:lyh12280917@microservice-e6156-mysql-db.cgsatnyccg2j.us-east-1.rds.amazonaws.com:3306/mydb`
    // },
    local: {
        database: 'sequelize_test',
        username: 'root',
        password: 'password',
        options: {
            host:  '127.0.0.1',
            port: 3306,
            dialect: 'mysql',
            operatorsAliases: false,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        }
        
    }
};

exports.getEnv = function(n) {
    return env[n];
};
