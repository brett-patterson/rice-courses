import Course from 'models/course';


export const FETCH_COURSES = 'FETCH_COURSES';
export function fetchCourses(page, filters, order, term) {
    return (dispatch, getState) => {
        let serverFilters = filters.map(filter => {
            return [filter.getKey(), filter.getValue()];
        });

        const termId = term ? term.getID() : null;
        Course.list(serverFilters, page, order, termId).then(result => {
            let {courses, pages} = result;

            const state = getState();
            dispatch({
                type: FETCH_COURSES,
                courses,
                pages,
                page,
                filters,
                order,
                term: termId,
                clearAll: term !== state.terms.current
            });
        });
    };
}

export const FETCH_COURSE = 'FETCH_COURSE';
export function fetchCourse(crn, term=null) {
    return (dispatch, getState) => {
        const state = getState();
        Course.get(crn, term || state.terms.current).then(course => {
            dispatch({
                type: FETCH_COURSE,
                course
            });
        });
    };
}
