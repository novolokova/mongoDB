const http = require("http");
const express = require("express");
const yup = require("yup");
const mongoose = require("mongoose");
const { Schema } = mongoose;

mongoose
  .connect("mongodb://localhost:27017/fm_mongoose") // connect
  .catch((error) => console.log(error));

const emailSchema = yup.string().trim().email().required(); // validation email

const taskSchema = new Schema({
  content: {
    type: String,
    required: true,
    validate: {
      validator: (v) => /[A-Z0-9][\w\s]{5,100}/.test(v),
      message: (props) => `${props.value} is not a valid content!`,
    },
  },
  isDone: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  owner: {
    name: {
      type: String,
      validate: {
        validator: (v) => v !== "",
        message: (props) => `${props.value} is not ampty!`,
      },
    },
    age: {
      type: Number,
      validate: {
        validator: (v) => v > 0 && v < 150,
        message: (props) => `${props.value} is not a valid age!`,
      },
    },
    // validation on yup
    email: {
      type: String,
      validate: {
        validator: (v) => emailSchema.isValidSync(v),
      },
    },
  },
});
const Task = mongoose.model("Task", taskSchema); // create model

const app = express();
app.use(express.json());

//**********requests*************************************/
app.get("/", async (req, res, next) => {
  try {
    const task = await Task.find({});
    res.status(200).send({ data: task });
  } catch (error) {
    next(error);
  }
});

app.get("/:taskId", async (req, res, next) => {
  try {
    const {
      params: { taskId },
    } = req;
    const task = await Task.findById(taskId);
    res.status(200).send({ data: task });
  } catch (error) {
    next(error);
  }
});

app.post("/", async (req, res, next) => {
  try {
    const { body } = req;
    const newTask = await Task.create(body);
    res.status(201).send({ data: newTask });
  } catch (error) {
    next(error);
  }
});

app.delete("/:taskId", async (req, res, next) => {
  try {
    const {
      params: { taskId },
    } = req;
    const deletedtask = await Task.findOneAndDelete({ _id: taskId });
    res.status(200).send({ data: deletedtask });
  } catch (error) {
    next(error);
  }
});

app.patch("/:taskId", async (req, res, next) => {
  try {
    const {
      body,
      params: { taskId },
    } = req;
    const updatedtask = await Task.findByIdAndUpdate(taskId, body);
    res.status(200).send({ data: updatedtask });
  } catch (error) {
    next(error);
  }
});

const server = http.createServer(app);
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log("server started at port " + port);
});
