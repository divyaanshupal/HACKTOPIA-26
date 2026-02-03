const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json());

const logRoutes = require("./routes/logs");
app.use("/api", logRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Blockchain Log Server Running");
});

app.listen(process.env.PORT, () => {
  console.log(`✅ Server running on port ${process.env.PORT}`);
});
