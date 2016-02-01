import {ajax} from 'util';


export default class Scheduler {
    constructor(id, name, map={}, active=false, editing=false) {
        this.id = id;
        this.name = name;
        this.map = map;
        this.active = active;
        this.editing = editing;
    }

    static fromJSON(j) {
        return new Scheduler(j.id, j.name, j.map, j.active);
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
        }).then(data => data.map(Scheduler.fromJSON));
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
        }).then(data => data.map(Scheduler.fromJSON));
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
        }).then(data => data.map(Scheduler.fromJSON));
    }

    isActive() {
        return this.active;
    }

    setActive(active) {
        this.active = active;

        return ajax({
            url: `/api/me/schedulers/${this.id}/`,
            method: 'PUT',
            data: { active }
        }).then(data => data.map(Scheduler.fromJSON));
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
        }).then(data => data.map(Scheduler.fromJSON));
    }

    /**
     * Get all schedulers for the user.
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
     */
    static add(name) {
        return ajax({
            url: '/api/me/schedulers/',
            method: 'POST',
            data: { name }
        }).then(data => data.map(Scheduler.fromJSON));
    }
}
