let sdo = require('./social_information_do');
let social_do = new sdo.SocialDAO();

social_do.create({
    id: "yulu68",
    provider: "google",
    social_id: "1",
    token: "1"
}, {
    tenant: 'E6156'
}).then((result) => {console.log('social on create: ', result)})
    .catch(err => {console.log('social on create err: ', err)})
