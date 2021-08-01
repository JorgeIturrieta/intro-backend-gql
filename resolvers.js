const { UserInputError,AuthenticationError } = require('apollo-server-express')
const { PubSub } = require('graphql-subscriptions')
const Person = require('./models/Person')
const User = require('./models/User')
const jwt = require('jsonwebtoken')
const {  SECRET_TOKEN_SEED } = require('./utils/envConfig');
const pubsub = new PubSub()  // Suscripcion

module.exports.resolvers = {
    Query: {
      personCount: () => Person.collection.countDocuments(),
      allPersons: (root, args) => {
        if(!args.phone) {
          // Si no existe el parametro Busca todos los usuarios
          return Person.find({})
        }
        return Person.find({ phone: { $exists: args.phone === 'YES'  }})
      },
      findPerson: (root, args) => Person.findOne({ name: args.name }),
      me: (root, args, context) => {
        return context.currentUser
      }
    },
    Person: {
      address: root => {
        return {
          street: root.street,
          city: root.city
        }
      },
      friendOf: async (root) => {
        // return list of users 
       const friends = await User.find({
        friends: {
          $in: [root._id]
        } 
      })

      return friends
      },
    },

    Mutation: {
      addPerson: async (root, args, context) => {
        const person = new Person({ ...args })
        const currentUser = context.currentUser
        
        if (!currentUser) {
          throw new AuthenticationError("not authenticated")
        }
    
        try {
          await person.save()
          // Almacena la presona recien creado como amigo al usuario actual 
          currentUser.friends = currentUser.friends.concat(person)
          await currentUser.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
        pubsub.publish('PERSON_ADDED', { personAdded: person })
        
  
        return person
      },
      createUser: (root, args) => {
        const user = new User({ username: args.username })
    
        return user.save()
          .catch(error => {
            throw new UserInputError(error.message, {
              invalidArgs: args,
            })
          })
      },
  
  
      login: async (root, args) => {
        const user = await User.findOne({ username: args.username })
       
        if ( !user || args.password !== 'secred' ) {
          throw new UserInputError("wrong credentials")
        }
    
        const userForToken = {
          username: user.username,
          id: user._id,
        }
    
        return { value: jwt.sign(userForToken, SECRET_TOKEN_SEED) }
      },
  
      editNumber: async (root, args) => {
        const person = await Person.findOne({ name: args.name })
        person.phone = args.phone
        
        try {
          await person.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
        return person
      } ,
      addAsFriend: async (root, args, { currentUser }) => {
        const nonFriendAlready = (person) => 
          !currentUser.friends.map(f => f._id).includes(person._id)
    
        if (!currentUser) {
          throw new AuthenticationError("not authenticated")
        }
    
        const person = await Person.findOne({ name: args.name })
        if ( nonFriendAlready(person) ) {
          currentUser.friends = currentUser.friends.concat(person)
        }
    
        await currentUser.save()
    
        return currentUser
      },
    },
    Subscription: {
      personAdded: {
        subscribe: () => pubsub.asyncIterator(['PERSON_ADDED'])
      },
    },
  }