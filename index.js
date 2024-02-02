var express = require('express')
var cors = require('cors')
require('dotenv').config()
var app = express()
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('server running')
})

app.listen(port, () => {
    console.log(port);
})