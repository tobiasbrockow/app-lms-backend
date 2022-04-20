import express, { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongodb";
import { CourseState } from "../@types/express";
const router = express.Router();

const dbo = require("./db/conn");

router.param("articleid", (req: Request, res, next, id) => {
  const dbConnect = dbo.getDb();

  dbConnect
    .collection("articles")
    .find({ "content.id": parseInt(id) })
    .limit(1)
    .toArray(function (err: Error, result: Array<CourseState>) {
      if (err) {
        res.status(400).send("Error fetching courses!");
      } else {
        if (result != undefined) {
          req.article = result[0];
          next();
        } else {
          res.status(404).send("Sorry, we cannot find this Article!");
        }
      }
    });
});

router.put("/:articleid", (req: Request, res: Response, next: NextFunction) => {
  const id = req.body._id;
  req.body._id = new ObjectId(id);

  const dbConnect = dbo.getDb();
  dbConnect
    .collection("articles")
    .replaceOne(
      { _id: req.body._id },
      req.body,
      function (err: Error, result: Object) {
        if (err) {
          console.log("Error occurred while updating article");
          console.log(err);
          res.json("Failed");
        } else {
          res.json(req.body);
        }
      }
    );
});

module.exports = router;
