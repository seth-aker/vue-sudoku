import express from 'express'
import { configureRouting } from './src/core/routing/index';
import { config } from './src/core/config/index';
const app = express();

app.use(express.json())

configureRouting(app)

app.listen(config.port, () => {
  console.log('Sudoku app listening at: ', config.port)
})
