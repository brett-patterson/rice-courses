import {FETCH_COURSES, FETCH_COURSE, FETCH_SUBJECTS} from 'actions/courses';
import {OrderedMap, Map} from 'immutable';


const initialState = {
    all: undefined,
    filtered: undefined,
    pages: 0,
    page: -1,
    query: '',
    filters: new Map(),
    subjects: []
};


export default function(state=initialState, action) {
    let all, next;

    switch (action.type) {
    case FETCH_COURSES:
        if (state.all === undefined || action.clearAll) {
            all = action.courses;
        } else {
            all = state.all.merge(action.courses);
        }

        return Object.assign({}, state, {
            all,
            filtered: action.courses,
            pages: action.pages,
            page: action.page,
            query: action.query,
            filters: action.filters || new Map()
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

    case FETCH_SUBJECTS:
        return Object.assign({}, state, {
            subjects: action.subjects
        });

    default:
        return state;
    }
}
