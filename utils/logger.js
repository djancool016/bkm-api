class Logger {
    constructor(message){
        this.message = message
        this.response = {
            message: this.message
        }
    }
    get log(){
        return this.response
    }
}

class StatusLogger extends Logger {
    constructor({code, message = ''}){
        super(message)
        this.code = code  
    }

    setStatus(){
        switch(this.code){
            case 200:
                this.status = true
                this.message = this.message || 'Ok'
                break
            case 201:
                this.status = true
                this.message = this.message || 'Created'
                break
            case 204:
                this.status = true
                this.message = this.message || 'No Content'
                break
            case 400:
                this.status = false
                this.message = this.message || 'Bad Request'
                break
            case 401:
                this.status = false
                this.message = this.message || 'Unauthorized'
                break
            case 403:
                this.status = false
                this.message = this.message || 'Forbidden'
                break
            case 404:
                this.status = false
                this.message = this.message || 'Not Found'
                break
            case 500:
                this.status = false
                this.message = this.message || 'Internal Server Error'
                break
            case 503:
                this.status = false
                this.message = this.message || 'Service Not Available'
                break
            case 504:
                this.status = false
                this.message = this.message || 'Geteway Timeout'
                break
            default:
                this.status = false
                this.message = this.message || 'Invalid Status Code'
                break
        }
    }

    setResponse(){
        this.response.status = this.status
        this.response.code = this.code
        this.response.message = this.message
    }

    get log(){
        this.setStatus()
        this.setResponse()
        return super.log
    }
}

class DataLogger extends StatusLogger {
    constructor({data, code, message = ''}){
        super(message)
        if(message != '') this.message = message
        this.data = data
        if(this.data && Object.keys(this.data).length !== 0){
            this.code = code || 200
            this.setResponse()
            this.response.data = this.data
        }else{
            this.code = 404
        }  
    }
}

module.exports = {Logger, StatusLogger, DataLogger}