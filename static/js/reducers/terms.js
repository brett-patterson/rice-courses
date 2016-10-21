import {List} from 'immutable';

import {FETCH_TERMS, SWITCH_TERM} from 'actions/terms';

const initialState = {
    all: new List(),
    current: null
};


export default function(state=initialState, action) {
    switch (action.type) {
    case FETCH_TERMS:
        return Object.assign({}, state, {
            all: action.terms,
            current: action.current
        });

    case SWITCH_TERM:
        return Object.assign({}, state, {
            current: action.term
        });

    default:
        return state;
    }
}
