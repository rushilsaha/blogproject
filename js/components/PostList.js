import React from 'react';
import Relay from 'react-relay';
import { Layout, Content, Grid, Cell, Card, CardTitle, CardText, FABButton, Icon } from 'react-mdl';
import { Link } from 'react-router';

class PostList extends React.Component {

  getHeader() {
    const { posts } = this.props.viewer;
  }

  renderPosts() {
    return this.props.viewer.posts.edges.map((post, i) =>
      {
        const { className, title, text, id } = post.node;
        console.log(id);
        return <Cell col={12} key={i}>
          <Card className={className} style={{width: '100%'}}>
            <CardTitle className={`mdl-card__${className==='amazing'?'title':'media'} mdl-color-text--grey-50`}>
              <h3 className={className==='amazing'?'quote':''}><Link to={`post/${id}`}>{title}</Link></h3>
            </CardTitle>
            <CardText>
                {text}
            </CardText>
            <div className="mdl-card__supporting-text meta mdl-color-text--grey-600">
              <div className="minilogo"></div>
              <div>
                <b>Washington Post</b>
                <span>2 days ago</span>
              </div>
            </div>
          </Card>
          </Cell>
      }
    );
  }

  render() {

    return (
      <Grid className="demo-blog__posts">
        {this.getHeader()}
        {this.renderPosts()}
     </Grid>)
  }
}

export default Relay.createContainer(PostList, {

  fragments: {
    viewer: () => Relay.QL`
      fragment on User {
        posts(
          id: "",
          first: 2147483647  # max GraphQLInt
        ) {
          edges {
            node {
              id,
              className,
              title,
              text,
            }
          }
        }
      },

    `,
  },
});
