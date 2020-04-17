const express = require('express')
const mongoose = require('mongoose')
const nodemailer = require('nodemailer')
const crypto = require("crypto")
const multer = require('multer')
const path = require("path")
const jwt = require('jsonwebtoken')
const GridFsStorage = require("multer-gridfs-storage")
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
//var logged = require('./middleware.js')
//const fs = require('fs')
//const path = require('path');


mongoose.set('useFindAndModify', false);
const User = mongoose.model('User')
const Inspector = mongoose.model('Inspector')
const router = express.Router()

let minisave = []

const mongoURI = "mongodb+srv://ridwan:ridwan526@ridwanlock-uqlxu.mongodb.net/test?retryWrites=true&w=majority";
// mongodb+srv://ridwan:ridwan526@ridwanlock-uqlxu.mongodb.net/test?retryWrites=true&w=majority
// connection
// mongodb://localhost:27017/node-file-upl
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});



let gfs;
conn.once("open", () => {
  // init stream
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads"
  });
});



const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        console.log(file)
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString("hex") + path.extname(file.originalname);

          minisave.push(filename)
          
          const fileInfo = {
            filename: filename,
            bucketName: "uploads"

          };
          resolve(fileInfo);


        });
      });
    }
  });
  
  const upload = multer({
    storage
  });




var logged = function(req,res,next){

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
const saveToken=[]
// const token = jwt.sign(user,"secret")
// res.header("auth-token", token).send("token")

function auth(req,res,next){
    const token = res.header("auth-token")
    console.log(res.header("auth-token"))
    if(token == null){
        return res.redirect('/')
    }
    else{
        //const verified = jwt.verify(token,"secret")

        next()
    }
}

router.get('/', (req,res)=>{
    
    res.render("pages/signIn", {
        background: 'elena-koycheva-bGeupv246bM-unsplash.jpg', 
    })
    
})


router.get('/forget', (req,res)=>{
    
    res.render("pages/forgetP", {
        background: 'elena-koycheva-bGeupv246bM-unsplash.jpg',
        display: 'block',
        resetDisplay: 'none' 
    })
    
})

router.post('/forgetPassword', (req,res)=>{
    User.findOne({email: req.body.email},function(err, doc){
        
        if(doc){
    var generate = Math.floor(Math.random() * 10000) + 1000;        
            
    let transporter = nodemailer.createTransport({
     
    //   host: 'smtp.gmail.com',
    //   port: 587,
    //   secure: false, 
     
     service: 'gmail',
      auth: {
        user: 'olaniyi.jibola152@gmail.com',
        pass: 'ridwan526'
      },
//       tls:{
//     rejectUnauthorized: false
// },
    });
  
    
    let mailOptions = {
      from: 'fintech.request@gmail.com', 
      to: req.body.email, 
      subject: 'forget password-Request App', 
      text: `Your code to access password reset is ${String(generate)}.`
    
    };
  

    transporter.sendMail(mailOptions, (error,info)=>{
        
      if(error){
          return console.log(error)
      } 

      console.log("Message sent: %s", info.messageId);
    
    //console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    
    })
    
            console.log(generate)
            res.render('pages/forgetP', {
                background: 'elena-koycheva-bGeupv246bM-unsplash.jpg',
                display: 'none',
                resetDisplay: 'block',
                msgColor: "green",
                message: "Code has been sent to your mail",
                email: req.body.email,
                secretCode: generate
            })
        }
        else{
            console.log("Email did not match")
            res.render('pages/forgetP', {
                background: 'elena-koycheva-bGeupv246bM-unsplash.jpg',
                msg: 'block',
                msgColor: "red",
                message: "Username or Email did not match",
                display: 'block',
                resetDisplay: 'none' 
            })
        }
        
})
})



router.post('/resetPassword', (req,res)=>{
    
    if(req.body.code == req.body.secretCode){
    User.findOne({email: req.body.email},function(err, doc){
        console.log(doc)
        if(doc){
            User.findByIdAndUpdate({_id: doc._id}, {
                _id: doc._id,
                username: doc.username, 
                password: req.body.newPassword,
                email: doc.email,
                unit: doc.unit
            }, 
            {new: true}, (err,docs)=>{
                console.log(docs)
            if (!err){
            console.log("successfully updated")
            
            res.redirect('/')
            }
           else{
            console.log("error occur during update")
            }
        })
            
           
            }
        
        else{
            console.log("could not find document")
            }
        
})
}
else{
    console.log("code did not match")
    res.render('pages/forgetP', {
        background: 'elena-koycheva-bGeupv246bM-unsplash.jpg',
        msg: 'block',
        msgColor: "red",
        message: "Code did not match",
        display: 'none',
        resetDisplay: 'block' 
    })
}
})



router.get('/logout',logged,(req,res)=>{
    
    // req.session.destroy(function(err){
    //     if(err){
    //         return next(err)
    //     }
    //     else{
            
    //         res.redirect('/')
    //     }
    // })

    res.header("auth-token", null)
    res.redirect("/")
   
})

router.post('/view', auth,(req,res)=>{
    
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

router.get('/adminTable',auth,(req,res)=>{
    
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
    
    // const {session} = req
    // session.user = req.body.username
    // session.save()
    
    // res.set({
    //     "Cache-Control": "no-store",
    //     "Pragma": "no-cache",
    //     "Expires": 0
    // })

    User.findOne({username: req.body.username, password: req.body.password},function(err, doc){
            
        if(doc){
            var user = {
                name: req.body.username
            }
            const token = jwt.sign(user,"secret")
            res.header("auth-token", token)
            console.log(token)
    
            
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



router.post("/request", auth,(req,res)=>{

    
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



router.post("/submitted", auth, upload.single("file"),(req,res)=>{
    
    insertRecord1(req,res)
    
})

function insertRecord1(req,res){
    var requestChange = req.body.request.replace(/\r?\n/g, '&lt;br&gt;')
    console.log(minisave[minisave.length-1])
    var inspector = new Inspector();
    inspector.username = req.body.username;
    inspector.task = req.body.task;
    inspector.request = requestChange;
    inspector.date = req.body.date,
    inspector.filename = minisave[minisave.length-1]
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


router.post("/delete",auth, (req,res)=>{
    
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

router.get("/file/:filename", (req, res) => {
    // console.log('id', req.params.id)
    const file = gfs
      .find({
        filename: req.params.filename
      })
      .toArray((err, files) => {
        if (!files || files.length === 0) {
          return res.status(404).json({
            err: "no files exist"
          });
        }
        else{
            console.log("found")
        gfs.openDownloadStreamByName(req.params.filename).pipe(res);
        }
      });
  });



module.exports = router