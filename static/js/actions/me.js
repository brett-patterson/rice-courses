import UserCourses from 'models/userCourses';
import Scheduler from 'models/scheduler';

export const FETCH_USER_COURSES = 'FETCH_USER_COURSES';
export function fetchUserCourses() {
    return dispatch => {
        UserCourses.get().then(courses => {
            dispatch({
                type: FETCH_USER_COURSES,
                courses
            });
        });
    };
}

export const ADD_USER_COURSE = 'ADD_USER_COURSE';
export function addUserCourse(course) {
    return dispatch => {
        UserCourses.add(course).then(payload => {
            const {action, course, schedulers} = payload;
            dispatch({
                type: ADD_USER_COURSE,
                action,
                course,
                schedulers
            });
        });
    };
}

export const REMOVE_USER_COURSE = 'REMOVE_USER_COURSE';
export function removeUserCourse(course) {
    return dispatch => {
        UserCourses.remove(course).then(payload => {
            const {action, course, schedulers} = payload;
            dispatch({
                type: ADD_USER_COURSE,
                action,
                course,
                schedulers
            });
        });
    };
}

export const FETCH_SCHEDULERS = 'FETCH_SCHEDULERS';
export function fetchSchedulers() {
    return dispatch => {
        Scheduler.fetchAll().then(payload => {
            dispatch({
                type: FETCH_SCHEDULERS,
                schedulers: payload.schedulers
            });

            if (payload.active !== undefined) {
                dispatch({
                    type: SET_ACTIVE_SCHEDULER,
                    scheduler: payload.active
                });
            }
        });
    };
}

export const ADD_SCHEDULER = 'ADD_SCHEDULER';
export function addScheduler(name) {
    return dispatch => {
        Scheduler.add(name).then(scheduler => {
            dispatch({
                type: ADD_SCHEDULER,
                scheduler
            });

            dispatch({
                type: SET_ACTIVE_SCHEDULER,
                scheduler
            });
        });
    };
}

export const REMOVE_SCHEDULER = 'REMOVE_SCHEDULER';
export function removeScheduler(scheduler) {
    return dispatch => {
        scheduler.remove().then(scheduler => {
            dispatch({
                type: REMOVE_SCHEDULER,
                scheduler
            });
        });
    };
}

export const SET_ACTIVE_SCHEDULER = 'SET_ACTIVE_SCHEDULER';
export function setSchedulerActive(scheduler) {
    return dispatch => {
        scheduler.setActive().then(scheduler => {
            dispatch({
                type: SET_ACTIVE_SCHEDULER,
                scheduler
            });
        });
    };
}

export const UPDATE_SCHEDULER = 'UPDATE_SCHEDULER';
export function renameScheduler(scheduler, name) {
    return dispatch => {
        scheduler.setName(name).then(scheduler => {
            dispatch({
                type: UPDATE_SCHEDULER,
                scheduler
            });
        });
    };
}

export function setCourseShown(scheduler, course, shown) {
    return dispatch => {
        scheduler.setCourseShown(course, shown).then(scheduler => {
            dispatch({
                type: UPDATE_SCHEDULER,
                scheduler
            });
        });
    };
}

export function schedulerRemoveCourse(scheduler, course) {
    return dispatch => {
        scheduler.removeCourse(course).then(scheduler => {
            dispatch({
                type: UPDATE_SCHEDULER,
                scheduler
            });
        });
    };
}
