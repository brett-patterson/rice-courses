import {FETCH_COURSES_COMPLETE} from 'actions/courses';


const initialState = {
    all: undefined
};


export default function(state=initialState, action) {
    switch (action.type) {
    case FETCH_COURSES_COMPLETE:
        return Object.assign({}, state, {
            all: action.courses,
            pages: action.pages
        });

    default:
        return state;
    }
}
