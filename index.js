require("dotenv").config();
const express = require("express");
const {db} = require("./db");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// export const JWT_SECRET = "Atfeqijbdrg@kiy123"
// export const CLIENT_URL = "http://localhost:3000"
// export const CLIENT_URL =  "https://version-control-system-fe.netlify.app"


//Importing routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const repoRoutes = require("./routes/repository");

const { isAuth } = require("./middleware/auth");


const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "https://sandyversioncontrolsystem.netlify.app",
    credentials: true,
  })
);





app.use("/", authRoutes);
app.use("/", isAuth, userRoutes);
app.use("/repo", isAuth, repoRoutes);

//Connecting DB
db();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`App is running on PORT ${PORT}`);
});