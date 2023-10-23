const express = require("express");
const { urlencoded, json } = require("body-parser");
const cors = require("cors");
const { readdirSync } = require("fs");

const app = express();

// API CONFIGS
app.use(json({ limit: "200mb" }));
app.use(urlencoded({ limit: "200mb", extended: true }));
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
readdirSync("./services").map((r) =>
  app.use("/api", require("./services/" + r))
);

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
