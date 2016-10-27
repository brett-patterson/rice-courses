import {List} from 'immutable';

import {FETCH_ARTICLES} from 'actions/help';

const initialState = {
    articles: new List()
};


export default function(state=initialState, action) {
    switch (action.type) {
    case FETCH_ARTICLES:
        return Object.assign({}, state, {
            articles: action.articles
        });
    default:
        return state;
    }
}
