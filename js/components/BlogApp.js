import React from 'react';
import Relay from 'react-relay';
import { Layout, Content, Grid, Cell, Card, CardTitle, CardText, FABButton, Icon } from 'react-mdl';

class BlogApp extends React.Component {

  render() {
    const { posts } = this.props.viewer;

    return (
      <div>
        <Layout className="demo-blog">
          <Content>
            {this.props.children}
            <footer className="mdl-mini-footer">
                Contact me: rushilsaha@gmail.com
            </footer>
          </Content>
        </Layout>
      </div>
    );
  }
}

export default Relay.createContainer(BlogApp, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on User {
        id
      }
    `
  },
});
