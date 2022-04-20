import express, { NextFunction, Request, Response } from "express";
require("dotenv").config();
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const courseRouter = require("./course");
const articleRouter = require("./article");
const authRouter = require("./auth");
var compression = require("compression");
var helmet = require("helmet");

const app = express();
const port = process.env.PORT || 8000;
const dbo = require("./db/conn");

app.set("trust proxy", 1);
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:8000",
      "https://applms.herokuapp.com",
      "https://applmsbe.herokuapp.com/",
    ],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(
  session({
    secret: process.env.SESSION_KEY,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      secure: true,
      sameSite: "none",
      httpOnly: true,
    },
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.ATLAS_URI,
    }),
  })
);
app.use(passport.initialize());
app.use(passport.authenticate("session"));

// Save user email in a session cookie
passport.serializeUser(
  (
    user: UserDatabase,
    done: (err: string | null, user: string | boolean) => any
  ) => {
    done(null, user.email);
  }
);

// Use the email to look up the user in the database and return the user object with data.
passport.deserializeUser(
  (
    id: string,
    done: (err: string | null, user: UserDatabase | boolean) => any
  ) => {
    const dbConnect = dbo.getDb();
    dbConnect
      .collection("users")
      .find({ email: id })
      .limit(1)
      .toArray(function (err: Error, result: Array<UserDatabase>) {
        if (err) {
          return done(null, false);
        } else {
          if (result != undefined) {
            done(null, result[0]);
          } else {
            return done(null, false);
          }
        }
      });
  }
);

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    function (
      username: string,
      password: string,
      done: (err: string | null, user: UserDatabase | boolean) => any
    ) {
      const dbConnect = dbo.getDb();
      dbConnect
        .collection("users")
        .find({ email: username })
        .limit(1)
        .toArray(function (err: Error, result: Array<UserDatabase>) {
          if (err) {
            return done(null, false);
          } else {
            if (result != undefined) {
              if (result[0].password === password) {
                done(null, result[0]);
              } else {
                return done(null, false);
              }
            } else {
              return done(null, false);
            }
          }
        });
    }
  )
);

app.use("/courses", courseRouter);
app.use("/articles", articleRouter);
app.use("/auth", authRouter);

dbo.connectToServer(function (err: Error) {
  if (err) {
    console.error(err);
    process.exit();
  }

  // start the Express server
  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });
});

export interface UserDatabase {
  email: string;
  password: string;
  name: string;
  courses: CourseUser[];
}

interface CourseUser {
  id: number;
  completed: boolean;
}