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
        },
        ksm: {
            create:{
                integer:['id','id_lkm', 'rw'],
                string:['name']
            },
            creates:{
                array:['ksms']
            },
            read:{
                integer:['id', 'id_ksm', 'id_lkm'],
                string:['name'],
                boolean:['findLatest'],
                array:['ksmIds']
            },
            update:{
                integer:['id', 'rw','id_lkm'],
                string:['name']
            },
            destroy:{
                integer:['id']
            },
        },
        coa: {
            create:{
                integer:['id_register','id_account'],
                string:['description']
            },
            read:{
                integer:['id', 'id_register', 'id_account'],
                boolean:['findLatest'],
                array:['coaIds']
            },
            update:{
                integer:['id','id_register','id_account'],
                string:['description']
            },
            destroy:{
                integer:['id']
            },
        },
        loan: {
            create:{
                integer:['id','id_ksm','total_loan','loan_duration','loan_interest'],
                date: ['loan_start']
            },
            creates:{
                array:['loans']
            },
            read:{
                integer:['id', 'id_loan', 'id_account','id_lkm'],
                boolean:['findLatest'],
                string:['ksm_name'],
                array:['ksmIds','loanIds']
            },
            update:{
                integer:['id_loan','id_ksm','total_loan','loan_duration','loan_interest'],
                notnull:['id_loan']
            },
            destroy:{
                integer:['id'],
                notnull:['id']
            },
        },
        transaction: {
            create:{
                integer:['id_coa','id_lkm','total'],
                date: ['trans_date'],
                string: ['remark'],
                notnull: ['id_coa','id_lkm','total']
            },
            creates:{
                array:['transactions'],
                nonull:['transactions']
            },
            read:{
                integer:['id', 'id_coa', 'id_account','id_register'],
                boolean:['findLatest'],
                string:['trans_code'],
                array:['transactionIds']
            },
            update:{
                integer:['id','id_coa', 'total'],
                string:['remark'],
                date:['trans_date'],
                notnull:['id']
            },
            destroy:{
                integer:['id'],
                notnull:['id']
            },
        },
        transactionLoan: {
            create:{
                integer:['id_loan','id_coa','id_lkm','total'],
                date: ['trans_date'],
                string: ['remark'],
                notnull: ['id_loan','id_coa','id_lkm','total']
            },
            creates:{
                array:['transactionLoans'],
                nonull:['transactionLoans']
            },
            read:{
                integer:['id', 'id_transaction', 'id_loan','id_ksm'],
                string:['trans_code']
            }
        },
        loanPayment: {
            read:{
                integer:['id_loan']
            } 
        }
    }
}