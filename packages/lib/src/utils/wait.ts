/**
 * Wait for n milliseconds.
 */
const wait = async n => {
  return new Promise(resolve => {
    setTimeout(resolve, n)
  })
}

export default wait
