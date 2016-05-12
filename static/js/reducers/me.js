import {Map, List} from 'immutable';

import {
    FETCH_USER_COURSES, SET_USER_COURSE, FETCH_SCHEDULERS, ADD_SCHEDULER,
    REMOVE_SCHEDULER, SET_ACTIVE_SCHEDULER, UPDATE_SCHEDULER
} from 'actions/me';

const initialState = {
    userCourses: new Map(),
    schedulers: new List(),
    activeScheduler: undefined
};


export default function(state=initialState, action) {
    let course, nextCourses;

    switch (action.type) {
    case FETCH_USER_COURSES:
        return Object.assign({}, state, {
            userCourses: action.courses
        });

    case SET_USER_COURSE:
        course = action.course;

        if (action.action === 'added') {
            nextCourses = state.userCourses.set(course.getCRN(), course);
        } else {
            nextCourses = state.userCourses.delete(course.getCRN());
        }

        return Object.assign({}, state, {
            userCourses: nextCourses
        });

    case FETCH_SCHEDULERS:
        return Object.assign({}, state, {
            schedulers: action.schedulers
        });

    case ADD_SCHEDULER:
        return Object.assign({}, state, {
            schedulers: state.schedulers.push(action.scheduler)
        });

    case REMOVE_SCHEDULER:
        return Object.assign({}, state, {
            schedulers: state.schedulers.filter(s => !s.equals(action.scheduler))
        });

    case UPDATE_SCHEDULER:
        return Object.assign({}, state, {
            schedulers: state.schedulers.map(s => {
                if (s.equals(action.scheduler)) return action.scheduler;
                return s;
            })
        });

    case SET_ACTIVE_SCHEDULER:
        return Object.assign({}, state, {
            activeScheduler: action.scheduler
        });

    default:
        return state;
    }
}
