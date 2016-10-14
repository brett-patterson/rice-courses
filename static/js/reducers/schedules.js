import {List} from 'immutable';

import {
    FETCH_SCHEDULES, ADD_SCHEDULE, REMOVE_SCHEDULE, UPDATE_SCHEDULE
} from 'actions/schedules';

const initialState = {
    all: new List()
};


export default function(state=initialState, action) {
    switch (action.type) {
    case FETCH_SCHEDULES:
        return Object.assign({}, state, {
            all: action.schedules
        });

    case ADD_SCHEDULE:
        return Object.assign({}, state, {
            all: state.all.push(action.schedule)
        });

    case REMOVE_SCHEDULE:
        return Object.assign({}, state, {
            all: state.all.filter(s => !s.equals(action.schedule))
        });

    case UPDATE_SCHEDULE:
        return Object.assign({}, state, {
            all: state.all.map(s => {
                if (s.equals(action.schedule)) return action.schedule;
                return s;
            })
        });

    default:
        return state;
    }
}
