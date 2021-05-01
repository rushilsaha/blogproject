import Relay from 'react-relay';

export default class RemoveCommentMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation{removeComment}`;
  }
  getFatQuery() {
    return Relay.QL`
      fragment on RemoveCommentPayload @relay(pattern: true) {
        deletedCommentId,
        post {
          comments
        }
      }
    `;
  }
  getConfigs() {
    return [{
      type: 'NODE_DELETE',
      parentName: 'post',
      parentID: this.props.postId,
      connectionName: 'comments',
      deletedIDFieldName: 'deletedCommentId',
    }];
  }
  getVariables() {
    return {
      id: this.props.id,
      postId: this.props.postId
    };
  }
  getOptimisticResponse() {
    return {
      deletedCommentId: this.props.id,
    };
  }
}
