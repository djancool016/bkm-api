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
                boolean:['isFirstLedger'],
                date: ['loan_start']
            },
            creates:{
                array:['loans']
            },
            read:{
                integer:['id', 'id_ksm', 'id_loan', 'id_account','id_lkm'],
                boolean:['findLatest','is_finish'],
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
                integer:['id_type','id_lkm','total'],
                date: ['trans_date'],
                string: ['remark'],
                notnull: ['id_type','id_lkm','total']
            },
            creates:{
                array:['transactions'],
                nonull:['transactions']
            },
            read:{
                integer:['id', 'id_coa', 'id_account','id_register','id_lkm'],
                boolean:['findLatest'],
                date: ['start_date','end_date'],
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
                integer:['id_loan','id_type','id_lkm','total'],
                date: ['trans_date'],
                string: ['remark','url'],
                notnull: ['id_loan','id_type','id_lkm','total']
            },
            creates:{
                array:['transactionLoans'],
                nonull:['transactionLoans']
            },
            read:{
                integer:['id', 'id_transaction', 'id_loan','id_ksm', 'id_lkm'],
                string:['trans_code'],
                date:['start_date', 'end_date']
            }
        },
        transactionBop: {
            create:{
                integer:['id_loan','id_type','id_lkm','total'],
                date: ['trans_date'],
                string: ['remark','url'],
                notnull: ['id_loan','id_type','id_lkm','total']
            },
            creates:{
                array:['transactionBops'],
                nonull:['transactionBops']
            },
            read:{
                integer:['id', 'id_transaction', 'id_loan','id_ksm'],
                string:['trans_code']
            }
        },
        transactionLIB: {
            create:{
                integer:['id_loan','id_lkm','pay_loan','pay_interest','pay_bop'],
                date: ['trans_date'],
                string: ['remark'],
                boolean: ['isFirstLedger'],
                notnull: ['id_loan','id_lkm']
            },
            creates:{
                array:['transactionLIBs'],
                nonull:['transactionLIBs']
            }
        },
        loanPayment: {
            read:{
                integer:['id_loan'],
                date:['end_date']
            } 
        },
        report: {
            loan:{
                date:['id_lkm','start_date','end_date']
            },
            prototype:{
                integer:['year','month','id_lkm']
            }
        }
    }
}