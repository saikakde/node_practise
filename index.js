// import http, { STATUS_CODES } from "http";
// import percentage from "./feature.js";
// import fs from "fs"; // file system module to read, write and edit files
// const http = require("http");

// -----------------------------------------------------
// this is for the basic understanding of node
// console.log(http);
// const server = http.createServer((req, res) => {
//     if (req.url === "/") {
//         // res.end("<h1>Home Page</h1>");
//         fs.readFile("./index.html", (err, home) => {
//             res.end(home);
//         })
//     }
//     else if (req.url === "/about") {
//         // res.end("<h1>About Page</h1>");}
//         res.end(`<h1>Your percentage is ${percentage()}%</h1>`);
//     }
//     else if (req.url === "/contact") {
//         res.end("<h1>Contact Page</h1>");
//     }
//     else {
//         res.end("<h1>Page Not Found</h1>");
//     }
// })
// ----------------------------------------------------

import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const app = express();

mongoose
    .connect("mongodb://localhost:27017/", { dbName: "backend" })
    .then(() => console.log("Database Connected"))
    .catch((e) => console.log(e));

// const users = [];
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(path.resolve(), "public")));
app.use(cookieParser())
// app.get(
//     "/",
//     (req, res) =>{
//         // res.send("hello, how are you")
//         // res.sendStatus(401)
//         // res.json({name:"sai",mail:"saik@gmail.com"})

//         // {const pathlocation = path.resolve();
//         // console.log(path.join(pathlocation,"welcome"));}

//         // res.render("index", { name: "saikakde" })
//     // res.sendFile("indexy")


//     const {token}=req.cookies;

//     if(token){
//         res.render("logout")
//     }else{
//         res.render("login")
//     }
// });

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});


const User = mongoose.model("User", userSchema);

const isAuthenticated = async (req, res, next) => {
    const { token } = req.cookies;

    if (token) {
        const decoded = jwt.verify(token, "qwertyuiop");
        req.user = await User.findById(decoded._id);
        // console.log(decoded);
        next();
    } else {
        res.redirect("/login")
    }
}
app.get("/", isAuthenticated, (req, res) => {
    res.render("logout")
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.get("/register", (req, res) => {
    res.render("register")
})
app.get("/logout", (req, res) => {
    res.cookie("token", null, { httpOnly: true, expires: new Date(Date.now()) });
    res.redirect('/');
})

// app.get("/add", async (req, res) => {
//     // res.send("nice guy");
//     await Message.create({ name: "sai", email: "saik@gmail.com" });
// });

app.post('/login',async(req,res)=>{
    const {email,password} = req.body;
    let user = await User.findOne({email});

    if(!user) return res.redirect("/register")

    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch) return res.render("login",{email,message:"Incorrect Password"})

    const token = jwt.sign({ _id: user._id }, "qwertyuiop");
    // console.log(token);

    res.cookie("token", token, { httpOnly: true, expires: new Date(Date.now() + 60 * 1000) });
    res.redirect('/');

})
app.post("/register", async (req, res) => {
    // console.log(req.body);
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
        return res.redirect("/login")
    }

    const hashedPassword = await bcrypt.hash(password,10)
    user = await User.create({
        name, email, password:hashedPassword,
    });

    const token = jwt.sign({ _id: user._id }, "qwertyuiop");
    // console.log(token);

    res.cookie("token", token, { httpOnly: true, expires: new Date(Date.now() + 60 * 1000) });
    res.redirect('/login');
})


// app.get("/success", (req, res) => {
//     res.render("success");
// });
// app.get("/users", (req, res) => {
//     res.json({
//         users,
//     });
// });

// app.post("/contact", async (req, res) => {
//     const { name, email } = req.body;
//     await Message.create({ name,email });
//     // either write above statemnet or below both works since key val pairs have same name
//     // await Message.create({ name: req.body.name, email: req.body.email });

//     // users.push({username:req.body.name,email:req.body.email});
//     res.redirect("/success");
//     // console.log(req.body.name);
// });

app.listen(5000, () => {
    console.log("Server is working");
});
