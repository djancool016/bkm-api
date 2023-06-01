module.exports = {
    input: {
        lkm: {
            create:{
                integer:['id'],
                string:['id_kelurahan', 'name', 'phone', 'address']
            },
            read:{
                integer:['id'],
                string:['id_kelurahan', 'name', 'phone', 'address'],
                boolean:['findLatest']
            },
            update:{
                integer:['id'],
                string:['id_kelurahan', 'name', 'phone', 'address']
            },
            destroy:{
                integer:['id']
            },
        }
    }
}