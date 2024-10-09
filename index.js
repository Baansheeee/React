const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const userModel = require('./models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());


app.get("/", function (req, res) {
    res.render("index")
})
app.post('/create', function (req, res) {
    let { username, email, password, age } = req.body
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, async function (err, hash) {
            let createdUser = await userModel.create({
                username,
                email,
                password: hash,
                age,
            })
            let token = jwt.sign({ email }, "chintapaktamtam")
            res.cookie("token", token)
            res.send(createdUser);
        })
    })
})

app.get('/logout', function (req, res) {
    res.cookie("token", "")
    res.redirect("/")
})

app.get('/login', function (req, res) {
    res.render("login")
})
app.get('/profile', function (req, res) {
    let token = req.cookies.token
    jwt.verify(token, "chintapaktamtam", function (err, decoded) {
        if (err) {
            res.redirect("/login")
        } else {
            res.send("Welcome " + decoded.email)
        }
    })}
)

app.post('/login', async function (req, res) {
    let { email, password } = req.body
    let user = await userModel.findOne({ email })
    if (user) {
        bcrypt.compare(password, user.password, async function (err, result) {
            if (result) {
                let token = jwt.sign({ email }, "chintapaktamtam")
                res.cookie("token", token)
                res.redirect('/profile')
            } else {
                res.send("Invalid password")
            }
        })
    } else {
        res.send("User not found")
    }
})

app.listen(3000)