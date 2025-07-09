import dotenv from 'dotenv'
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  dbConnectionString: process.env.DB_CONNECTION_STRING || '',
  dbName: process.env.DB_NAME || 'dev'
}
