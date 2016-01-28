import {ajax} from 'util';


export default class Scheduler {
    constructor(id, name, map={}, shown=false, editing=false) {
        this.id = id;
        this.name = name;
        this.map = map;
        this.shown = shown;
        this.editing = editing;
    }

    static fromJSON(j) {
        return new Scheduler(j.id, j.name, j.map, j.shown);
    }

    getID() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    setName(name, cb) {
        this.name = name;

        ajax({
            url: `/api/me/schedulers/${this.id}/`,
            method: 'PUT',
            data: {
                name: name
            }
        }).then(cb);
    }

    getMap() {
        return this.map;
    }

    setCourseShown(course, shown, cb) {
        this.map[course.getCRN()] = shown;

        ajax({
            url: `/api/me/schedulers/${this.id}/course/`,
            method: 'PUT',
            data: {
                crn: course.getCRN(),
                shown
            }
        }).then(cb);
    }

    removeCourse(course, cb) {
        if (this.map[course] !== undefined) {
            delete this.map[course];
        }

        ajax({
            url: `/api/me/schedulers/${this.id}/course/`,
            method: 'DELETE',
            data: {
                crn: course.getCRN()
            }
        }).then(cb);
    }

    getShown() {
        return this.shown;
    }

    setShown(shown, cb) {
        this.shown = shown;

        ajax({
            url: `/api/me/schedulers/${this.id}/`,
            method: 'PUT',
            data: { shown }
        }).then(cb);
    }

    getEditing() {
        return this.editing;
    }

    setEditing(editing) {
        this.editing = editing;
    }

    remove(cb) {
        ajax({
            url: `/api/me/schedulers/${this.id}/`,
            method: 'DELETE'
        }).then(cb);
    }

    /**
     * Get all schedulers for the user.
     * @param {function} cb - A callback invoked with the results of the request
     */
    static fetchAll(cb) {
        ajax({
            url: '/api/me/schedulers/',
            method: 'GET'
        }).then(data => {
            cb(data.map(Scheduler.fromJSON));
        });
    }

    /**
     * Add a new scheduler.
     * @param {string} name - The name for the new scheduler.
     * @param {function} cb - A callback invoked with the results of the request
     */
    static addScheduler(name, cb) {
        ajax({
            url: '/api/me/schedulers/',
            method: 'POST',
            data: { name }
        }).then(data => {
            if (cb)
                cb(Scheduler.fromJSON(data.scheduler));
        });
    }
}
