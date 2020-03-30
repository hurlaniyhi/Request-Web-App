const express = require('express')
const mongoose = require('mongoose')

mongoose.set('useFindAndModify', false);
const User = mongoose.model('User')
const Inspector = mongoose.model('Inspector')
const Feedback = mongoose.model('Feedback')

const router = express.Router()


router.get('/',(req,res)=>{
    res.render("pages/signIn", {
        background: 'elena-koycheva-bGeupv246bM-unsplash.jpg', 
    })
})

router.post('/view', (req,res)=>{
    Feedback.find({username: req.body.username}).lean().exec(function(err, docs){
      
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




router.get('/signup',(req,res)=>{
    res.render("pages/signUp", {
        background: 'elena-koycheva-bGeupv246bM-unsplash.jpg', 
    })
})

router.get('/adminTable',(req,res)=>{
    Inspector.countDocuments({}, function(err,penNumb){
        Feedback.countDocuments({status: "Completed"}, function(err,compNumb){
            
            Inspector.find({}).lean().exec(function(err, docs){
                if (!err){
                    console.log(docs)
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
    User.findOne({username: req.body.username},function(err, doc){
        
        
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


router.get('/admintable/accept/:id', (req,res)=>{
    Feedback.find({_id: req.params.id}).lean().exec(function(err, result){
        if(!result){
     
    Inspector.findOne({_id: req.params.id},function(err, doc){
        console.log(doc)
        
        if(doc){

            var feedback = new Feedback();
            feedback.username = doc.username
            feedback.task = doc.task
            feedback.status = "Pending"
            console.log(feedback)
            feedback.save((err, docs)=>{
            if (!err){
            console.log("successfully posted for feedback")
            res.redirect('/adminTable')
            }
           else{
            console.log("error occur during insertion")
            }
    }) 
            
            
        }
        else{
            console.log('cannot find document in the data base')
        }
        
})
    }
  else{
      console.log("ID already exist in the feedback database")
      res.redirect('/adminTable')
  }
})
})



router.get('/admintable/reject/:id', (req,res)=>{
    Feedback.findOne({_id: req.params.id},function(err, result){
    if(!result){
    Inspector.findOne({_id: req.params.id},function(err, doc){
        console.log(doc)
        
        if(doc){

            var feedback = new Feedback();
            feedback.username = doc.username
            feedback.task = doc.task
            feedback.status = "Rejected"
            console.log(feedback)
            feedback.save((err, docs)=>{
            if (!err){
            console.log("successfully posted for feedback")
            Inspector.findByIdAndRemove(req.params.id, (err,remres)=>{
                if (!err){
                    res.redirect("/adminTable")
                }
                else {
                    console.log("Error while deleting record :" + err)
                }
            })
            }
           else{
            console.log("error occur during insertion")
            }
    }) 
            
        }
        else{
            console.log('cannot find document in the data base')
        }
        
})
    
   

    }
    


    else{
        console.log("not possible to exist in the feedback database")
    }
    
    })
})

router.get('/admintable/completed/:id', (req,res)=>{
    Feedback.findOne({_id: req.params.id},function(err, result){
        if(!result){
        Inspector.findOne({_id: req.params.id},function(err, doc){
            console.log(doc)
            
            if(doc){
    
                var feedback = new Feedback();
                feedback.username = doc.username
                feedback.task = doc.task
                feedback.status = "Completed"
                console.log(feedback)
                feedback.save((err, docs)=>{
                if (!err){
                console.log("successfully posted for feedback")
                Inspector.findByIdAndRemove(req.params.id, (err,remres)=>{
                    if (!err){
                        res.redirect("/adminTable")
                    }
                    else {
                        console.log("Error while deleting record :" + err)
                    }
                })
                }
               else{
                console.log("error occur during insertion")
                }
        }) 
                
            }
            else{
                console.log('cannot find document in the data base')
            }
            
    })
        
       
        }
    
        else{
            console.log("not possible to exist in the feedback database")
        }
        
        })
})


router.post("/request",(req,res)=>{
    User.findOne({username: req.body.username},function(err, doc){
        
        
        if(doc){
            res.render('pages/request', {
                background: '02Slider1.png',
                name: req.body.username,
                note1: "Do you know we can help you with",
                note2: "all your creatives.",
                note3: "Why not tell us in the request box",
                note4: "what you want",
                password: req.body.password
            })
            
        }
        else{
            console.log("the route did not exist : "+ err)
        }
        
})
})



router.post("/submitted", (req,res)=>{
    insertRecord1(req,res)
})

function insertRecord1(req,res){
    console.log(req.body)
    var inspector = new Inspector();
    inspector.username = req.body.username;
    inspector.task = req.body.task;
    inspector.request = req.body.request;
    inspector.date = req.body.date
   console.log(inspector)
    inspector.save((err, doc)=>{
        if (!err){
            res.render('pages/request', {
                background: '02Slider1.png',
                name: req.body.username,
                note2: "Request has been sent",
                password: req.body.password
                
            })
            console.log("Request successfully sent")
        }
        else{
            console.log("error occur during insertion")
        }
    }) 
}


router.post('/request/feedback', (req,res)=>{
    Feedback.find({username: req.body.link}).lean().exec(function(err, docs){
      
        if (!err){
            
            res.render('pages/feedback',{
                background: "02Slider1.png",
                list: docs,
                
            })
        
        }
        else{
            console.log("Error in retrieving request list :" + err)
        }
    })
})





module.exports = router