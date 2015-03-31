import jQuery from 'jquery';

import Course from 'courses/course';


export default class UserCourses {
    /**
     * Get all user selected courses.
     * @param {function} cb - A callback invoked with the results of the request
     */
    static get(cb) {
        jQuery.ajax({
            url: '/me/api/courses/',
            method: 'POST',
            dataType: 'json'
        }).done(data => {
            let result = [];
            for (let courseJSON in data)
                result.push(Course.fromJSON(courseJSON));
            cb(result);
        });
    }

    /**
     * Select a course for the user.
     * @param {Course} course - The course to add
     * @param {function} cb - A callback invoked with the results of the request
     */
    static add(course, cb) {
        jQuery.ajax({
            url: '/me/api/courses/add/',
            method: 'POST',
            data: {crn: course.getCRN()},
            dataType: 'json'
        }).done(data => {
            if (cb)
                cb(data);
        });
    }

    /**
     * Deselect a course for the user.
     * @param {Course} course - The course to remove
     * @param {function} cb - A callback invoked with the results of the request
     */
    static remove(course, cb) {
        jQuery.ajax({
            url: '/me/api/courses/remove/',
            method: 'POST',
            data: {crn: course.getCRN()},
            dataType: 'json'
        }).done(data => {
            if (cb)
                cb(data);
        });
    }
}