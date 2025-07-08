import express, { Application } from "express";

export const configureRouting = (app: Application) => {
  const router = express.Router()
  app.use('/api', router)

}
