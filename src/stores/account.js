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
  }
}

export const resolvers = {
  Mutation: {
    updateAccount: (_, { name, email, id }, { cache }) => {
      cache.writeData({ data: { 
        account: { 
          name, 
          email, 
          id, 
          __typename: 'Account' 
        }
      }})
      return null
    },
  }
}