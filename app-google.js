require("dotenv").config();
const express = require("express");

const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const app = express();

const {
  PORT,
  KEY_SESSION,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
} = process.env;

app.use(express.json());

const store = session.MemoryStore();

app.use(
  session({
    saveUninitialized: false,
    secret: KEY_SESSION,
    resave: true,
    cookie: { maxAge: 1000 * 60 * 60 },
    store,
  })
);

// 1 - initialize passport
// 2 - create session
app.use(passport.initialize());
app.use(passport.session());

// 3 - authentication
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      console.log("Google Profile:::", profile);
      return done(null, profile);
    }
  )
);

// 4 - serializeUser
passport.serializeUser((user, done) => {
  done(null, user);
});

// 5 - deserializeUser
passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get("/status", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "ok",
  });
});

app.get("/profile", (req, res) => {
  if (req.isAuthenticated()) {
    return res.status(200).json({
      status: "success",
      data: {
        name: "ngxquang",
        age: 21,
      },
    });
  }
  return res.status(401).json({
    status: "Failed",
    message: "Not Authenticated",
  });
});

app.get('/auth/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
)

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect('/profile')
  }
);

app.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) return next(err);
        res.redirect('/status');
    })
})

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
