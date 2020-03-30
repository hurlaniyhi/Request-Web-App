require('./models/db.js');
const express = require('express')
const app = express()
const myRoute = require('./handlers/routers.js')
const path = require('path')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
var port = process.env.PORT || 3030

app.use(bodyParser.urlencoded({extended: true})) //reads what you post(url encoded data)
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname,"asset")))
app.set('views',path.join(__dirname, "/views/"))
app.engine('hbs',exphbs({extname: 'hbs', defaultLayout: 'mainLayout', layoutsDir: __dirname + '/views/layouts'}))
app.set('view engine', 'hbs')

app.use('/',myRoute)

app.listen(port,()=>{
    console.log("server is running on port 3030")
})