const express = require("express");
const passport = require("passport");
const {
  registerUser,
  loginUser,
  refreshAccessToken,
} = require("../controller/auth.controller");
const User = require("../db/user.model");
const { cookieOption } = require("../utils/helper");
const isAuthenticated = require("../middleware/isAuth");
require("dotenv").config();

const router = express.Router();

// send request to google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// callback from google authentication
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URI}/auth/login/failed`,
  }),
  (req, res) => {
    console.log("OAuth Callback User:", req.user);
    res.redirect(`${process.env.CLIENT_URI}/auth/login/success`);
  }
);

router.get("/login/success", async (req, res) => {
  try {
    console.log("Login Success route");
    console.log("Session data:", req.session);
    console.log("User data:", req.user);
    console.log("Is authenticated:", req.isAuthenticated());

    if (req.isAuthenticated()) {
      console.log("User:", req.user);
      // const accessToken = await req.user.generateAccessToken();
      // const refreshToken = await req.user.generateRefreshToken();
      const user = req.user;

      // set cookies
      // res.cookie(process.env.AUTH_TOKEN, accessToken, cookieOption);
      // res.cookie("refreshToken", refreshToken, cookieOption);

      return res.status(200).json({
        user,
        success: true,
        message: "Login successfully",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Google Login Failed" });
  }
});

// login failed
router.get("/login/failed", async (req, res) => {
  return res
    .status(401)
    .json({ success: false, message: "Google Login Failed" });
});

router.get("/logout", isAuthenticated, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.uId);
    res.clearCookie(process.env.AUTH_TOKEN, cookieOption);
    res.clearCookie("refreshToken", cookieOption);

    return res
      .status(200)
      .json({ success: true, message: "Logout successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Credentials Auth Route
router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);

module.exports = router;
