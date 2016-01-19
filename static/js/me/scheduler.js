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
            url: '/me/api/scheduler/rename/',
            method: 'POST',
            data: {
                id: this.id,
                name: name
            },
            dataType: 'json'
        }).then(cb);
    }

    getMap() {
        return this.map;
    }

    setCourseShown(course, shown, cb) {
        this.map[course.getCRN()] = shown;

        ajax({
            url: '/me/api/scheduler/course/',
            method: 'POST',
            data: {
                id: this.id,
                crn: course.getCRN(),
                shown: shown
            },
            dataType: 'json'
        }).then(cb);
    }

    removeCourse(course, cb) {
        if (this.map[course] !== undefined) {
            delete this.map[course];
        }

        ajax({
            url: '/me/api/scheduler/remove-course/',
            method: 'POST',
            data: {
                id: this.id,
                crn: course.getCRN()
            },
            dataType: 'json'
        }).then(cb);
    }

    getShown() {
        return this.shown;
    }

    setShown(shown, cb) {
        this.shown = shown;

        ajax({
            url: '/me/api/scheduler/set/',
            method: 'POST',
            data: {
                id: this.id,
                shown: shown
            },
            dataType: 'json'
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
            url: '/me/api/scheduler/remove/',
            method: 'POST',
            data: {id: this.id},
            dataType: 'json'
        }).then(cb);
    }

    /**
     * Get all schedulers for the user.
     * @param {function} cb - A callback invoked with the results of the request
     */
    static fetchAll(cb) {
        ajax({
            url: '/me/api/scheduler/all/',
            method: 'POST',
            dataType: 'json'
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
            url: '/me/api/scheduler/add/',
            method: 'POST',
            data: {name: name},
            dataType: 'json'
        }).then(data => {
            if (cb)
                cb(Scheduler.fromJSON(data.scheduler));
        });
    }
}
