import {Map, List} from 'immutable';

import {
    FETCH_USER_COURSES, ADD_USER_COURSE, REMOVE_USER_COURSE, FETCH_SCHEDULERS,
    ADD_SCHEDULER, REMOVE_SCHEDULER, SET_ACTIVE_SCHEDULER, UPDATE_SCHEDULER
} from 'actions/me';

const initialState = {
    userCourses: new Map(),
    schedulers: new List(),
    activeScheduler: undefined
};


export default function(state=initialState, action) {
    let nextState, course, nextCourses, scheduler;

    switch (action.type) {
    case FETCH_USER_COURSES:
        return Object.assign({}, state, {
            userCourses: action.courses
        });

    case ADD_USER_COURSE:
        course = action.course;
        nextCourses = state.userCourses.set(course.getCRN(), course);
        scheduler = action.schedulers.find(s => s.equals(state.activeScheduler));

        return Object.assign({}, state, {
            userCourses: nextCourses,
            schedulers: action.schedulers,
            activeScheduler: scheduler
        });


    case REMOVE_USER_COURSE:
        course = action.course;
        nextCourses = state.userCourses.delete(course.getCRN());
        scheduler = action.schedulers.find(s => s.equals(state.activeScheduler));

        return Object.assign({}, state, {
            userCourses: nextCourses,
            schedulers: action.schedulers,
            activeScheduler: scheduler
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
        scheduler = action.scheduler;
        nextState = {
            schedulers: state.schedulers.map(s => {
                if (s.equals(scheduler)) return scheduler;
                return s;
            })
        };

        if (state.activeScheduler.equals(scheduler)) {
            nextState.activeScheduler = scheduler;
        }

        return Object.assign({}, state, nextState);

    case SET_ACTIVE_SCHEDULER:
        return Object.assign({}, state, {
            activeScheduler: action.scheduler
        });

    default:
        return state;
    }
}
