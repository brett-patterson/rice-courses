import {List} from 'immutable';

import {ajax} from 'util';


export default class Scheduler {
    constructor(id, name, map={}, editing=false) {
        this.id = id;
        this.name = name;
        this.map = map;
        this.editing = editing;
    }

    static fromJSON(j) {
        return new Scheduler(j.id, j.name, j.map);
    }

    /**
     * Get all schedulers for the user.
     */
    static fetchAll() {
        return ajax({
            url: '/api/me/schedulers/',
            method: 'GET'
        }).then(payload => {
            const schedulers = new List(
                payload.schedulers.map(Scheduler.fromJSON)
            );

            let active = undefined;
            if (payload.activeID !== undefined) {
                active = schedulers.find(s => s.getID() === payload.activeID);
            }

            return {
                schedulers,
                active
            };
        });
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
        }).then(Scheduler.fromJSON);
    }

    equals(other) {
        if (!(other instanceof Scheduler)) return false;
        return this.getID() === other.getID();
    }

    remove() {
        return ajax({
            url: `/api/me/schedulers/${this.id}/`,
            method: 'DELETE'
        }).then(Scheduler.fromJSON);
    }

    setActive() {
        return ajax({
            url: '/api/me/schedulers/active/',
            method: 'PUT',
            data: { id: this.id }
        }).then(Scheduler.fromJSON);
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
        }).then(Scheduler.fromJSON);
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
        }).then(Scheduler.fromJSON);
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
        }).then(Scheduler.fromJSON);
    }

    getEditing() {
        return this.editing;
    }

    setEditing(editing) {
        this.editing = editing;
    }
}
