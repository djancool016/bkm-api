const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const PORT = process.env.PORT || 5100

app.use(bodyParser.json())
app.use('/', require('./routes'))

app.listen(PORT, () => console.log(`This server is running on port: http://localhost:${PORT}`))