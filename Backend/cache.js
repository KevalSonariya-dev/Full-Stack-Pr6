const NodeCache = require("node-cache");

// Standard TTL: 60 seconds, check period for expired keys: 120 seconds
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

module.exports = cache;
