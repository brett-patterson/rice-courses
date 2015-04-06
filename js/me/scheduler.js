import {ajaxCSRF} from 'util';


export default class Scheduler {
    constructor(id, name, map={}, shown=false) {
        this.id = id;
        this.name = name;
        this.map = map;
        this.shown = shown;
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

        ajaxCSRF({
            url: '/me/api/scheduler/rename/',
            method: 'POST',
            data: {
                id: this.id,
                name: name
            },
            dataType: 'json'
        }).done(data => {
            if (cb)
                cb(data);
        });
    }

    getMap() {
        return this.map;
    }

    setCourseShown(course, shown, cb) {
        this.map[course.getCRN()] = shown;

        ajaxCSRF({
            url: '/me/api/scheduler/course/',
            method: 'POST',
            data: {
                id: this.id,
                crn: course.getCRN(),
                shown: shown
            },
            dataType: 'json'
        }).done(data => {
            if (cb)
                cb(data);
        });
    }

    getShown() {
        return this.shown;
    }

    setShown(shown, cb) {
        this.shown = shown;

        ajaxCSRF({
            url: '/me/api/scheduler/set/',
            method: 'POST',
            data: {
                id: this.id,
                shown: shown
            },
            dataType: 'json'
        }).done(data => {
            if (cb)
                cb(data);
        });
    }

    remove(cb) {
        ajaxCSRF({
            url: '/me/api/scheduler/remove/',
            method: 'POST',
            data: {id: this.id},
            dataType: 'json'
        }).done(data => {
            if (cb)
                cb(data);
        });
    }

    /**
     * Get all schedulers for the user.
     * @param {function} cb - A callback invoked with the results of the request
     */
    static fetchAll(cb) {
        ajaxCSRF({
            url: '/me/api/scheduler/all/',
            method: 'POST',
            dataType: 'json'
        }).done(data => {
            let result = [];
            for (let schedulerJSON of data)
                result.push(Scheduler.fromJSON(schedulerJSON));
            cb(result);
        });
    }

    /**
     * Add a new scheduler.
     * @param {string} name - The name for the new scheduler.
     * @param {function} cb - A callback invoked with the results of the request
     */
    static addScheduler(name, cb) {
        ajaxCSRF({
            url: '/me/api/scheduler/add/',
            method: 'POST',
            data: {name: name},
            dataType: 'json'
        }).done(data => {
            if (cb)
                cb(Scheduler.fromJSON(data.scheduler));
        });
    }
}
