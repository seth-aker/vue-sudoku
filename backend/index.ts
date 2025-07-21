import express from 'express'
import { configureRouting } from "./src/core/routing/index.ts";
import { config } from "./src/core/config/index.ts";
const app = express();

app.use(express.json())

configureRouting(app)

app.listen(config.port, () => {
  console.log('Sudoku app listening at: ', config.port)
})
