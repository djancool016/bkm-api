const {DateFormat} = require('./dateFormat')

function titleCase(str) {
    return str.toLowerCase().split(' ').map(function(word) {
        return word.replace(word[0], word[0].toUpperCase());
    }).join(' ');
}

function filterKeys(allowed, object){
    return Object.keys(object)
        .filter(key => allowed.includes(key))
        .reduce((obj, key) => { 
            obj[key] = object[key]
            return obj
        }, {})
}

function dateToCode(date){
    let d = new DateFormat(date).toISOString(isTime = false)
    return d.replace(/-/g, "").slice(2)
}

module.exports = {titleCase, filterKeys, dateToCode}