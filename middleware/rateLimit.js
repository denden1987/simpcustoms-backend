const rateLimit = require("express-rate-limit");

const classifyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,             // 10 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please wait a moment before trying again."
  }
});

module.exports = {
  classifyLimiter
};
