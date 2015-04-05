import jQuery from 'jquery';


export default class Scheduler {
    constructor(name, map={}, shown=false) {
        this.name = name;
        this.map = map;
        this.shown = shown;
    }

    static fromJSON(j) {
        return new Scheduler(j.name, j.map, j.shown);
    }

    getName() {
        return this.name;
    }

    setName(name, cb) {
        this.name = name;

        jQuery.ajax({
            url: '/me/api/scheduler/rename/',
            method: 'POST',
            data: {
                name: this.name,
                new: name
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

        jQuery.ajax({
            url: '/me/api/scheduler/course/',
            method: 'POST',
            data: {
                scheduler: this.name,
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

        jQuery.ajax({
            url: '/me/api/scheduler/set/',
            method: 'POST',
            data: {
                name: this.name,
                shown: shown
            },
            dataType: 'json'
        }).done(data => {
            if (cb)
                cb(data);
        });
    }

    remove(cb) {
        jQuery.ajax({
            url: '/me/api/scheduler/remove/',
            method: 'POST',
            data: {name: this.name},
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
        jQuery.ajax({
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
        jQuery.ajax({
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
