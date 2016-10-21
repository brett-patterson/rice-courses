import {List} from 'immutable';
import {ajax} from 'util';


export default class Term {
    constructor(id, name, current) {
        this.id = id;
        this.name = name;
        this.current = current;
    }

    static fromJSON(obj) {
        return new Term(obj.id, obj.name, obj.current);
    }

    static fetchAll() {
        return ajax({
            url: '/api/terms/',
            method: 'GET'
        }).then(result => {
            const terms = new List(result.map(Term.fromJSON));
            return {
                terms,
                current: terms.find(t => t.getCurrent())
            };
        });
    }

    getID() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getCurrent() {
        return this.current;
    }
}
