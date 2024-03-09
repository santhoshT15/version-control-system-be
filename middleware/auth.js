const jwt = require("jsonwebtoken");

exports.isAuth = (req, res, next) => {
  const { cookies } = req;

  if (cookies.accessToken) {
    let decryptedData = jwt.verify(cookies.accessToken,"JWT_SECRET");
    req.userId = decryptedData._id;
    
    if (!req.userId) {
      return res.status(401).send({ message: "Unauthorized" });
    }

    return next();
  }
  return res.status(401).send({ message: "Unauthorized" });
};