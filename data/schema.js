import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
  cursorForObjectInConnection,
  fromGlobalId,
  globalIdField,
  mutationWithClientMutationId,
  nodeDefinitions,
  toGlobalId,
  offsetToCursor,
} from 'graphql-relay';

import {
  User,
  Category,
  getCategory,
  getCategories,
  Post,
  getPost,
  getPosts,
  Comment,
  addComment,
  getComment,
  getComments,
  removeComment,
  likeComment,
  getUser,
  getViewer,

} from './database';

const {nodeInterface, nodeField} = nodeDefinitions(
  (globalId) => {
    const {type, id} = fromGlobalId(globalId);
    if (type === 'User') {
      return getUser(id);
    } else if (type === 'Category') {
      return getCategory(id);
    } else if (type === 'Post') {
      return getPost(id);
    } else if (type === 'Comment') {
      return getComment(id);
    }
    return null;
  },
  (obj) => {
    if (obj instanceof User) {
      return GraphQLUser;
    } else if (obj instanceof Category) {
      return GraphQLCategory;
    } else if (obj instanceof Post) {
      return GraphQLPost;
    } else if (obj instanceof Comment) {
      return GraphQLComment;
    }
    return null;
  }
);




const GraphQLComment = new GraphQLObjectType({
  name: 'Comment',
  fields: {
    id: globalIdField('Comment'),
    text: {
      type: GraphQLString,
      resolve: (obj) => obj.text,
    },
    date: {
      type: GraphQLString,
      resolve: (obj) => obj.date,
    },
    like: {
      type: GraphQLInt,
      resolve: (obj) => obj.like,
    }
  },
  interfaces: [nodeInterface],
});

const {
  connectionType: CommentsConnection,
  edgeType: GraphQLCommentEdge,
} = connectionDefinitions({
  name: 'Comment',
  nodeType: GraphQLComment,
});

const GraphQLPost = new GraphQLObjectType({
  name: 'Post',
  fields: {
    id: globalIdField('Post'),
    title: {
      type: GraphQLString,
      resolve: (obj) => obj.title,
    },
    className: {
      type: GraphQLString,
      resolve: (obj) => obj.className,
    },
    text: {
      type: GraphQLString,
      resolve: (obj) => obj.text,
    },
    date: {
      type: GraphQLString,
      resolve: (obj) => obj.date,
    },
    categoryId: {
      type: GraphQLString,
      resolve: (obj) => obj.categoryId,
    },
    comments: {
      type: CommentsConnection,
      args: {
        postId: {
          type: GraphQLString,
          defaultValue: '',
        },
        ...connectionArgs,
      },
      resolve: (obj, {postId, ...args}) => getComments(postId?fromGlobalId(postId).id:postId).then((comments)=>connectionFromArray(comments, args)),
    },
    newer: {
      type: GraphQLString,
      resolve: (obj) => obj.newer?toGlobalId('Post', obj.newer):obj.newer,
    },
    older: {
      type: GraphQLString,
      resolve: (obj) => obj.older?toGlobalId('Post', obj.older):obj.older,
    },
  },
  interfaces: [nodeInterface],
});

const {
  connectionType: PostsConnection,
  edgeType: GraphQLPostEdge,
} = connectionDefinitions({
  name: 'Post',
  nodeType: GraphQLPost,
});

const GraphQLCategory = new GraphQLObjectType({
  name: 'Category',
  fields: {
    id: globalIdField('Category'),
    text: {
      type: GraphQLString,
      resolve: (obj) => obj.text,
    },
  },
  interfaces: [nodeInterface],
});

const {
  connectionType: CategoriesConnection,
  edgeType: GraphQLCategoryEdge,
} = connectionDefinitions({
  name: 'Category',
  nodeType: GraphQLCategory,
});

const GraphQLUser = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: globalIdField('User'),
    posts: {
      type: PostsConnection,
      args: {
        id: {
          type: GraphQLString,
          defaultValue: '',
        },
        ...connectionArgs,
      },
      resolve: (obj, {id, ...args}) => getPosts(id?fromGlobalId(id).id:id).then((posts)=>connectionFromArray(posts, args)),
    },
    categories: {
      type: CategoriesConnection,
      args: {
        status: {
          type: GraphQLString,
          defaultValue: 'any',
        },
        ...connectionArgs,
      },
      resolve: (obj, {status, ...args}) => getCategories(status).then((categories)=>connectionFromArray(categories, args)),
    },
  },
  interfaces: [nodeInterface],
});

const Root = new GraphQLObjectType({
  name: 'Root',
  fields: {
    viewer: {
      type: GraphQLUser,
      resolve: () => getViewer(),
    },
    node: nodeField,
  },
});

const GraphQLAddCommentMutation = mutationWithClientMutationId({
  name: 'AddComment',
  inputFields: {
    text: { type: new GraphQLNonNull(GraphQLString) },
    postId: { type: new GraphQLNonNull(GraphQLString) },
  },
  outputFields: {
    commentEdge: {
      type: GraphQLCommentEdge,
      resolve: (comment) => comment,
    },
    post: {
      type: GraphQLPost,
      resolve: (comment) => getPost(comment.postId),
    }
  },
  mutateAndGetPayload: ({text, postId}) => {
    console.log('fromGlobalId(postId)------', fromGlobalId(postId));
    const { id } = fromGlobalId(postId);
    return addComment({text, postId: id}).then((comment)=> getComments(id).then((comments) => ({
        // cursor: cursorForObjectInConnection(todos, todo),
        cursor: offsetToCursor(comments, comment),
        node: comment,
      })));
  },
});

const GraphQLLikeCommentMutation = mutationWithClientMutationId({
  name: 'LikeComment',
  inputFields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  outputFields: {
    comment: {
      type: GraphQLComment,
      resolve: (comment) => comment,
    }
  },
  mutateAndGetPayload: ({id}) => {
    const localCommentId = fromGlobalId(id).id;
    return likeComment(localCommentId).then((cmt)=>{
      console.log('mutateAndGetPayload-----------------', cmt);
      return cmt;
    });
  },
});


const GraphQLRemoveCommentMutation = mutationWithClientMutationId({
  name: 'RemoveComment',
  inputFields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    postId: { type: new GraphQLNonNull(GraphQLID) },
  },
  outputFields: {
    deletedCommentId: {
      type: GraphQLID,
      resolve: ({id}) => id,
    },
    post: {
      type: GraphQLPost,
      resolve: ({removePromise, postId}) => removePromise.then(()=>getPost(postId)),
    }
  },
  mutateAndGetPayload: ({id, postId}) => {
    const localTodoId = fromGlobalId(id).id;
    return {id, removePromise: removeComment(localTodoId), postId };
  },
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addComment: GraphQLAddCommentMutation,
    removeComment: GraphQLRemoveCommentMutation,
    likeComment: GraphQLLikeCommentMutation,
   },
});

export const schema = new GraphQLSchema({
  query: Root,
  mutation: Mutation,
});
