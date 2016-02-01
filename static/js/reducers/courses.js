import {
    FETCH_COURSES_COMPLETE, FETCH_USER_COURSES_COMPLETE
} from 'actions/courses';


const initialState = {
    all: undefined,
    pages: 0,
    page: -1,
    order: 'courseID',
    filters: []
};


export default function(state=initialState, action) {
    switch (action.type) {
    case FETCH_COURSES_COMPLETE:
        return Object.assign({}, state, {
            all: action.courses,
            pages: action.pages,
            page: action.page,
            order: action.order,
            filters: action.filters
        });

    case FETCH_USER_COURSES_COMPLETE:
        return Object.assign({}, state, {
            userCourses: action.courses
        });

    default:
        return state;
    }
}
