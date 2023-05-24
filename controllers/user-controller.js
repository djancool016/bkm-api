const {middlewareRequest} = require('./base-controller')
const { StatusLogger, DataLogger } = require('../utils')

function userAuth(req, res, next){
    let result = {
        id: 1,
        id_role: 1,
        name: "Dwi Julianto",
        phone: "6281123123123",
        email: "dwijulianto16@gmail.com"
    }
    req.user = new DataLogger({data: result}).log
    next()
}

module.exports = {
    auth: userAuth
}