import express from 'express'
import { configureRouting } from './src/core/routing';
import { config } from './src/core/config';
const app = express();

app.use(express.json())

configureRouting(app)

app.listen(config.port, () => {
  console.log('Sudoku app listening at: ', config.port)
})
