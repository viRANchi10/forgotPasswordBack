const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/forgotpass", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => console.log("databse connected"))
  .catch((error) => {
    console.log("Error" + error);
  });
