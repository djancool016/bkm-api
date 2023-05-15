class DateFormat {
    constructor(date){
        this.date = date? new Date(date) : new Date()
    }

    toLocaleString(isTime = false, language = 'id'){
        if(isNaN(this.date.valueOf())) return 'Invalid date'
        let options = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        }
        if(isTime){
            options.hour = "numeric"
            options.minute = "numeric"
        }
        return this.date.toLocaleDateString(language, options)
    }
    
    toISOString(isTime = false){
        if(isNaN(this.date.valueOf())) return 'Invalid date'
        if(isTime) return this.date.toISOString()
        return this.date.toISOString().substring(0, 10)
    }
    /**
     *  @param {date} date_end
     */
    diffDays(date_end){
        if(isNaN(this.date.valueOf())) return 'Invalid date'
        let diff_time = new Date(date_end).getTime() - this.date.getTime()
        let diff_days = diff_time / (1000 * 3600 * 24)
        return diff_days
    }

    /**
     *  @param {number} days
     */
    set addDays(days){
        this.date.setDate(this.date.getDate() + days)
    }
    /**
     *  @param {number} months
     */
    set addMonths(months){
        this.date.setMonth(this.date.getMonth() + months)
    }
    /**
     *  @param {number} years
     */
    set addYears(years){
        this.date.setFullYear(this.date.getFullYear() + years)
    }
    /**
     *  @param {number} hours
     */
    set addHours(hours){
        this.date.setHours(this.date.getHours() + hours)
    }
    /**
     *  @param {number} minutes
     */
    set addMinutes(minutes){
        this.date.setMinutes(this.date.getMinutes() + minutes)
    }
}

module.exports = {DateFormat}