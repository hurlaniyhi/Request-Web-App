require('./models/db.js');
const express = require('express')
const app = express()
const myRoute = require('./handlers/controller.js')
const path = require('path')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const connectMongo = require('connect-mongo')
const session = require('express-session')
const MongoStore = connectMongo(session)
var port = process.env.PORT || 3030

app.use(bodyParser.urlencoded({extended: true})) 
app.use(bodyParser.json())
app.use(session({
    secret: "let save this",
    resave: false, 
    saveUninitialized: true,
    store: new MongoStore({
        collection: "session",
        mongooseConnection: mongoose.connection
    })
}))

app.use(express.static(path.join(__dirname,"asset")))
app.set('views',path.join(__dirname, "/views/"))
app.engine('hbs',exphbs({extname: 'hbs', defaultLayout: 'mainLayout', layoutsDir: __dirname + '/views/layouts'}))
app.set('view engine', 'hbs')



 app.use('/', myRoute)


app.listen(port,()=>{
    console.log("server is running on port 3030")
})