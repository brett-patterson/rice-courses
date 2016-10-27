import {List} from 'immutable';

import HelpArticle from 'models/helpArticle';


export const FETCH_ARTICLES = 'FETCH_ARTICLES';
export function fetchArticles() {
    return dispatch => {
        HelpArticle.fetchAll().then(result => {
            dispatch({
                type: FETCH_ARTICLES,
                articles: new List(result)
            });
        });
    };
}
