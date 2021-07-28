require('dotenv').config();

let MONGODB_URI = process.env.MONGODB_URI
let SECRET_TOKEN_SEED = process.env.SECRET_TOKEN_SEED
module.exports = {
    MONGODB_URI,
    SECRET_TOKEN_SEED,
}