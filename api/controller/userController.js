const CvUser = require("../model/userModel");
const Cv = require("../model/cvModel");
const Letter = require("../model/letterModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "https://app.cvstudio.io",
  port: 587,
  secure: true,
  requireTLS: true,
  auth: {
    user: "cvstudio.main@gmail.com",
    pass: "Sadiq1086@",
  },
  from: "cvstudio.main@gmail.com",
});
const userCtrl = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await CvUser.findOne({ email });
      if (!user) return res.json({ msg: "User does not exist." });

      const isMatch = await bcrypt.compare(password, user.password);
      const isAdmin = email === "cvstudio.main@gmail.com" && isMatch;

      if (isAdmin) return res.json({ data: "1" });

      if (!isMatch) return res.json({ msg: "Incorrect password." });
      //if login success
      const accesstoken = createAccessToken({ id: user._id });

      const refreshtoken = refreshAccessToken({ id: user._id });

      res.cookie("refreshtoken", refreshtoken, {
        httpOnly: true,
        path: "/euser/refresh_token",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ accesstoken, user: user });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  register: async (req, res) => {
    try {
      const { email, password, userName, phone, emailtoken } = req.body;
      if (emailtoken) {
        let result = await sendMailToUser(req.body, req);

        return res.json({ result: result });
      }

      let user = await CvUser.findOne({ email: email });

      if (user) return res.json({ msg: "The email already exist" });

      if (password.length < 6)
        return res.json({ msg: "Password is too short" });

      //password Encryption

      const passwordHash = await bcrypt.hash(password, 10);

      const newUser = new CvUser({
        isVerified: false,
        email,
        emailtoken: crypto.randomBytes(64).toString("hex"),
        password: passwordHash,
        userName,
        phone,
      });

      user = await newUser.save();

      let result = await sendMailToUser(user, req);

      const accesstoken = createAccessToken({ id: user._id });

      const refreshtoken = refreshAccessToken({ id: user._id });

      res.cookie("refreshtoken", refreshtoken, {
        httpOnly: true,
        path: "/euser/refresh_token",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ accesstoken, user: user, result });
    } catch (err) {
      return res.json({ msg: err.message });
    }
  },
  refreshToken: (req, res) => {
    try {
      const rf_token = req.cookies.refreshtoken;
      if (!rf_token)
        return res.status(400).json({ msg: "please Login or Register" });
      jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err)
          return res.status(400).json({ msg: "please Login or Register" });
        const accesstoken = createAccessToken({ id: user.id });
        res.json({ accesstoken });
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  logout: async (req, res) => {
    try {
      res.clearCookie("refreshtoken", {
        path: "/euser/refresh_token",
      });
      return res.json({ msg: "Logged out" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  success: function (req, res) {
    const marckup = `
        <div style="width:100%;height:100%;display:flex;flex-direction:column;margin-top:100px;align-items:center;justify-content:flex-start;">
        <h1>Welcome to CVSTUDIO</h1>
        <p>verification successfull</p>
        <a href="http://127.0.0.1:5501/cvengine.html">login</a>
        </div>`;
    res.send(marckup);
  },
  verifyUser: async function (req, res) {
    try {
      const token = req.query.token;

      const user = await CvUser.findOne({ emailtoken: token });
      if (!user) return res.json({ msg: "invalid or expired token" });
      user.isVerified = true;
      user.emailtoken = null;
      await user.save();
      res.redirect("/user/success");
    } catch (error) {
      console.log(error);
    }
  },
  getusers: async (req, res) => {
    try {
      // console.log(req.body)
      // if(req.body!=="cvstudio.main@gmail.com") return res.json("unautorized request")
      const users = await CvUser.find().select("-password");
      const cvs = await Cv.find();
      const letters = await Letter.find();
      if (!users) return res.json({ msg: "no users" });

      // console.log(letters)
      res.json({users: users.filter((user) => user.email !== "cvstudio.main@gmail.com"),cvs:cvs,letters:letters});
    } catch (err) {
      return res.json({ mss: err.message });
    }
  },
  delete: async (req, res) => {
    try {
      const id = req.params.id.slice(1);
      const cvres = await Cv.findByIdAndDelete({ _id: id });
      const userres = await CvUser.findByIdAndDelete({ _id: id });
      res.json({ cv: cvres, user: userres });
    } catch (err) {
      return res.json({ msg: err.message });
    }
  },
};
const refreshAccessToken = (user) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "30d" });
};

const sendMailToUser = async function (user, req) {
  const msg = {
    from: { name: "CVSTUDIO", address: "<cvstudio.main@gmail.com>" },
    to: user.email,
    subject: "WELCOME - verify your email",
    text: `Hellow, thanks for registering on our site. Please copy and paste the address below to verify your account. https://${req.headers.host}/verify'email?token=${user.emailtoken}`,
    html: `
              <h1>Hello, ${user.userName}</h1>
              <p>Thanks for registering on our site.</p>
              <p>Please click the link below to verify your account.</p>
              <a href="https://${req.headers.host}/user/verify-email?token=${user.emailtoken}">Verify email</a>`,
  };
  return await transporter.sendMail(msg);
};
const createAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "300d" });
};
module.exports = userCtrl;
