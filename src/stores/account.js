export const typeDefs = `
  type Account {
    name: String
    email: String
    id: String
  }
`

export const defaults = {
  account: {
    __typename: 'Account',
    name: '',
    id: '',
    email: ''
  },
  token: null
}

export const resolvers = {
  Mutation: {
    updateAccount: (_, { name, email, id, token }, { cache }) => {
      cache.writeData({ data: { 
        account: { 
          __typename: 'Account', 
          name, 
          email, 
          id
        },
        token
      }})
      return null
    },
  }
}