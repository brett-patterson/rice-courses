import {FETCH_COURSES, FETCH_COURSE} from 'actions/courses';
import {OrderedMap} from 'immutable';


const initialState = {
    all: undefined,
    filtered: undefined,
    pages: 0,
    page: -1,
    order: 'courseID',
    filters: []
};


export default function(state=initialState, action) {
    let all, next;

    switch (action.type) {
    case FETCH_COURSES:
        if (state.all === undefined) {
            all = action.courses;
        } else {
            all = state.all.merge(action.courses);
        }

        return Object.assign({}, state, {
            all,
            filtered: action.courses,
            pages: action.pages,
            page: action.page,
            order: action.order,
            filters: action.filters
        });

    case FETCH_COURSE:
        next = new OrderedMap([[action.course.getCRN(), action.course]]);
        if (state.all === undefined) {
            all = next;
        } else {
            all = state.all.merge(next);
        }

        return Object.assign({}, state, {
            all
        });

    default:
        return state;
    }
}
