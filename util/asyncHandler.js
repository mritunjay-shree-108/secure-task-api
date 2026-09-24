const asyncHandler = (fn) => {
  return (req, res, next) => {
    // execute fn
    // automatically pass rejected errors to next()
    fn(req, res, next).catch(next);
  };
};

module.exports = asyncHandler;
