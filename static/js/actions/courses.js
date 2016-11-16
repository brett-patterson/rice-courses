import Course from 'models/course';


export const FETCH_COURSES = 'FETCH_COURSES';
export function fetchCourses(page, query, term) {
    return (dispatch, getState) => {
        const termId = term ? term.getID() : null;
        Course.list(query, page, termId).then(result => {
            let {courses, pages} = result;

            const state = getState();
            dispatch({
                type: FETCH_COURSES,
                courses,
                pages,
                page,
                query,
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

export const FETCH_SUBJECTS = 'FETCH_SUBJECTS';
export function fetchSubjects(term=null) {
    return (dispatch, getState) => {
        const state = getState();
        Course.getSubjects(term || state.terms.current).then(subjects => {
            dispatch({
                type: FETCH_SUBJECTS,
                subjects
            });
        });
    };
}
