module.exports = function (req, res) {
  const key = process.env.SECRET_STRIPE_KEY;
  res.status(200).json({
    has_key: !!key,
    key_length: key ? key.length : 0,
    key_prefix: key ? key.slice(0, 7) : null,
    node_version: process.version,
  });
};
