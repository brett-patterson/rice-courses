import 'bootstrap-loader';
import 'main.scss';

import React from 'react';
import {render} from 'react-dom';
import {Router, Route, Redirect} from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import {Provider} from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import {createStore, combineReducers, applyMiddleware} from 'redux';

import reducers from 'reducers/reducers';
import App from './components/app';
import Courses from './components/courses/courses';
import Me from './components/me/me';
import Help from './components/help/help';


const history = createBrowserHistory();
const store = applyMiddleware(thunkMiddleware)(createStore)(
    combineReducers(reducers)
);

render(
    <Provider store={store}>
        <Router history={history}>
            <Redirect from='/' to='/courses/' />
            <Route path='/' component={App}>
                <Route path='courses/' component={Courses} />
                <Route path='me/' component={Me} />
                <Route path='help/' component={Help} />
            </Route>
        </Router>
    </Provider>,
    document.getElementById('app')
);
