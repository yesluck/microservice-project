
let env = {
    beanstalk: {
        host:  'microservice-e6156-mysql-db.cgsatnyccg2j.us-east-1.rds.amazonaws.com',
        port: 3306,
        adapter: 'db',
        url: `mysql://yl3786:lyh12280917@microservice-e6156-mysql-db.cgsatnyccg2j.us-east-1.rds.amazonaws.com:3306/mydb`
    },
    local: {
        host:  '127.0.0.1',
        port: 3306,
        adapter: 'db',
        url: 'mysql://root:password@127.0.0.1:3306/mydb'
    }
};

exports.getEnv = function(n) {
    return env[n];
};
