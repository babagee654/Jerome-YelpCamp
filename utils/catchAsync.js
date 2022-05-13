// Wrap async functions using this function to catch all errors.
module.exports = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(err => next(err))
    }
}