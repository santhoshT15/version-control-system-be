const Users = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Tokens = require("../models/token");
const crypto = require("crypto");
const { sendEmail } = require("../utilities/sendEmail");

const register = async (req, res) => {
  try {
    const payload = req.body;

    if (!payload.password) {
      return res.status(400).send({ message: "Password is mandatory" });
    }

    const hashValue = await bcrypt.hash(payload.password, 10);

    payload.hashedPassword = hashValue;
    delete payload.password;

    let newUser = new Users(payload);

    const data = await newUser.save();

    res.status(201).send({ message: "User registered successfully.", userID: data._id });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).send({ message: "This email is already registered. If you don't remember the password, try to reset the password in the login page or try to register with another email.", error: error.message });
    }
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
};

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    let existingUser = await Users.findOne({ email: email });

    if (existingUser) {
      const isValidUser = await bcrypt.compare(password, existingUser.hashedPassword);

      if (isValidUser) {
        const token = await jwt.sign({ _id: existingUser._id }, "JWT_SECRET");
        res.cookie("accessToken", token, { httpOnly: true, sameSite: "none", secure: true, expire: new Date() + 86400000 });

        existingUser = existingUser.toObject();
        delete existingUser.hashedPassword;
        return res.status(201).send({ message: "User signed-in successfully", user: existingUser });
      }

      return res.status(401).send({ message: "Invalid credentials" });
    }

    res.status(400).send({ message: "User does not exist" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
};

const signout = async (req, res) => {
  try {
    await res.cookie("accessToken", { expire: new Date() });
    await res.clearCookie("accessToken");
    res.status(200).send({ message: "User signed-out successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error: error });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({ message: "Email is mandatory" });
    }
    const user = await Users.findOne({ email: email });

    if (!user) {
      return res.status(400).send({ message: "User does not exist" });
    }

    let token = await Tokens.findOne({ userId: user._id });

    if (token) {
      await token.deleteOne();
    }

    let newToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = await bcrypt.hash(newToken, 10);

    const tokenPayload = new Tokens({userId: user._id, token: hashedToken, createdAt: Date.now()});

    await tokenPayload.save();

    const link = `https://version-control-system-fe.netlify.app/reset-password?token=${newToken}&id=${user._id}`;

    await sendEmail(user.email, "Version Control System Account Reset Password", {message: "Please click the link to verify your identity and set a new password for your account",link: link});

    res.status(200).send({ message: "Email sent successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error: error });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { userId, token, password } = req.body;

    let resetToken = await Tokens.findOne({ userId: userId });

    if (!resetToken) {
      return res.status(401).send({ message: "Invalid or expired token" });
    }

    const isValid = await bcrypt.compare(token, resetToken.token);

    if (!isValid) {
      return res.status(400).send({ message: "Invalid Token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    Users.findByIdAndUpdate({ _id: userId }, { $set: { hashedPassword: hashedPassword } }, (err, data) => {
        if (err) {
          return res.status(400).send({ message: "Error while resetting the password", error: err});
        }
      }
    );

    await resetToken.deleteOne();

    res.status(200).send({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error: error });
  }
};

module.exports = { register, signin, signout, forgotPassword, resetPassword };