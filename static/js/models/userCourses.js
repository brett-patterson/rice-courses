import Course from './course';
import {ajax} from 'util';


export default class UserCourses {
    /**
     * Get all user selected courses.
     * @param {function} cb - A callback invoked with the results of the request
     */
    static get() {
        return ajax({
            url: '/api/me/courses/',
            method: 'GET'
        }).then(data => data.map(Course.fromJSON));
    }

    /**
     * Select a course for the user.
     * @param {Course} course - The course to add
     * @param {function} cb - A callback invoked with the results of the request
     */
    static add(course) {
        return ajax({
            url: '/api/me/courses/',
            method: 'POST',
            data: {crn: course.getCRN()}
        });
    }

    /**
     * Deselect a course for the user.
     * @param {Course} course - The course to remove
     * @param {function} cb - A callback invoked with the results of the request
     */
    static remove(course) {
        return ajax({
            url: '/api/me/courses/',
            method: 'DELETE',
            data: {crn: course.getCRN()}
        });
    }
}
