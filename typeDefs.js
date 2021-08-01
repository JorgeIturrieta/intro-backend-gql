const { gql } = require('apollo-server-express')
module.exports.typeDefs = gql`
 
type Address {
    street: String!
    city: String! 
  }

type User {
    username: String!
    friends: [Person!]!
    id: ID!
  }
type Token {
  value: String!
  }
type Person {
    name: String!
    phone: String
    address: Address!
    id: ID!
    friendOf: [User!]!
  }
  
  enum YesNo {
    YES
    NO
  } 
  
  type Query {
    me:User
    personCount: Int!
    allPersons(phone: YesNo): [Person!]!
    findPerson(name: String!): Person
  } 
  type Mutation {
    createUser(
      username: String!
    ): User

    login(
      username: String!
      password: String!
    ): Token

    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person

    editNumber(
      name: String!
      phone: String!
    ): Person

    addAsFriend(
      name: String!
    ): User
  }
  type Subscription {
  personAdded: Person!
  }

`