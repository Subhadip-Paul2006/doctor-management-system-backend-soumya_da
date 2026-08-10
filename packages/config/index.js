// @doctor/config — shared frontend configuration entry point (JS, CommonJS).
const { envSchema, validateEnv } = require("./env.js");

module.exports = { envSchema, validateEnv };
