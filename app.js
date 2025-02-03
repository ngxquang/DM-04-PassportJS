require('dotenv').config();
const express = require('express');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');


const app = express();

const {PORT, KEY_SESSION} = process.env;

app.use(express.json())


const store = session.MemoryStore();

// Khai bao session
app.use(session({
    saveUninitialized: false,
    secret: KEY_SESSION,
    cookie: {
        maxAge: 1000 * 30
    },
    store
}))

// 1 - initialize
// 2 - use session
app.use(passport.initialize());
app.use(passport.session());



app.get('/status', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'ok'
    })
})

app.get('/profile', (req, res) => {
    if(req.isAuthenticated()) {
        return res.status(200).json({
            status: 'success',
            data: {
                name: 'ngxquang',
                age: 21
            }
        })
    }
    return res.status(200).json({
        status: 'Failed',
        message: 'Not Authenticated'
    })
})


app.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login'
}), (req, res) => {
    try {
        res.json({
            body: req.body
        })
    } catch (error) {
        res.json({
            error: error.stack
        })
    }
})



// 3 - authentication
const user = {
    username: "123",
    password: "123"
}
passport.use(new LocalStrategy((username, password, done) => {
    console.log(`username::: ${username}, password: ${password}`);
    if(username === user.username && password === user.password) {
        return done(null, {
            username,
            password,
            active: true
        })
    }

    done(null, false)
}))



// 4 - serializrUser
passport.serializeUser((user, done) => done(null, user.username))


// 5 - deserializeUser
passport.deserializeUser((username, done) => {
    console.log('deserializeUser:::', username);
    // check username
    if(username === user.username) {
        return done(null, {
            username,
            active: true
        })
    }
    return done(null, false)
})

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
})