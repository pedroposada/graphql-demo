import React, { Component } from 'react'
import { AUTH_TOKEN } from '../constants'
import { Card, Input, Button, Tooltip } from 'element-react';
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'

class Login extends Component {
  state = {
    login: true, // switch between Login and SignUp
    email: '',
    password: '',
    name: '',
    tooltip: false
  }

  render() {
    return (
      <Card>
        { !this.state.login &&
          <Input 
            placeholder="name"
            onChange={(val) => this.setState({ name: val })}
            />
        }
        <Tooltip 
          effect="dark" 
          content="Your email/password is not correct" 
          placement="top" 
          manual 
          visible={this.state.tooltip}
          >
          <Input
            placeholder="email"
            autoFocus
            onChange={(val) => this.setState({ tooltip: false, email: val })}
            />
          <Input
            placeholder="password"
            type="password"
            autoComplete="off"
            onChange={(val) => this.setState({ tooltip: false, password: val })}
          />
        </Tooltip>
        <Button 
          type="primary"
          onClick={this._confirm}
          disabled={!this.state.email || !this.state.password || (!this.state.login && !this.state.name)}
          >
          { this.state.login 
            ? "Login" 
            : "Create account"
          }</Button>
        <Button 
          primary 
          onClick={() => this.setState({ login: !this.state.login, tooltip: false })}>
          { this.state.login 
            ? "Need to create an account?" 
            : "Already have an account?"
          }</Button>
      </Card>
    )
  }

  _confirm = async () => {
    const { name, email, password } = this.state
    if (this.state.login) {
      try {
        const result = await this.props.loginMutation({
          variables: {
            email,
            password,
          },
        })
        const account = result.data.login
        this._saveUserData(account)
      } catch (e) {
        this.setState({ tooltip: true })
        return
      }
    } else {
      const result = await this.props.signupMutation({
        variables: {
          name,
          email,
          password,
        },
      })
      const account = result.data.signup
      this._saveUserData(account)
    }
    this.props.history.push(`/`)
  }
  
  _saveUserData = ({ token, user: { name, id, email } }) => {
    localStorage.setItem(AUTH_TOKEN, token)
    this.props.accountMutation({ variables: { name, id, email } })
  }
}

const SIGNUP_MUTATION = gql`
  mutation SignupMutation($email: String!, $password: String!, $name: String!) {
    signup(email: $email, password: $password, name: $name) {
      token
      user {
        id
        name
        email
      }
    }
  }
`

const LOGIN_MUTATION = gql`
  mutation LoginMutation($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`

const ACCOUNT_MUTATION = gql`
  mutation AccountMutation($email: String!, $name: String!, $name: String!) {
    updateAccount(email: $email, name: $name, id: $id) @client
  }
`

export default compose(
  graphql(SIGNUP_MUTATION, { name: 'signupMutation' }),
  graphql(LOGIN_MUTATION, { name: 'loginMutation' }),
  graphql(ACCOUNT_MUTATION, { name: 'accountMutation' }),
)(Login)