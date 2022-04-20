import express, { NextFunction, Request, Response } from "express";
const passport = require("passport");
const router = express.Router();

const loginRequired = (req: Request, res: Response, next: NextFunction) => {
  if (req.user != undefined) {
    next();
  } else {
    res.status(404).send("You're not authorized.");
  }
};

router.post("/login", passport.authenticate("local"), (req, res) => {
  const response = {
    email: req.user?.email,
    name: req.user?.name,
    courses: req.user?.courses,
  };
  res.json(response);
});

router.post("/authenticate", loginRequired, (req, res) => {
  const response = {
    email: req.user?.email,
    name: req.user?.name,
    courses: req.user?.courses,
  };
  res.json(response);
});

router.post("/logout", (req: Request, res: Response, next: NextFunction) => {
  req.logout();
  req.session.destroy(() => {
    res.clearCookie("connect.sid").status(200).send();
  });
});

module.exports = router;
