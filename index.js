import express from "express"
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from 'dotenv';
import discoveryRoutes from "./routes/discovery_data.js";

dotenv.config();

//System Setup
const app = express();
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use('/discovery', discoveryRoutes);

//Atlas Connection Setup
const CONNECTION_URL = `mongodb+srv://${process.env.MONGODBUSER}:${process.env.MONGODBPASS}@cluster0.s9wsujz.mongodb.net/?retryWrites=true&w=majority`;
const PORT = process.env.PORT || 5003;

//Mongoose Connect
mongoose.connect(CONNECTION_URL).then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`))).catch((err) => console.log(err.message))


