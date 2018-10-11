let sdo = require('./socialsdo');
let social_do = new sdo.SocialDAO();

social_do.create({
    id: "yulu20",
    provider: "google",
    social_id: "1",
    token: "1"
}, {
    tenant: 'E6156'
}).then((result) => {console.log('social on create: ', JSON.stringify(result))})
    .catch(err => {console.log('social on create err: ', err)})
