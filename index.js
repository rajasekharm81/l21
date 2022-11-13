import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import moment from "moment-timezone";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

const port = process.env.PORT || 3030;

const databaseConnection = async () => {
  console.log("initilized");
  try {
    await mongoose.connect(process.env.DB_PATH);
    app.listen(port, () => {
      console.log(`Connection Successfull. listing at ${port}`);
    });
  } catch (e) {
    console.log(`not connected :${e}`);
  }
};
databaseConnection();

// const accessToken = request.headers["authorization"];

//  login APIS AND userDocument API

const usersSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, minLength: 6 },
  password: { type: String, required: true, minLength: 6 },
  phone: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  security_questions: { type: Array, required: true },
});
const UsersCollection = new mongoose.model("UserCollection", usersSchema);

app.post("/adminPanel/login", async (request, response) => {
  const Userdata = request.body;
  const res = await UsersCollection.find({
    username: Userdata.username.toLowerCase(),
  });
  if (res.length === 0) {
    response.status(401);
    response.send("Invalid User");
  } else {
    if (res[0].password === Userdata.password) {
      const payload = { username: Userdata.username.toLowerCase() };
      const jwtToken = jwt.sign(payload, "MY_SECRET_CODE");
      response.send(jwtToken);
    } else {
      response.status(401);
      response.send("invalid password");
    }
  }
});

// Query posting APIs

const QuoteSchema = new mongoose.Schema({
  name: String,
  city: String,
  email: String,
  Phone: String,
  year: Number,
  make: String,
  model: String,
  part: String,
  engine_type: String,
  transmission: String,
  isChecked: { type: Boolean, default: false },
  date: { type: Date, default: Date.now() },
});

const Quote = new mongoose.model("Quote", QuoteSchema);

app.post("/SendQuery", async (request, response) => {
  const userData = request.body;
  const quote = new Quote({
    name: userData.name,
    city: userData.city,
    email: userData.email,
    Phone: userData.Phone,
    year: userData.year,
    make: userData.make,
    model: userData.model,
    part: userData.part,
    engine_type: userData.engine_type,
    transmission: userData.transmission,
  });
  try {
    await quote.save();
    response.send("Request sent successfully");
  } catch (e) {
    response.status(408);
    response.send("try again");
  }
});

app.get("/getQuotes", async (request, response) => {
  const data = await Quote.find();
  response.send(data);
});

// update isChecked

app.put("/updateChecked", async (request, response) => {
  const req = request.body;
  const query = req.id.split(" ")[1];
  const status = req.status;
  const s = await Quote.findOneAndUpdate(query, {
    $set: { isChecked: status },
  });
});

// delete Entry
app.delete(`/deleteItem/:id`, async (request, response) => {
  const req = request.params;
  const s = await Quote.deleteOne({ _id: req.id });
  console.log(s);
});

app.get("/", (req, res) => {
  res.send("we are connected successfull");
});
