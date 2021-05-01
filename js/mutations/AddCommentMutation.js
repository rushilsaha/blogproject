import Relay from 'react-relay';

export default class AddCommentMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation{addComment}`;
  }
  getFatQuery() {
    return Relay.QL`
      fragment on AddCommentPayload @relay(pattern: true) {
        commentEdge,
        post {
          comments
        }
      }
    `;
  }
  getConfigs() {
    return [{
      type: 'RANGE_ADD',
      parentName: 'post',
      parentID: this.props.post.id,
      connectionName: 'comments',
      edgeName: 'commentEdge',
      rangeBehaviors: () => 'append',
    }];
  }
  getVariables() {
    return {
      text: this.props.text,
      postId: this.props.post.id
    };
  }
  getOptimisticResponse() {
    return {
      commentEdge: {
        node: {
          text: this.props.text,
        },
      },
    };
  }
}
