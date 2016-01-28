import Course from './course';
import {ajax} from '../util';


export default class UserCourses {
    /**
     * Get all user selected courses.
     * @param {function} cb - A callback invoked with the results of the request
     */
    static get(cb) {
        ajax({
            url: '/api/me/courses/',
            method: 'GET'
        }).then(data => {
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
        ajax({
            url: '/api/me/courses/',
            method: 'POST',
            data: {crn: course.getCRN()}
        }).then(cb);
    }

    /**
     * Deselect a course for the user.
     * @param {Course} course - The course to remove
     * @param {function} cb - A callback invoked with the results of the request
     */
    static remove(course, cb) {
        ajax({
            url: '/api/me/courses/',
            method: 'DELETE',
            data: {crn: course.getCRN()}
        }).then(cb);
    }
}
