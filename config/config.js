require('dotenv').config()

module.exports = {
    development: {
        username: "root",
        password: "1234",
        database: "db_bkm_api_development",
        host: "127.0.0.1",
        dialect: "mysql",
        logging: false
    },
    test: {
        username: "root",
        password: null,
        database: "db_bkm_api_test",
        host: "127.0.0.1",
        dialect: "sqlite",
        storage: "test.sqlite3"
    },
    production: {
        use_env_variable: "DB_PRODUCTION_URL_INTERNAL",
        dialect: "postgres",
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false
    },
    migration: {
        url: process.env.DB_PRODUCTION_URL_EXTERNAL,
        dialect: "postgres",
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false
    }
}