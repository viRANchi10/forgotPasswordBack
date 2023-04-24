const mongoose = require("mongoose");

mongoose
  .connect(process.env.DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => console.log("databse connected"))
  .catch((error) => {
    console.log("Error" + error);
  });
