import {
    FETCH_USER_COURSES_COMPLETE, FETCH_SCHEDULERS_COMPLETE
} from 'actions/me';

const initialState = {
    userCourses: new Map(),
    schedulers: []
};


export default function(state=initialState, action) {
    switch (action.type) {
    case FETCH_USER_COURSES_COMPLETE:
        return Object.assign({}, state, {
            userCourses: action.courses
        });

    case FETCH_SCHEDULERS_COMPLETE:
        return Object.assign({}, state, {
            schedulers: action.schedulers
        });

    default:
        return state;
    }
}
