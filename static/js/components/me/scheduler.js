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

    setName(name) {
        this.name = name;

        return ajax({
            url: `/api/me/schedulers/${this.id}/`,
            method: 'PUT',
            data: { name }
        });
    }

    getMap() {
        return this.map;
    }

    setCourseShown(course, shown) {
        this.map[course.getCRN()] = shown;

        return ajax({
            url: `/api/me/schedulers/${this.id}/course/`,
            method: 'PUT',
            data: {
                crn: course.getCRN(),
                shown
            }
        });
    }

    removeCourse(course) {
        if (this.map[course] !== undefined) {
            delete this.map[course];
        }

        return ajax({
            url: `/api/me/schedulers/${this.id}/course/`,
            method: 'DELETE',
            data: {
                crn: course.getCRN()
            }
        });
    }

    getShown() {
        return this.shown;
    }

    setShown(shown) {
        this.shown = shown;

        return ajax({
            url: `/api/me/schedulers/${this.id}/`,
            method: 'PUT',
            data: { shown }
        });
    }

    getEditing() {
        return this.editing;
    }

    setEditing(editing) {
        this.editing = editing;
    }

    remove() {
        return ajax({
            url: `/api/me/schedulers/${this.id}/`,
            method: 'DELETE'
        });
    }

    /**
     * Get all schedulers for the user.
     * @param {function} cb - A callback invoked with the results of the request
     */
    static fetchAll() {
        return ajax({
            url: '/api/me/schedulers/',
            method: 'GET'
        }).then(data => data.map(Scheduler.fromJSON));
    }

    /**
     * Add a new scheduler.
     * @param {string} name - The name for the new scheduler.
     * @param {function} cb - A callback invoked with the results of the request
     */
    static addScheduler(name) {
        return ajax({
            url: '/api/me/schedulers/',
            method: 'POST',
            data: { name }
        }).then(data => Scheduler.fromJSON(data.scheduler));
    }
}
