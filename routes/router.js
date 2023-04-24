const express = require("express");
const router = new express.Router();
const users = require("../modules/userSchema");
const bcrypt = require("bcryptjs");
const authenticate = require("../middlewere/authenticate");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const password = process.env.PASSWORD;

const secratekey = process.env.SECRATEKEY;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: password,
  },
});

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      res.status(404).json({ status: 404, message: "fill all the details" });
    }

    const preuser = await users.findOne({ email: email });

    if (preuser) {
      res.status(404).json({ status: 404, message: "already exist" });
    } else {
      const data = new users({ name, email, password });
      const finaldata = await data.save();
      res.status(201).json({ status: 201, finaldata });
      console.log(finaldata);
    }
  } catch (error) {
    res.status(404).json({ status: 404, error });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      res.status(404).json({ status: 404, message: "fill all the details" });
    }

    const validuser = await users.findOne({ email: email });

    if (validuser) {
      const checkuser = await bcrypt.compare(password, validuser.password);
      console.log(checkuser);
      if (!checkuser) {
        res.status(404).json({ status: 404, message: "invalid details" });
      } else {
        const token = await validuser.genrateAuthtoken();
        console.log(token);
        res.status(201).json({ status: 201, token, validuser });
      }
    } else {
      res.status(404).json({ status: 404, message: "invalid details" });
      console.log("invalid details");
    }
  } catch (error) {
    res.status(404).json({ status: 404, error });
  }
});

router.get("/validuser", authenticate, async (req, res) => {
  try {
    const validuser = await users.findOne({ _id: req.userId });
    res.status(201).json({ status: 201, validuser });
  } catch (error) {
    res.status(404).json({ status: 404, error });
  }
});

router.get("/logout", authenticate, async (req, res) => {
  try {
    req.rootUser.tokens = req.rootUser.tokens.filter((ele, i) => {
      return ele.token !== req.token;
    });

    req.rootUser.save();
    res.status(201).json({ status: 201, messge: "user logout" });
  } catch (error) {
    res.status(404).json({ status: 404, error });
  }
});

router.get("/logininfo", authenticate, async (req, res) => {
  try {
    const info = await users.findOne({ _id: req.userId });
    res.status(201).json({ status: 201, info });
  } catch (error) {
    res.status(404).json({ status: 404, error });
  }
});

router.post("/sendmail", async (req, res) => {
  const { send_mail } = req.body;
  console.log(send_mail);

  try {
    if (!send_mail) {
      res.status(404).json({ status: 404, message: "Fill all the detail" });
    }

    const userfind = await users.findOne({ email: send_mail });
    console.log("userfind", userfind);

    const token = jwt.sign({ _id: userfind._id }, secratekey, {
      expiresIn: "120s",
    });
    console.log("token", token);

    const setusertoken = await users.findByIdAndUpdate(
      { _id: userfind._id },
      { verifytoken: token },
      { new: true }
    );
    console.log("setusertoken", setusertoken);

    if (setusertoken) {
      const mailOptions = {
        from: process.env.EMAIL,
        to: send_mail,
        subject: "Sending email for password reset",
        text: `this link valid for 2 minutes http://localhost:3000/forgotpassword/${userfind.id}/${setusertoken.verifytoken}`,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("error" + error);
        } else {
          res.status(201).json({ status: 201, message: "email send" });
          console.log("email send" + info.response);
        }
      });
    }
  } catch (error) {
    res.status(404).json({ status: 404, message: "Enter valid details" });
  }
});

router.get("/forgotpassword/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  console.log(id, token);
  try {
    const validuser = await users.findOne({ _id: id, verifytoken: token });
    console.log("validuser", validuser);

    const verifyToken = jwt.verify(token, secratekey);
    console.log("verifyToken", verifyToken);

    if (validuser && verifyToken._id) {
      res.status(201).json({ status: 201, validuser });
    } else {
      res.status(404).json({ status: 404, message: "user dose not exist" });
    }
  } catch (error) {
    res.status(404).json({ status: 404, error });
  }
});

router.post("/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const { pass } = req.body;
  try {
    const validuser = await users.findOne({ _id: id, verifytoken: token });
    console.log("validuser", validuser);

    if (validuser) {
      const newpassword = await bcrypt.hash(pass, 12);
      console.log("newpassword", newpassword);

      const setNewUserPassword = await users.findByIdAndUpdate(
        { _id: id },
        { password: newpassword },
        { new: true }
      );

      setNewUserPassword.save();
      console.log("setNewUserPassword", setNewUserPassword);
      res.status(201).json({ status: 201, setNewUserPassword });
    } else {
      res.status(404).json({ status: 404, error });
    }
  } catch (error) {
    res.status(404).json({ status: 404, error });
  }
});

module.exports = router;
