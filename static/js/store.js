import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk';

import {fetchCourses} from 'actions/courses';
import {fetchUserCourses, fetchSchedulers} from 'actions/me';
import reducers from 'reducers/reducers';


export default function configureStore() {
    const store = applyMiddleware(thunkMiddleware)(createStore)(
        combineReducers(reducers)
    );

    const state = store.getState();
    store.dispatch(
        fetchCourses(0, state.courses.filters, state.courses.order)
    );
    store.dispatch(fetchUserCourses());
    store.dispatch(fetchSchedulers());

    return store;
}
