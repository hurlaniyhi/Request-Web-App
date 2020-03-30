const mongoose = require('mongoose')

var feedbackSchema = new mongoose.Schema({
    username: {
        type: String
    },
    task: {
        type: String
    },
    status: {
        type: String
    }
    
})




mongoose.model('Feedback',feedbackSchema )