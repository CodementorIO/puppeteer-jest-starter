module.exports.wrapErrorHandler = function(original, driverName = '') {
  const driver = {}
  Object.keys(original).forEach((key) => {
    if (typeof original[key] !== 'function') {
      return
    }
    driver[key] = async (...args) => {
      try {
        await original[key](...args)
      } catch (originalErr) {
        const e = new Error(
          `${driverName} driver action failed: "${key}". Underlying error: \n${originalErr.message}`
        )
        appendErrorStack(e, originalErr)
        e.original = original
        throw e
      }
    }
  })
  return driver
}

function appendErrorStack(e, original) {
  e.stack =
    e.stack
      .split('\n')
      .slice(0, 2)
      .join('\n') +
    '\n' +
    original.stack
}
