import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk';

import {fetchTerms} from 'actions/terms';
import {fetchCourses, fetchSubjects} from 'actions/courses';
import {fetchSchedules} from 'actions/schedules';
import {fetchArticles} from 'actions/help';
import reducers from 'reducers/reducers';


export default function configureStore() {
    const store = applyMiddleware(thunkMiddleware)(createStore)(
        combineReducers(reducers)
    );

    store.dispatch(fetchTerms());
    store.dispatch(fetchCourses(0));
    store.dispatch(fetchSchedules());
    store.dispatch(fetchSubjects());
    store.dispatch(fetchArticles());

    return store;
}
