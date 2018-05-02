import React, { Component } from 'react'
import { Input, Button, Layout, Card } from 'element-react'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { FEED_QUERY } from './LinkList';
import { LINKS_PER_PAGE } from '../constants';

class CreateLink extends Component {
  state = {
    description: '',
    url: '',
  }

  onFormChange = (key) => (val) => {
    this.setState({ [key]: val })
  }
  
  onReset = () => {
    this.setState({ description: '', url: '' })
  }
  
  onSave = () => {
    this._createLink()
    this.onReset()
  }

  render() {
    return (
      <Card>
        <Layout.Row >
          <Input
            placeholder="Description" 
            value={this.state.description}
            autoFocus
            onChange={this.onFormChange('description')}
            />
        </Layout.Row>
        <Layout.Row >
          <Input 
            placeholder="Url" 
            value={this.state.url} 
            onChange={this.onFormChange('url')}
            />
        </Layout.Row>
        <Layout.Row >
          <Button 
            type={"primary"} 
            onClick={this.onSave}
            icon={"check"}
            disabled={!this.state.description || !this.state.url}
            >Save</Button>
          <Button 
            icon="delete"
            onClick={this.onReset}
            >Reset</Button>
        </Layout.Row>
      </Card>
    )
  }

  _createLink = async () => {
    const { description, url } = this.state
    await this.props.postMutation({
      variables: {
        description,
        url
      },
      update: (store, { data: { post } }) => {
        const skip = 0
        const first = LINKS_PER_PAGE
        const orderBy = 'createdAt_DESC'

        const data = store.readQuery({ 
          query: FEED_QUERY,
          variables: { first, skip, orderBy } 
        })
        data.feed.links.splice(0, 0, post)
        store.writeQuery({ 
          query: FEED_QUERY, 
          data,
          variables: { first, skip, orderBy } 
        })
      },
    })
    this.props.history.push("/")
  }
}

const POST_MUTATION = gql`
  mutation PostMutation($description: String!, $url: String!) {
    post(description: $description, url: $url) {
      id
      createdAt
      url
      description
    }
  }
`

export default graphql(POST_MUTATION, { name: 'postMutation' })(CreateLink)