import {Map} from 'immutable';

import Course from './course';
import {ajax} from '../util';


export default class UserCourses {
    /**
     * Get all user selected courses.
     */
    static get() {
        return ajax({
            url: '/api/me/courses/',
            method: 'GET'
        }).then(arr => new Map(
            arr.map(Course.fromJSON).map(c => [c.getCRN(), c])
        ));
    }

    /**
     * Set a course for the user.
     * @param {Course} course - The course to set
     * @param {boolean} flag - Whether or not the course should be a user course
     */
    static set(course, flag) {
        return ajax({
            url: '/api/me/courses/',
            method: 'PUT',
            data: {crn: course.getCRN(), flag}
        }).then(payload => {
            payload.course = Course.fromJSON(payload.course);
            return payload;
        });
    }
}
