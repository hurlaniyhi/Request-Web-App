const mongoose = require('mongoose')

var inspectorSchema = new mongoose.Schema({
    username: {
        type: String
    },
    task: {
        type: String
    },
    request: {
        type: String
    },
    date: {
        type: String
    },
    status: {
        type: String
    },
    color: {
        type: String
    }
})

mongoose.model('Inspector',inspectorSchema)