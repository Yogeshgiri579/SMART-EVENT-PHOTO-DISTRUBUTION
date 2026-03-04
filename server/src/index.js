import './instrument.js' // Sentry must be imported first
import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import * as Sentry from '@sentry/node'
import { connectMongo } from './db/mongoose.js'
import { config } from './config/index.js'
import { errorHandler } from './middleware/errorHandler.js'
import authRoutes from './routes/auth.js'
import eventsRoutes from './routes/events.js'
import deliveriesRoutes from './routes/deliveries.js'

const app = express()

app.use(
  cors({
    origin: true,
    credentials: true,
  })
)
app.use(express.json())

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  })
)

app.use('/api/auth', authRoutes)
app.use('/api/events', eventsRoutes)
app.use('/api/deliveries', deliveriesRoutes)

app.get('/api/health', (req, res) => res.json({ ok: true }))

// Sentry error handler must be before your own error handler
Sentry.setupExpressErrorHandler(app)
app.use(errorHandler)

async function start() {
  await connectMongo()
  app.listen(config.port, () => {
    console.log(`MomentDrop API listening on http://localhost:${config.port}`)
  })
}

start().catch((err) => {
  console.error(err)
  process.exit(1)
})
