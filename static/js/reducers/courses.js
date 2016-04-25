import {FETCH_COURSES_COMPLETE, FETCH_COURSE_COMPLETE} from 'actions/courses';
import {Map} from 'immutable';


const initialState = {
    all: undefined,
    pages: 0,
    page: -1,
    order: 'courseID',
    filters: []
};


export default function(state=initialState, action) {
    let all, next;

    switch (action.type) {
    case FETCH_COURSES_COMPLETE:
        if (state.all === undefined) {
            all = action.courses;
        } else {
            all = state.all.merge(action.courses);
        }

        return Object.assign({}, state, {
            all,
            pages: action.pages,
            page: action.page,
            order: action.order,
            filters: action.filters
        });

    case FETCH_COURSE_COMPLETE:
        next = new Map([[action.course.getCRN(), action.course]]);
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
