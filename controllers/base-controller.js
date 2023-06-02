const {DateFormat, StatusLogger, DataLogger, filterKeys} = require('../utils')
const axios = require('axios')

class RequestValidator {
    constructor(req, res, allowedKey, keyValidation = false) {
        this.req = req
        this.res = res
        this.allowedKey = allowedKey
        this.keyValidation = keyValidation
    }

    /**
     * @param {object} allowedKey
     */
    set setAllowedKey(allowedKey){
        this.allowedKey = allowedKey
    }

    /**
     * @param {object} req
     */
    set setRequest(req){
        this.req = req
    }

    /**
     * @param {object} res
     */
    set setResponse(res){
        this.res = res
    }

    get #validateKey(){
        // cleaning allowed key into an array
        let combinedAllowedKey = Object.values(this.allowedKey).flat(Infinity)
        let keys = Object.keys(this.req)

        if(this.keyValidation){
            // return true if request keys is valid
            for(let i = 0; i < keys.length; i++){
                let validKey = combinedAllowedKey.includes(keys[i])
                if(validKey == false){
                    this.message = `${keys[i]} is invalid key`
                    return false
                }
            }
        }
        return true
    }

    get #validateValue(){
        // return true if data type value is same as allowed key
        for(let [key, val] of Object.entries(this.allowedKey)) {

            let filteredKey = filterKeys(val, this.req)
        
            // integer validator
            if (key == 'integer'){
                for(let [k, v] of Object.entries(filteredKey)){
                    if(isNaN(v)){
                        this.message = `${k} is not a number`
                        return false
                    }
                }
            }
            // boolean validator
            else if (key == 'boolean'){
                for(let [k, v] of Object.entries(filteredKey)){
                    if(v == 1 || v == 0) return true
                    if(typeof(v) != 'boolean'){
                        this.message = `${k} is not a boolean`
                        return false
                    }
                }
            }
            // date validator
            else if (key == 'date'){
                for(let [k, v] of Object.entries(filteredKey)){
                    let date = new DateFormat(v).toISOString()
                    if(date === 'Invalid date'){
                        this.message = `${k} is invalid date`
                        return false
                    }
                }
            }
            // array validator
            else if (key == 'array'){
                for(let [k, v] of Object.entries(filteredKey)){
                    if(Array.isArray(v) == false){
                        this.message = `${k} is not an array`
                        return false
                    }
                }
            }
            // not null validator
            else if (key == 'notnull'){
                for(let [k, v] of Object.entries(filteredKey)){
                    if(!v){
                        this.message = `${k} is undefined`
                        return false
                    }
                }
            }
        }
        return true
    }
    
    get validate(){
        // validate key and value then returning status logger (json)
        if((this.#validateKey && this.#validateValue) || Object.keys(this.req).length === 0) {
            return new StatusLogger({code: 200}).log
        }
        return new StatusLogger({code: 400, message: this.message}).log
    }

    get sendResponse(){
        // if request key and value is valid return nothing, else stop all request then send error response
        return this.validate
    }
}

class BaseController {
    constructor(req, res, factory){
        this.factory = factory
        this.req = req
        this.res = res
    }

    /**
     * @param {any} factory - instace of factory
     */
    set setFactory(factory){
        this.factory = factory
    }

    async getResult(){
        // get result as an object
        try {
            this.result = await this.factory
            return this.result
        } catch (error) {
            this.result = {
                code: 500,
                message: 'Internal Server Error'
            }
            console.log(error)
            return this.result
        }
    }

    async sendRequest(){
        // get result as a response
        try {
            if(!this.result) this.result = await this.getResult()
            this.res.status(this.result.code).json(this.result)

        } catch (error) {
            console.log(error)
            this.res.status(500).json({
                code: 500,
                message: 'Internal Server Error'
            })
        }
    }
}

function authorizeUser(req, allowedRole = []){

    // req.user is first middleware for every route, for user authentication
    let user = req.user
    let {status, data:{id_role}} = user
    if(status == false) return user

    // authorize user based on allowedRole
    let isAuthorize = allowedRole.filter(roleId => {
        return Number(roleId) == Number(id_role)
    }).length

    if(isAuthorize > 0) return new StatusLogger({code: 200, message:'User Authorized'}).log
    return new StatusLogger({code: 403}).log
}

async function middlewareRequest(req, res, model){
    // Send request using BaseController
    let controller = new BaseController(req, res, model)
    let result = await controller.getResult()
    return result
}

async function bulkRequest(array, url){

    try {

        let okResponse = []
        let badResponse = []

        //make bulk request
        let requests = array.map( data => axios.post(url, data))

        const responses = await Promise.allSettled(requests)

        responses.forEach( response => {
            if (response.status === 'fulfilled') okResponse.push(response.value.data)
            else badResponse.push(response.reason.response.data)
        })

        let response = new DataLogger({
            data: {okResponse},
            code: 200,
            message: `All ${okResponse.length} requests is proceed`
        }).log

        if(badResponse.length > 0 && okResponse > 0){
            response.data = {okResponse, badResponse},
            response.message = `${okResponse.length} requests is proceed, ${badResponse.length} requests is failed to process`
            response.code = 200
            return response
        }

        if(okResponse.length > 0){
            return response
        }

        return new DataLogger({
            data: {badResponse},
            code: 400,
            message: `All ${badResponse.length} requests failed to process`
        }).log  

    } catch (error) {

        console.error('An error occurred:', error.message);
        new StatusLogger({
            code: 500,
            message: 'Internal Server Error'
        })
    }
}

async function validator(req, res, next, allowedKey = {}){
    // Validate request input body
    let validator = new RequestValidator(req.body, res, allowedKey, true).sendResponse
    if(validator.status == false) return res.status(validator.code).json(validator)

    req.result = new StatusLogger({code: 200, message: 'input validated'}).log
    next()
}

async function authorize(req, res, next, allowedRole = []){
    // Authorize user based on roles
    let authorize = authorizeUser(req, allowedRole)
    if(authorize.status == false) return res.status(authorize.code).json(authorize)

    req.result = new StatusLogger({code: 200, message: 'user authorized'}).log
    next()
}

async function endRequest(req, res){

    // this is for last middleware, returning http response
    let result = await req.result
    if(result.badRequest) result.badRequest = req.badRequest
    return res.status(result.code).json(result)
}

module.exports = {BaseController, RequestValidator, middlewareRequest, bulkRequest, validator, authorize, endRequest}