import { Request, Response } from 'express'

const healthCheck = (_req: Request, res: Response): void => {
  res.status(200).send({
    uptime: process.uptime(),
    message: 'Coolio',
    timestamp: Date.now(),
  })
}

export default healthCheck
