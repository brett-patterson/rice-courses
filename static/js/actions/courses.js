import Course from 'models/course';
import UserCourses from 'models/userCourses';


export function fetchCourses(page, filters, order) {
    return dispatch => {
        let serverFilters = filters.map(filter => {
            return [filter.getKey(), filter.getValue()];
        });

        Course.get(serverFilters, page, order).then(result => {
            let {courses, pages} = result;
            dispatch(
                completeFetchCourses(courses, pages, page, filters, order)
            );
        });
    };
}

export const FETCH_COURSES_COMPLETE = 'FETCH_COURSES_COMPLETE';
export function completeFetchCourses(courses, pages, page, filters, order) {
    return {
        type: FETCH_COURSES_COMPLETE,
        courses,
        pages,
        page,
        filters,
        order
    };
}

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
