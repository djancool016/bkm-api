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

module.exports = {titleCase, filterKeys}