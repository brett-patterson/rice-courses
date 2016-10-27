import {ajax} from 'util';


export default class HelpArticle {
    constructor(id, title, body) {
        this.id = id;
        this.title = title;
        this.body = body;
    }

    static fetchAll() {
        return ajax({
            url: '/api/help/articles/',
            method: 'GET'
        }).then(result => {
            return result.map(HelpArticle.fromJSON);
        });
    }

    static fromJSON(obj) {
        return new HelpArticle(obj.id, obj.title, obj.body);
    }

    getID() {
        return this.id;
    }

    getTitle() {
        return this.title;
    }

    getBody() {
        return this.body;
    }
}
