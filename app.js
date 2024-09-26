const express = require("express");
const cors = require("cors");
const connectDB = require("./db/connection.js");
const authRoutes = require("./routes/auth.route.js");
const userRoutes = require("./routes/user.route.js");
const testRoutes = require("./routes/test.route.js");
const adminRoutes = require("./routes/admin.route.js");
const passport = require("passport");
const initializePassport = require("./auth/passport.js");
const cookieParser = require("cookie-parser");
const { ErrorHandler } = require("./middleware/ErrorHandler.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
require("dotenv").config();


const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CLIENT_URI,
  credentials: true
}))
connectDB(process.env.MONGO_URI);

const mongoStore = MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
  collectionName: "sessions",
  ttl: 15 * 60 * 1000, // 15 min
});

// remove cookie for development it will work
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: mongoStore,
    cookie: {
      maxAge: 15 * 60 * 1000,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
      secure: process.env.NODE_ENV === "production"
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

// passport initialize
initializePassport(passport);

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/test", testRoutes);
app.use("/admin", adminRoutes);

app.get('/check-session', (req, res) => {
  console.log('Session Data:', req.session);
  if (req.session) {
    res.status(200).json({ message: 'Session is initialized',
      session: req.session, });
  } else {
    res.status(400).json({ message: 'No session found' });
  }
})

app.get("/", (req, res) => {
  res.send("Hello from server");
});

app.use(ErrorHandler);

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port ", process.env.PORT || 5000);
});
