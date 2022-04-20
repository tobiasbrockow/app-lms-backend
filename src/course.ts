import express, { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongodb";
import { CourseState } from "../@types/express";
const router = express.Router();

const dbo = require("./db/conn");

router.param("courseid", (req: Request, res, next, id) => {
  const dbConnect = dbo.getDb();

  dbConnect
    .collection("courses")
    .find({ id: parseInt(id) })
    .limit(1)
    .toArray(function (err: Error, result: Array<CourseState>) {
      if (err) {
        res.status(400).send("Error fetching courses!");
      } else {
        if (result != undefined) {
          req.course = result[0];
          next();
        } else {
          res.status(404).send("Sorry, we cannot find this Course!");
        }
      }
    });
});

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

router.get("/all", (req: Request, res: Response, next: NextFunction) => {
  const coursesIDList: Array<number> = [];
  req.user?.courses.forEach((c) => {
    coursesIDList.push(c.id);
  });

  const dbConnect = dbo.getDb();
  dbConnect
    .collection("courses")
    .find({ id: { $in: coursesIDList } })
    .toArray(function (err: Error, result: Array<CourseState>) {
      if (err) {
        res.status(400).send("Error fetching courses!");
      } else {
        if (result != undefined) {
          res.json(result);
        } else {
          res.status(404).send("Sorry, we cannot find the courses!");
        }
      }
    });
});

router.get("/:courseid", (req: Request, res: Response, next: NextFunction) => {
  res.json(req.course);
});

router.put("/:courseid", (req: Request, res: Response, next: NextFunction) => {
  const id = req.body._id;
  req.body._id = new ObjectId(id);

  const dbConnect = dbo.getDb();
  dbConnect
    .collection("courses")
    .replaceOne(
      { id: req.course.id },
      req.body,
      function (err: Error, result: Object) {
        if (err) {
          console.log("Error occurred while updating course");
          console.log(err);
          res.json("Failed");
        } else {
          res.json(req.body);
        }
      }
    );
});

router.get(
  "/:courseid/:articleid",
  (req: Request, res: Response, next: NextFunction) => {
    res.json(req.article);
  }
);

router.delete(
  "/:courseid",
  (req: Request, res: Response, next: NextFunction) => {
    const dbConnect = dbo.getDb();

    const deleteCourseAsync = async () => {
      await dbConnect
        .collection("courses")
        .deleteOne(
          { id: req.course.id },
          function (err: Error, result: Object) {
            if (err) {
              console.log("Error occurred while deleting course");
              res.json("Failed");
            }
          }
        );

      await dbConnect
        .collection("users")
        .updateOne(
          { email: req.user?.email },
          { $pull: { courses: { id: req.course.id } } },
          function (err: Error, result: Object) {
            if (err) {
              console.log("Error occurred while deleting course from user");
              res.json("Failed");
            } else {
              res.json(req.course.id?.toString());
            }
          }
        );
    };

    deleteCourseAsync();
  }
);

router.post("/add", (req: Request, res: Response, next: NextFunction) => {
  const dbConnect = dbo.getDb();

  const newID = Math.floor(Math.random() * 90000) + 10000;
  const course = {
    title: req.body.title,
    des: req.body.des,
    active: false,
    id: newID,
    url: req.body.url,
    img_src: req.body.img_src,
  };

  const addCourseAsync = async () => {
    await dbConnect
      .collection("courses")
      .insertOne(course, function (err: Error, result: Object) {
        if (err) {
          console.log("Error occurred while inserting course");
          res.json("Failed");
        }
      });

    await dbConnect
      .collection("users")
      .updateOne(
        { email: req.user?.email },
        { $push: { courses: { id: newID, completed: false } } },
        function (err: Error, result: Object) {
          if (err) {
            console.log("Error occurred while inserting course to user");
            res.json("Failed");
          } else {
            res.json(course);
          }
        }
      );
  };

  addCourseAsync();
});

module.exports = router;
