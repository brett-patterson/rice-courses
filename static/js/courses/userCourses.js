import Course from './course';
import {ajaxCSRF} from '../util';


export default class UserCourses {
    /**
     * Get all user selected courses.
     * @param {function} cb - A callback invoked with the results of the request
     */
    static get(cb) {
        ajaxCSRF({
            url: '/me/api/courses/',
            method: 'POST',
            dataType: 'json'
        }).done(data => {
            let result = [];

            for (let i = 0; i < data.length; i++)
                result.push(Course.fromJSON(data[i]));

            cb(result);
        });
    }

    /**
     * Select a course for the user.
     * @param {Course} course - The course to add
     * @param {function} cb - A callback invoked with the results of the request
     */
    static add(course, cb) {
        ajaxCSRF({
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
        ajaxCSRF({
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
