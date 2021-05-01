import Relay from 'react-relay';

export default class LikeCommentMutation extends Relay.Mutation {

  getMutation() {
    return Relay.QL`mutation{likeComment}`;
  }
  getFatQuery() {
    return Relay.QL`
      fragment on LikeCommentPayload @relay(pattern: true) {
        comment {
          id,
          text,
          like,
        },
      }
    `;
  }
  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        comment: this.props.comment.id,
      },
    }];
  }
  getVariables() {
    return {
      id: this.props.comment.id,
    };
  }
  getOptimisticResponse() {
    const { id, text, like } = this.props.comment;
    return {
      comment: {
        id,
        text,
        like: like+1,
      }
    };
  }
}
