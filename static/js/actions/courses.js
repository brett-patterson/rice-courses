import Course from 'models/course';


export const FETCH_COURSES = 'FETCH_COURSES';

export function fetchCourses(filters=[], page=-1, order=null) {
    return dispatch => {
        Course.get(filters, page, order).then(result => {
            let {courses, pages} = result;
            dispatch(completeFetchCourses(courses, pages));
        });
    };
}

export const FETCH_COURSES_COMPLETE = 'FETCH_COURSES_COMPLETE';

export function completeFetchCourses(courses, pages) {
    return {
        type: FETCH_COURSES_COMPLETE,
        courses,
        pages
    };
}
