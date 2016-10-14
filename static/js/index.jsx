import 'bootstrap-loader';
import 'main.scss';
import 'es6-shim';

import React from 'react';
import {render} from 'react-dom';
import {Router, Route, Redirect} from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import {Provider} from 'react-redux';


import configureStore from './store';
import App from './components/app';
import Courses from './components/courses/courses';
import Schedule from './components/schedule/schedule';
import CourseDetail from './components/detail/courseDetail';
import Help from './components/help/help';


const history = createBrowserHistory();
const store = configureStore();

render(
    <Provider store={store}>
        <Router history={history}>
            <Redirect from='/' to='/courses' />
            <Route path='/' component={App}>
                <Route path='courses' component={Courses}>
                    <Route path=':crn' component={CourseDetail} />
                </Route>

                <Route path='schedule/:id' component={Schedule}>
                    <Route path=':crn' component={CourseDetail} />
                </Route>

                <Route path='help' component={Help} />
            </Route>
        </Router>
    </Provider>,

    document.getElementById('app')
);
