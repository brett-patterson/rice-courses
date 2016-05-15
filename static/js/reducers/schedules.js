import {List} from 'immutable';

import {
    FETCH_SCHEDULES, ADD_SCHEDULE, REMOVE_SCHEDULE, UPDATE_SCHEDULE
} from 'actions/schedules';

const initialState = {
    all: new List()
};


export default function(state=initialState, action) {
    let schedule;

    switch (action.type) {
    case FETCH_SCHEDULES:
        return Object.assign({}, state, {
            all: action.schedules
        });

    case ADD_SCHEDULE:
        return Object.assign({}, state, {
            all: state.schedules.push(action.scheduler)
        });

    case REMOVE_SCHEDULE:
        return Object.assign({}, state, {
            all: state.schedules.filter(s => !s.equals(action.schedule))
        });

    case UPDATE_SCHEDULE:
        schedule = action.schedule;
        return Object.assign({}, state, {
            all: state.schedules.map(s => {
                if (s.equals(schedule)) return schedule;
                return s;
            })
        });

    default:
        return state;
    }
}
