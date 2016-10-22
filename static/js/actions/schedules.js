import Schedule from 'models/schedule';


export const FETCH_SCHEDULES = 'FETCH_SCHEDULES';
export function fetchSchedules(term) {
    return dispatch => {
        Schedule.fetchAll(term).then(schedules => {
            dispatch({
                type: FETCH_SCHEDULES,
                schedules
            });
        });
    };
}

export const ADD_SCHEDULE = 'ADD_SCHEDULE';
export function addSchedule(name) {
    return (dispatch, getState) => {
        const state = getState();
        Schedule.add(name, state.terms.current).then(schedule => {
            dispatch({
                type: ADD_SCHEDULE,
                schedule
            });
        });
    };
}

export const REMOVE_SCHEDULE = 'REMOVE_SCHEDULE';
export function removeSchedule(schedule) {
    return dispatch => {
        schedule.remove().then(() => {
            dispatch({
                type: REMOVE_SCHEDULE,
                schedule
            });
        });
    };
}

export const UPDATE_SCHEDULE = 'UPDATE_SCHEDULE';

export function renameSchedule(schedule, name) {
    return dispatch => {
        schedule.setName(name).then(schedule => {
            dispatch({
                type: UPDATE_SCHEDULE,
                schedule
            });
        });
    };
}

export function addCourse(schedule, course) {
    return dispatch => {
        schedule.addCourse(course).then(schedule => {
            dispatch({
                type: UPDATE_SCHEDULE,
                schedule
            });
        });
    };
}

export function setCourseShown(schedule, course, shown) {
    return dispatch => {
        schedule.setCourseShown(course, shown).then(schedule => {
            dispatch({
                type: UPDATE_SCHEDULE,
                schedule
            });
        });
    };
}

export function removeCourse(schedule, course) {
    return dispatch => {
        schedule.removeCourse(course).then(schedule => {
            dispatch({
                type: UPDATE_SCHEDULE,
                schedule
            });
        });
    };
}
