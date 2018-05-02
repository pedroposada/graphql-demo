import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import registerServiceWorker from './registerServiceWorker'
import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { BrowserRouter } from 'react-router-dom'
import { AUTH_TOKEN } from './constants'
import 'element-theme-default';
import './index.css'
import { ApolloLink, split } from 'apollo-client-preset'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import { withClientState } from 'apollo-link-state'
import * as account from './stores/account'
import { persistCache } from 'apollo-cache-persist'


/**
 * HTTP
 */
const httpLink = new HttpLink({ uri: 'http://localhost:4000' })
const middlewareAuthLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem(AUTH_TOKEN)
  const authorizationHeader = token ? `Bearer ${token}` : null
  operation.setContext({
    headers: {
      authorization: authorizationHeader
    }
  })
  return forward(operation)
})
const httpLinkWithAuthToken = middlewareAuthLink.concat(httpLink)

/**
 * WEB SOCKETS
 */
const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000`,
  options: {
    reconnect: true,
    connectionParams: {
      authToken: localStorage.getItem(AUTH_TOKEN),
    }
  }
})

/**
 * HTTP/WS SPLITTER
 */
const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  httpLinkWithAuthToken,
)

/**
 * LOCAL CACHE
 */
const cache = new InMemoryCache()
persistCache({
  cache,
  storage: window.localStorage
})

/**
 * STATE STORES
 */
const stateLink = withClientState({ 
  cache, 
  typeDefs: `
    ${account.typeDefs}
  `,
  defaults: {
    ...account.defaults
  },
  resolvers: {
    ...account.resolvers
  },
})

/**
 * APOLLO CLIENT
 */
const client = new ApolloClient({
  cache,
  link: ApolloLink.from([stateLink, link]),
  connectToDevTools: true
})

/**
 * RESET STORES when client.resetStore()
 */
client.onResetStore(stateLink.writeDefaults)

/**
 * render app
 */
ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>
  , document.getElementById('root')
)
registerServiceWorker()