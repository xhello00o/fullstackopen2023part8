require('dotenv').config()

const MONGO_DB_PW = process.env.MONGO_DB_PW
const MONGO_DB_USER = process.env.MONGO_DB_USER

const MONGO_DB_URL = `mongodb+srv://${MONGO_DB_USER}:${MONGO_DB_PW}@cluster0.btr3mlg.mongodb.net/apollo?retryWrites=true&w=majority`

module.exports={MONGO_DB_URL}