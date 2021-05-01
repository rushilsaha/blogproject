import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import {IndexRoute, Route, Router} from 'react-router';
import BlogApp from './components/BlogApp';
import PostList from './components/PostList';
import PostPage from './components/PostPage';
import ViewerQueries from './queries/ViewerQueries';

import {createHashHistory} from 'history';
import {applyRouterMiddleware, useRouterHistory} from 'react-router';
const history = useRouterHistory(createHashHistory)({ queryKey: false });
const mountNode = document.getElementById('root');
import useRelay from 'react-router-relay';

import 'react-mdl/extra/material.css';
import 'react-mdl/extra/material.js';

// render for blog
 ReactDOM.render(
   <Router
     environment={Relay.Store}
     history={history}
     render={applyRouterMiddleware(useRelay)}>
     <Route path="/"
       component={BlogApp}
       queries={ViewerQueries}>
       <IndexRoute
         component={PostList}
         queries={ViewerQueries}
       />
       <Route path="post/:id"
         component={PostPage}
         queries={ViewerQueries}
         prepareParams={(params) => ({id: params.id})}
       />
     </Route>
   </Router>,
   mountNode
 );
