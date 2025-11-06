const healthCheck = (req, res) => {
  res.send({
    uptime: process.uptime(),
    message: 'Coolio',
    timestamp: Date.now(),
  })
}

export default healthCheck
