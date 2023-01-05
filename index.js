const express = require("express");
const axios = require("axios");
const passport = require("passport");
const OAuth2Strategy = require("passport-oauth2");
var cookieSession = require("cookie-session");
const app = express();
// Configure the OAuth2 Strategy with your client ID and secret
passport.use(
  new OAuth2Strategy(
    {
      authorizationURL:
        "https://infosys-3.authentication.ap10.hana.ondemand.com/oauth/authorize",
      tokenURL:
        "https://infosys-3.authentication.ap10.hana.ondemand.com/oauth/token",
      clientID: "sb-204789e4-3a7b-48dd-894e-4c87bb544c20!b11192|client!b24",
      clientSecret:
        "bfc4acca-b733-43bf-8113-f73f0f857ee4$V9PdrYMx_LuOECd9bS4PBxTujiOPqYAXeuh3kVc2Y8o=",
      callbackURL: "http://localhost:3000/auth/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      // This is where you would look up the user in your database
      // and return the user object
      passport.serializeUser(function (user, done) {
        done(null, user);
      });

      // passport.deserializeUser(function (user, done) {
      //   done(null, user);
      // });
      console.log("Access Token", accessToken, refreshToken, profile);
      return done(null, accessToken);
    }
  )
);

// Configure Express to use sessions and Passport
app.use(passport.initialize());
app.use(
  cookieSession({
    name: "session",
    keys: ["ANYTHING"],
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);
// Set up the authorization route
app.get("/auth", passport.authenticate("oauth2"));

// Set up the callback route
app.get(
  "/auth/callback",
  passport.authenticate("oauth2", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    console.log("rbody", req.user);
    console.log("cookie", req.headers.cookie);
    axios
      .post(
        "https://infosys-3.ap10.hcs.cloud.sap/dwaas-core/tf/HACK2BUILD/taskchains/Task_Chain_1/start",
        {},
        {
          headers: {
            Authorization: "Bearer " + req.user,
            Cookie: req.headers.cookie,
          },
        }
      )
      .then((e) => {
        console.log(e);
      })
      .catch((e) => {
        console.log(e);
      });
  }
);
// Start the server
app.listen(3000, () => {
  console.log("Server running");
});
