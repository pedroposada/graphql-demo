import React, { Component } from 'react'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'
import { Table, Button, Tag, Notification, Pagination, Layout, Card } from 'element-react'
import { AUTH_TOKEN, LINKS_PER_PAGE } from '../constants';
import Search from './Search';

class LinkList extends Component {
  state = {
    searchResults: null
  }

  componentDidMount() {
    this._subscribeToNewLinks()
    this._subscribeToNewVotes()
  }

  render() {
    const authToken = localStorage.getItem(AUTH_TOKEN)
    
    if (this.props.feedQuery && this.props.feedQuery.loading) {
      return <div>Loading</div>
    }
    
    if (this.props.feedQuery && this.props.feedQuery.error) {
      return <div>Error</div>
    }
    
    const linksToRender = this.state.searchResults || this.props.feedQuery.feed.links
    
    return (
      <div>
        <Search onClear={() => this.setState({ searchResults: null })} onSearch={this._onSearch} />
        <Table
          emptyText={"Ooops, no data..."}
          stripe
          style={{ width: "100%" }}
          columns={[
            { label: "User's Name", prop: "name" },
            { label: "Id", prop: "id" },
            { label: "Created At", prop: "createdAt", sortable: true },
            { label: "Url", prop: "url" },
            { label: "Description", prop: "description" },
            { label: "Actions", prop: "actions", render: ({ id, description, votes: { length:len } }) => (
            <div>
                <Button onClick={this._voteForLink({ id, description })} disabled={!authToken}>Vote</Button>
                {` `}
                <Tag type="gray">{`${len} ${len !== 1 ? 'votes': 'vote'} `}</Tag>
              </div>
            )},
          ]}
          data={linksToRender.map(({ 
            postedBy, 
            id, 
            createdAt, 
            url, 
            description,
            votes
          }) => ({
            name: postedBy ? postedBy.name : "Unknown",
            id, 
            createdAt, 
            url,
            description,
            votes
          }))}
        />
        { !this.state.searchResults &&
          <Card>
            <Layout.Row justify={"center"} type={"flex"}>
              <Pagination
                layout="prev, pager, next" 
                total={this.props.feedQuery.feed.count} 
                pageSize={LINKS_PER_PAGE}
                onCurrentChange={this._onPageChange}
                currentPage={parseInt(this.props.match.params.page, 10)}
              />
            </Layout.Row>
          </Card>
        }
      </div>
    )
  }

  _onPageChange = (newCurrent) => {
    this.props.history.push(`/new/${newCurrent}`)
  }

  _onSearch = (searchResults) => {
    this.setState({ searchResults })
  }
    
  _voteForLink = ({id:linkId, description}) => async () => {
    try {
      await this.props.voteMutation({
        variables: {
          linkId,
        },
        // _updateCacheAfterVote
        update: (store, { data: { vote:createVote } }) => {
          const page = parseInt(this.props.match.params.page, 10)
          const skip = (page - 1) * LINKS_PER_PAGE
          const first = LINKS_PER_PAGE
          const orderBy = 'createdAt_DESC'
          const data = store.readQuery({ query: FEED_QUERY, variables: { first, skip, orderBy } })
          
          const votedLink = data.feed.links.find(link => link.id === linkId)
          votedLink.votes = createVote.link.votes

          store.writeQuery({ query: FEED_QUERY, data })
        },
      })
    } catch (e) {
      Notification({
        title: "Failed",
        message: e.message,
        type: "error",
        duration: 900
      })
    }
  }

  _subscribeToNewLinks = () => {
    this.props.feedQuery.subscribeToMore({
      document: gql`
        subscription {
          newLink {
            node {
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
      `,
      updateQuery: (previous, { subscriptionData }) => {
        const newAllLinks = [subscriptionData.data.newLink.node, ...previous.feed.links]
        const result = {
          ...previous,
          feed: {
            ...previous.feed,
            links: newAllLinks
          },
        }
        return result
      },
    })
  }

  _subscribeToNewVotes = () => {
    this.props.feedQuery.subscribeToMore({
      document: gql`
        subscription {
          newVote {
            node {
              id
              link {
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
              user {
                id
              }
            }
          }
        }
      `,
    })
  }
}

export const FEED_QUERY = gql`
  query FeedQuery($first: Int, $skip: Int, $orderBy: LinkOrderByInput) {
    feed(first: $first, skip: $skip, orderBy: $orderBy) {
      count
      links {
        id
        createdAt
        url
        description
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

const VOTE_MUTATION = gql`
  mutation VoteMutation($linkId: ID!) {
    vote(linkId: $linkId) {
      id
      link {
        votes {
          id
          user {
            id
          }
        }
      }
      user {
        id
      }
    }
  }
`

export default compose(
  graphql(VOTE_MUTATION, { name: 'voteMutation' }),
  graphql(FEED_QUERY, {
    name: 'feedQuery',
    options: (ownProps) => {
      const page = parseInt(ownProps.match.params.page, 10)
      const skip = (page - 1) * LINKS_PER_PAGE
      const first = LINKS_PER_PAGE
      const orderBy = 'createdAt_DESC'
      return {
        variables: { first, skip, orderBy },
      }
    },
  })
)(LinkList)
