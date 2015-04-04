import jQuery from 'jquery';

import Scheduler from 'me/scheduler';


export default class Schedulers {
    /**
     * Get all schedulers for the user.
     * @param {function} cb - A callback invoked with the results of the request
     */
    static get(cb) {
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
                cb(data);
        });
    }

    /**
     * Remove a scheduler.
     * @param {Scheduler} scheduler - The scheduler to remove
     * @param {function} cb - A callback invoked with the results of the request
     */
    static removeScheduler(scheduler, cb) {
        jQuery.ajax({
            url: '/me/api/scheduler/remove/',
            method: 'POST',
            data: {name: scheduler.getName()},
            dataType: 'json'
        }).done(data => {
            if (cb)
                cb(data);
        });
    }

    /**
     * Set whether a scheduler should be shown.
     * @param {Scheduler} scheduler - The scheduler to set shown
     * @param {boolean} shown - Whether or not the scheduler should be shown
     * @param {function} cb - A callback invoked with the results of the request
     */
    static setSchedulerShown(scheduler, shown, cb) {
        jQuery.ajax({
            url: '/me/api/scheduler/set/',
            method: 'POST',
            data: {
                name: scheduler.getName(),
                shown: shown
            },
            dataType: 'json'
        }).done(data => {
            if (cb)
                cb(data);
        });
    }

    /**
     * Set whether a course should be shown for a given scheduler.
     * @param {Scheduler} scheduler - The scheduler to change
     * @param {Course} course - The course to show/hide
     * @param {boolean} shown - Whether or not the course should be shown
     * @param {function} cb - A callback invoked with the results of the request
     */
    static setCourseShown(scheduler, course, shown, cb) {
        jQuery.ajax({
            url: '/me/api/scheduler/set/',
            method: 'POST',
            data: {
                scheduler: scheduler.getName(),
                crn: course.getCRN(),
                shown: shown
            },
            dataType: 'json'
        }).done(data => {
            if (cb)
                cb(data);
        });
    }

    /**
     * Rename a scheduler.
     * @param {Scheduler} scheduler - The scheduler to rename
     * @param {string} name - The new name for the scheduler
     * @param {function} cb - A callback invoked with the results of the request
     */
    static renameScheduler(scheduler, name, cb) {
        jQuery.ajax({
            url: '/me/api/scheduler/rename/',
            method: 'POST',
            data: {
                name: scheduler.getName(),
                new: name
            },
            dataType: 'json'
        }).done(data => {
            if (cb)
                cb(data);
        });
    }
}