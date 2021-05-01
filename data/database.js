import Sequelize from 'Sequelize';
import _ from 'lodash';

export class User {};
export class Post {};
export class Comment {};

const sequelize = new Sequelize('todo', 'root', null, {
  host: 'localhost',
  dialect: 'sqlite',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  storage: 'data/todo.sqlite'
});

const UserMD = sequelize.define('user', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  }
});

const PostMD = sequelize.define('post', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  title: {
    type: Sequelize.STRING
  },
  text: {
    type: Sequelize.STRING
  },
  className: {
    type: Sequelize.STRING
  },
  date: {
    type: Sequelize.STRING
  },
  newer: {
    type: Sequelize.STRING
  },
  older: {
    type: Sequelize.STRING
  },
});

const CategoryMD = sequelize.define('category', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  text: {
    type: Sequelize.STRING
  }
});

const CommentMD = sequelize.define('comment', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  text: {
    type: Sequelize.STRING
  },
  date: {
    type: Sequelize.STRING
  },
  like: {
    type: Sequelize.INTEGER
  }
});


UserMD.hasMany(PostMD);
PostMD.belongsTo(UserMD);

CategoryMD.hasMany(PostMD);
PostMD.belongsTo(PostMD);

PostMD.hasMany(CommentMD);
CommentMD.belongsTo(PostMD);



const VIEWER_ID = 'me';
let nextTodoId = 2;
let nextPostId = 2;
let nextCategoryId = 3;
let nextCommentId = 2;

export function addComment({text, postId}) {
  const comment = {
    text,
    id: `${nextCommentId++}`,
    date: '2021-4-01',
    postId
  }
  return CommentMD.create(comment).then((cmt)=>{
    console.log(cmt);
    return cmt.get({ plain: true })});
}

export function likeComment(id) {
  return CommentMD.findAll({ where: { id } }).then((comments)=>{
    const comment = comments[0].get({ plain: true });
    return CommentMD.upsert({...comment, like: comment.like+1}).then(()=>getComment(id))
  });
}

export function getPosts(id = '') {
  if (id) {
    return PostMD.findAll({}).then((posts) => {
      posts = posts.map((post)=>post.get({ plain: true }));
      const index = _.findIndex(posts, (post)=>post.id===id);
      let post = {};
      if (posts.length === 1) {
        post = posts[0];
      } else if(index===0){
        post = {...posts[0],newer: posts[1].id}
      } else if (index===posts.length-1) {
        post = {...posts[index],older: posts[index-1].id}
      } else {
        post = {...posts[index],older: posts[index-1].id, newer:posts[index+1].id}
      }
      return [post];
    })

  }
  return PostMD.findAll({}).then((posts) => {
    return posts.map((post)=>post.get({ plain: true }));
  })
}

export function getPost(id) {
  return PostMD.findAll({where: {id}}).then((posts) => {
    return posts.map((post)=>post.get({ plain: true }));
  })
}

export function getComments(postId) {
  return CommentMD.findAll({where: {postId}}).then((comments) => {
    return comments.map((comment)=>comment.get({ plain: true }));
  })
}

export function getComment(id) {
  return CommentMD.findAll({where: {id}}).then((comments) => {
    return comments[0].get({ plain: true });
  })
}

export function getUser(id) {
  return UserMD.find({id}).then((user) => user.get({ plain: true }));
}

export function getViewer() {
  return getUser(VIEWER_ID);
}

export function removeComment(id) {
  return CommentMD.destroy({ where: { id } });
}
