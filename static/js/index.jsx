import 'bootstrap-loader';
import 'main.scss';

import React from 'react';
import {render} from 'react-dom';
import {Router, Route, Redirect} from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';

import App from './components/app';
import Courses from './components/courses/courses';
import Me from './components/me/me';
import Help from './components/help/help';

const history = createBrowserHistory();

render(
    <Router history={history}>
        <Redirect from='/' to='/courses/' />
        <Route path='/' component={App}>
            <Route path='courses/' component={Courses} />
            <Route path='me/' component={Me} />
            <Route path='help/' component={Help} />
        </Route>
    </Router>,
    document.getElementById('app')
);
