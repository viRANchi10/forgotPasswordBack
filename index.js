require("dotenv").config();

const express = require("express");
app = express();

require("./db/conn");
const router = require("./routes/router");
const cors = require("cors");
const port = 9900;

app.use(cors());
app.use(express.json());
app.use(router);

app.listen(port, () => {
  console.log(`connection start on port ${port}`);
});
