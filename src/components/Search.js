import React, { Component } from 'react'
import { Card, Input, Button } from 'element-react';
import { withApollo } from 'react-apollo'
import gql from 'graphql-tag'

class Search extends Component {
  state = {
    filter: ''
  }
  static defaultProps = {
    onSearch: () => null,
    onClear: () => null
  }
  render() {
    return (
      <Card>
        <Input
          value={this.state.filter}
          placeholder="enter search terms"
          onChange={(val) => this.setState({ filter: val })}
          prepend={<Button
            key={2}
            onClick={() => {
              this.setState({ filter: '' })
              this.props.onSearch()
              this.props.onClear()
            }}
            disabled={!this.state.filter}
          >Clear</Button>}
          append={
          <Button
            key={1}
            onClick={this._executeSearch}
            disabled={!this.state.filter}
          >Search</Button>}
          />
      </Card>
    )
  }

  _executeSearch = async () => {
    const { filter } = this.state
    const result = await this.props.client.query({
      query: FEED_SEARCH_QUERY,
      variables: { filter },
    })
    const links = result.data.feed.links
    this.props.onSearch(links)
  }
}

const FEED_SEARCH_QUERY = gql`
  query FeedSearchQuery($filter: String!) {
    feed(filter: $filter) {
      links {
        id
        url
        description
        createdAt
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
    }
  }
`

export default withApollo(Search)
