import Term from 'models/term';
import {fetchCourses} from './courses';

export const FETCH_TERMS = 'FETCH_TERMS';
export function fetchTerms() {
    return dispatch => {
        Term.fetchAll().then(({current, terms}) => {
            dispatch({
                type: FETCH_TERMS,
                terms,
                current
            });
        });
    };
}

export const SWITCH_TERM = 'SWITCH_TERM';
export function switchTerm(term) {
    return (dispatch, getState) => {
        dispatch({
            type: SWITCH_TERM,
            term
        });

        const state = getState();
        dispatch(fetchCourses(
            state.courses.page, state.courses.filters, state.courses.order,
            term
        ));
    };
}
