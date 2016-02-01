import Course from 'models/course';


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
