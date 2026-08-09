const jwt = require("jsonwebtoken");

function generateToken(user) {
  const token = jwt.sign({
    id: user._id,
    email: user.email,
    fullName: user.fullName
  }, process.env.JWT_SECRET, { expiresIn: "7d" });
  return token;
}

module.exports = generateToken;