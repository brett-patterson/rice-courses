import 'bootstrap-loader';
import 'main.css';

import React from 'react';
import {render} from 'react-dom';
import {Router, Route, Redirect, browserHistory} from 'react-router';

import App from './app';
import Courses from './courses/courses';
import Me from './me/me';
import Help from './help/help';

render(
    <Router history={browserHistory}>
        <Redirect from='/' to='/courses/' />
        <Route path='/' component={App}>
            <Route path='courses/' component={Courses} />
            <Route path='me/' component={Me} />
            <Route path='help/' component={Help} />
        </Route>
    </Router>,
    document.getElementById('app')
);
