const express = require("express")
const app = express()
const PORT = 3000
const path = require("path")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const usermodel = require("./models/user")
const connection = require("./config/connection")
const cookieParser = require("cookie-parser")
const taskmodel = require("./models/task")
const { runInNewContext } = require("vm")
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,"public")))
app.set("view engine","ejs")
app.use(cookieParser())
//Routes 
app.get("/",(req,res)=>{
    res.render("homepage")
})
app.get("/register",(req,res)=>{
    res.render("register")
})
app.post("/register",async(req,res)=>{
    const {username,email,password} = req.body
    const user = await usermodel.findOne({email})
    if(user){
        res.send("User Already Exist")
    }
    else{
        const saltround = await bcrypt.genSalt(10)
        const hashedpassword = await bcrypt.hash(password,saltround)
        let user = await usermodel.create({
            username:username,
            email:email,
            password:hashedpassword
        })
        if(user){
            let token = jwt.sign({email},"hehe")
            res.cookie("token",token)
            return res.redirect("/") 
        }
        else{
            res.redirect("/reigster")
        }
    }
})
app.get("/login",(req,res)=>{
    res.render("login")
})
app.post("/login",async(req,res)=>{
    let {email,password} = req.body
    let user = await usermodel.findOne({email})
    if(user){
        await bcrypt.compare(password,user.password,(err,result)=>{
            if(result){
                let token = jwt.sign({email},"hehe")
                res.cookie("token",token)
                return res.redirect("/")
            }
            else{
                res.redirect("/login")
            }
        })
    }
    else{
        res.redirect("/register")
    }
})
app.get("/logout",(req,res)=>{
    res.cookie("token","")
    res.redirect("/login")
})
app.get("/task",checkdata,async(req,res)=>{
    let user = await usermodel.findOne({email:req.user.email})
    let tasks = await taskmodel.find()
    res.render("task",{user,tasks})
})
function checkdata(req,res,next){
    if(req.cookies.token ==""){
        res.render("login")
        next()
    }
    else{
        let data = jwt.verify(req.cookies.token,"hehe")
        req.user = data
        next()
    }
}
app.post("/addtask",async(req,res)=>{
    const {title,content} = req.body
    let tasks = await taskmodel.create({
        title:title,
        content:content
    })
    res.redirect("/task")
})
app.get("/delete/:title",async(req,res)=>{
    let tasks = await taskmodel.findOneAndDelete({title:req.params.title})
    res.redirect("/task")
})
app.get("/edit/:title",async(req,res)=>{
    let title2 = req.params.title
    let tasks = await taskmodel.findOne({title:title2})
    res.render("edittask",{tasks})
})
app.post("/editing",async(req,res)=>{
    let {previous,newtitle} = req.body
    let tasks = await taskmodel.findOneAndUpdate({title:previous},{title:newtitle})
    res.redirect("/task")
})
app.listen(PORT,()=>{
    console.log(`App is listening at ${PORT}`)
})
