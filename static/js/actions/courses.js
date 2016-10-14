import Course from 'models/course';


export const FETCH_COURSES = 'FETCH_COURSES';
export function fetchCourses(page, filters, order) {
    return dispatch => {
        let serverFilters = filters.map(filter => {
            return [filter.getKey(), filter.getValue()];
        });

        Course.list(serverFilters, page, order).then(result => {
            let {courses, pages} = result;
            dispatch({
                type: FETCH_COURSES,
                courses,
                pages,
                page,
                filters,
                order
            });
        });
    };
}

export const FETCH_COURSE = 'FETCH_COURSE';
export function fetchCourse(crn) {
    return dispatch => {
        Course.get(crn).then(course => {
            dispatch({
                type: FETCH_COURSE,
                course
            });
        });
    };
}
