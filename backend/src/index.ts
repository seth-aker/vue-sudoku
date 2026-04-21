import express from 'express'
import { configureRouting } from "./core/routing/index";
import { config } from "./core/config/index";
import cors from 'cors'
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { sessionHandler } from './feature/auth/handler/sessionHandler';
const app = express();

app.use(express.json())

if(process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1)
  app.use(cors({
    origin: config.origin
  }))
  app.use(helmet())
  app.use(rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minute window
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false
  }))
}

app.use(sessionHandler())
configureRouting(app)

app.listen(config.port, () => {
  console.log('Sudoku app listening at:', config.port)
})
