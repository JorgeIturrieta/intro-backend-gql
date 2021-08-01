const jwt = require('jsonwebtoken')
const { SECRET_TOKEN_SEED } = require('./utils/envConfig')
const User = require('./models/User')

exports.getUser = async (token) => {
  
          const decodedToken = jwt.verify(token, SECRET_TOKEN_SEED)
          const currentUser = await User.findById(decodedToken.id).populate('friends')
          return currentUser
}