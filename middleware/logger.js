const logger = (req, res, next) => {
  const log = `Request Method : ${req.method} Request URL : ${req.url}`;
  console.log(log);
  next();
};

module.exports = logger;
