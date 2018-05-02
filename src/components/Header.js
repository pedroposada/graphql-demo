import React, { Component } from 'react'
import { Menu, Layout } from 'element-react'
import { withRouter } from 'react-router'
import { AUTH_TOKEN } from '../constants'
import { compose, graphql } from 'react-apollo'
import FaUser from 'react-icons/lib/fa/user'
import FaHome from 'react-icons/lib/fa/home'
import styled from 'styled-components'
import gql from 'graphql-tag'

class Header extends Component {
  render() {
    const authToken = localStorage.getItem(AUTH_TOKEN)
    return (
      <Menu key='0' mode="horizontal" onSelect={this.onSelect} defaultActive={this.props.location.pathname}>
        <Layout.Row type="flex" justify="end">
          <Layout.Col offset={0}>
            <Menu.Item index="/"><FaHome size={32}/></Menu.Item>
          </Layout.Col>
          <StyledSubMenu index="actions" 
            title={authToken 
              ? <StyledAvatar>{this.props.accountQuery.account.name.slice(0, 1)}</StyledAvatar> 
              : <FaUser size={32}/>}
            >
            {authToken &&
              <Menu.Item index="/create">
                Create new link
              </Menu.Item>
            }
            {!authToken &&
              <Menu.Item index="/login">
                Login
              </Menu.Item>
            }
            {authToken &&
              <Menu.Item index="/logout">
                Logout
              </Menu.Item>
            }
          </StyledSubMenu>
        </Layout.Row>
      </Menu>
    )
  }

  onSelect = (index) => {
    if (index === "/logout") {
      localStorage.clear()
      this.props.history.push("/")
      return
    }
    if (this.props.location !== index) {
      this.props.history.push(index)
    }
  }
}

const StyledAvatar = styled.div`
  border-radius: 50%;
  font-size: 30px;
  width: 40px;
  height: 40px;
  text-align: center;
  color: #E5E9F2;
  float: left;
  background-color: #FFF;
  line-height: 40px;
  margin-top: 10px;
  text-transform: uppercase;
`

const StyledSubMenu = styled(Menu.SubMenu)`
  &&& ul.el-menu {
    left: auto;
    right: 0;
    top: auto;
    
    & li.el-menu-item {
      min-width: auto;
    }
  }
`

const ACCOUNT_QUERY = gql`
  query AccountQuery {
    account @client {
      name
    }
  }
`

export default compose(
  withRouter,
  graphql(ACCOUNT_QUERY, { name: 'accountQuery' })
)(Header)
