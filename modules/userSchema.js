const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const secratekey = "qwertyuiopasdfghjklzxcvbnm";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  cpassword: {
    type: String,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

userSchema.methods.genrateAuthtoken = async function (req, res) {
  try {
    let Token = jwt.sign({ _id: this._id }, secratekey, {
      expiresIn: "1d",
    });
    this.tokens = this.tokens.concat({
      token: Token,
    });
    await this.save();
    return Token;
  } catch (error) {
    res.status(404).json({ status: 404, error });
  }
};

const users = new mongoose.model("users", userSchema);
module.exports = users;
