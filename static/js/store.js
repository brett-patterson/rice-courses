import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk';

import {fetchTerms} from 'actions/terms';
import {fetchCourses} from 'actions/courses';
import {fetchSchedules} from 'actions/schedules';
import reducers from 'reducers/reducers';


export default function configureStore() {
    const store = applyMiddleware(thunkMiddleware)(createStore)(
        combineReducers(reducers)
    );

    store.dispatch(fetchTerms());

    const state = store.getState();
    store.dispatch(
        fetchCourses(0, state.courses.filters, state.courses.order, state.terms.current)
    );
    store.dispatch(fetchSchedules());

    return store;
}
