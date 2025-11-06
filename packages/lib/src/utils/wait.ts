/**
 * Wait for n milliseconds.
 */
const wait = async (n: number): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(resolve, n)
  })
}

export default wait
