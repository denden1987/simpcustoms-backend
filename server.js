require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

/* ----------------------------------
   REQUIRED FOR RAILWAY + RATE LIMIT
---------------------------------- */
app.set("trust proxy", 1);

/* ----------------------------------
   GLOBAL MIDDLEWARE
---------------------------------- */
app.use(cors());
app.use(express.json());

/* ----------------------------------
   ROUTES
---------------------------------- */
const classifyRoute = require("./routes/classify");
app.use("/api/classify", classifyRoute);

/* ----------------------------------
   HEALTH CHECK
---------------------------------- */
app.get("/", (req, res) => {
  res.send("SimpCustoms API is running");
});

/* ----------------------------------
   START SERVER
---------------------------------- */
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
