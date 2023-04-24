const secratekey = "qwertyuiopasdfghjklzxcvbnm";
const jwt = require("jsonwebtoken");
const users = require("../modules/userSchema");

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    const verifytoken = jwt.verify(token, secratekey);

    const rootUser = await users.findOne({ _id: verifytoken._id });

    if (!rootUser) {
      throw new Error("user not found");
    }

    req.token = token;
    req.rootUser = rootUser;
    req.userId = rootUser._id;

    next();
  } catch (error) {
    res.status(404).json({ status: 404, error });
  }
};

module.exports = authenticate;
