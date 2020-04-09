const express = require('express')
const mongoose = require('mongoose')
var logged = require('./middleware.js')


mongoose.set('useFindAndModify', false);
const User = mongoose.model('User')
const Inspector = mongoose.model('Inspector')
const Feedback = mongoose.model('Feedback')

var logged = function(req,res,next){
    //console.log(req.session.user)
   // req.session.user = req.body.username
    if(req.session.user){
        
        res.set({
            "Cache-Control": "no-store",
            "Pragma": "no-cache",
            "Expires": 0
        })
        next()
    }
    else{
        res.redirect('/')
    }
 }


const router = express.Router()


router.get('/', (req,res)=>{
    
    res.render("pages/signIn", {
        background: 'elena-koycheva-bGeupv246bM-unsplash.jpg', 
    })
    
})



router.get('/logout',logged,(req,res)=>{
    
    req.session.destroy(function(err){
        if(err){
            return next(err)
        }
        else{
            
            res.redirect('/')
        }
    })
   
})

router.post('/view', logged,(req,res)=>{
    
    Inspector.find({username: req.body.username}).lean().exec(function(err, docs){
      
        if (!err){
            
            res.render('pages/feedback',{
                background: "02Slider1.png",
                list: docs,
                name: req.body.username,
                password: req.body.password
                
            })
        
        }
        else{
            console.log("Error in retrieving request list :" + err)
        }
    })

})




router.get('/signup', (req,res)=>{
    
    res.render("pages/signUp", {
        background: 'elena-koycheva-bGeupv246bM-unsplash.jpg', 
    })
    
})

router.get('/adminTable',logged,(req,res)=>{
    
    Inspector.countDocuments({status: "Pending"}, function(err,penNumb){
        Inspector.countDocuments({status: "Completed"}, function(err,compNumb){
            
            Inspector.find({status: "Pending"}).lean().exec(function(err, docs){
                if (!err){
                    
                    res.render('pages/adminTable',{
                        list: docs,
                        background: "FeatureProductCopy2.png",
                        pending: penNumb,
                        completed: compNumb,
                        total: penNumb+compNumb
                    })
                }
                else{
                    console.log("Error in retrieving employee list :" + err)
                }
        }) 
        })
    })
        
})


router.post('/landpage',(req,res)=>{
    
    const {session} = req
    session.user = req.body.username
    session.save()
    
    res.set({
        "Cache-Control": "no-store",
        "Pragma": "no-cache",
        "Expires": 0
    })

    User.findOne({username: req.body.username, password: req.body.password},function(err, doc){
        
        if(doc){
            
            if(req.body.password == "ui123"){
                
                res.redirect('/adminTable')
            }
            else{
            res.render('pages/landingPage', {
                background: '02Slider1.png',
                name: doc.username,
                password: doc.password
            })
        }
        
        }
        else{
            console.log("Username and Password did not match")
            res.render('pages/signIn', {
                background: 'elena-koycheva-bGeupv246bM-unsplash.jpg',
                message: "Incorrect Password or Username" 
            })
        }
        
})

})

router.post('/signup',(req,res)=>{
    User.findOne({$or:[{username: req.body.username},{email: req.body.email}]},function(err, doc){
        
        
        if(doc){
            res.render('pages/signUp', {
                background: 'elena-koycheva-bGeupv246bM-unsplash.jpg',
                info: "User already exist",
                
            })
            console.log("user already exist")
        }
        else{
            insertRecord(req,res)
        }
        
})
})

function insertRecord(req,res){
    var user = new User();
    user.username = req.body.username
    user.password = req.body.password
    user.email = req.body.email
    user.unit = req.body.unit
    user.save((err, doc)=>{
        if (!err){
            console.log("user successfully created")
            res.redirect('/')
        }
        else{
            console.log("error occur during insertion")
        }
    }) 
}


router.get('/admintable/completed/:id', logged, (req,res)=>{
     
    Inspector.findOne({_id: req.params.id},function(err, doc){
        
        
        if(doc){

            Inspector.findByIdAndUpdate({_id: req.params.id}, {
                _id: doc._id,
                username: doc.username, 
                task: doc.task,
                request: doc.request,
                date: doc.date,
                status : "Completed",
                color : "green"
            }, 
            {new: true}, (err,doc)=>{

            if (!err){
            console.log("successfully updated")
            res.redirect('/adminTable')
            }
           else{
            console.log("error occur during update")
            }
        })
            
            
        }
        else{
            console.log('cannot find document in the database')
        }
        
})
    



})



router.get('/admintable/reject/:id', logged, (req,res)=>{
    if(req.session.user){
    Inspector.findOne({_id: req.params.id},function(err, doc){
        
        
        if(doc){

            Inspector.findByIdAndUpdate({_id: req.params.id}, {
                _id: doc._id,
                username: doc.username, 
                task: doc.task,
                request: doc.request,
                date: doc.date,
                status : "Rejected",
                color : "red"
            }, 
            {new: true}, (err,doc)=>{

            if (!err){
            console.log("successfully updated")
            res.redirect('/adminTable')
            }
           else{
            console.log("error occur during update")
            }
        })
            
            
        }
        else{
            console.log('cannot find document in the database')
        }
        
})
    
} else{
    res.render('pages/signIn', {
        background: 'elena-koycheva-bGeupv246bM-unsplash.jpg',
    })
}

})



router.post("/request", logged, (req,res)=>{

    
    User.findOne({username: req.body.username},function(err, doc){
        
        
        if(doc){
            res.render('pages/request', {
                background: '02Slider1.png',
                name: req.body.username,
                disp: "none",
                password: req.body.password
            })
            
        }
        else{
            console.log("the route did not exist : "+ err)
        }
        
})

})



router.post("/submitted", logged,(req,res)=>{
    
    insertRecord1(req,res)
    
})

function insertRecord1(req,res){
    var requestChange = req.body.request.replace(/\r?\n/g, '&lt;br&gt;')
    console.log(req.body)
    var inspector = new Inspector();
    inspector.username = req.body.username;
    inspector.task = req.body.task;
    inspector.request = requestChange;
    inspector.date = req.body.date,
    inspector.status = "Pending",
    inspector.color = "yellow",
    inspector.password = req.body.password
   console.log(inspector)
    inspector.save((err, doc)=>{
        if (!err){
            res.render('pages/request', {
                background: '02Slider1.png',
                name: req.body.username,
                comment: "Request has been sent",
                disp: "block",
                password: req.body.password
                
            })
            console.log("Request successfully sent")
        }
        else{
            console.log("error occur during insertion")
        }
    }) 
}


router.post("/delete",logged, (req,res)=>{
    console.log(req.body)
    Inspector.findByIdAndRemove(req.body.id, (err,doc)=>{
        if (!err){
            Inspector.find({username: req.body.username}).lean().exec(function(err, docs){
      
                if (!err){
                    
                    res.render('pages/feedback',{
                        background: "02Slider1.png",
                        list: docs,
                        name: req.body.username,
                        password: req.body.password
                        
                    })
                
                }
                else{
                    console.log("Error in retrieving request list :" + err)
                }
            })
        
        }
        else {
            console.log("Error while deleting record :" + err)
        }
    })
})



module.exports = router