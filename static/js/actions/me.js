import {List} from 'immutable';

import UserCourses from 'models/userCourses';
import Scheduler from 'models/scheduler';


export function fetchUserCourses() {
    return dispatch => {
        UserCourses.get().then(courses => {
            dispatch(completeFetchUserCourses(courses));
        });
    };
}

export function setUserCourse(course, flag) {
    return dispatch => {
        UserCourses.set(course, flag).then(courses => {
            dispatch(completeFetchUserCourses(courses));
        });
    };
}

export const FETCH_USER_COURSES_COMPLETE = 'SET_USER_COURSE_COMPLETE';
export function completeFetchUserCourses(courses) {
    return {
        type: FETCH_USER_COURSES_COMPLETE,
        courses
    };
}

export function fetchSchedulers() {
    return dispatch => {
        Scheduler.fetchAll().then(schedulers => {
            dispatch(completeFetchSchedulers(schedulers));
        });
    };
}

export const FETCH_SCHEDULERS_COMPLETE = 'FETCH_SCHEDULERS_COMPLETE';
export function completeFetchSchedulers(schedulers) {
    return {
        type: FETCH_SCHEDULERS_COMPLETE,
        schedulers: new List(schedulers)
    };
}

export function setCourseShown(scheduler, course, shown) {
    return dispatch => {
        scheduler.setCourseShown(course, shown).then(schedulers => {
            dispatch(completeFetchSchedulers(schedulers));
        });
    };
}

export function schedulerRemoveCourse(scheduler, course) {
    return dispatch => {
        scheduler.removeCourse(course).then(schedulers => {
            dispatch(completeFetchSchedulers(schedulers));
        });
    };
}

export function setSchedulerActive(scheduler, active) {
    return dispatch => {
        scheduler.setActive(active).then(schedulers => {
            dispatch(completeFetchSchedulers(schedulers));
        });
    };
}

export function addScheduler(name) {
    return dispatch => {
        Scheduler.add(name).then(schedulers => {
            dispatch(completeFetchSchedulers(schedulers));
        });
    };
}

export function removeScheduler(scheduler) {
    return dispatch => {
        scheduler.remove().then(schedulers => {
            dispatch(completeFetchSchedulers(schedulers));
        });
    };
}

export function renameScheduler(scheduler, name) {
    return dispatch => {
        scheduler.setName(name).then(schedulers => {
            dispatch(completeFetchSchedulers(schedulers));
        });
    };
}
