import {Map, List} from 'immutable';

import Course from './course';
import Scheduler from './scheduler';
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
     * Add a course for the user.
     * @param {Course} course - The course to add
     */
    static add(course) {
        return ajax({
            url: '/api/me/courses/',
            method: 'POST',
            data: {crn: course.getCRN()}
        }).then(payload => {
            payload.course = Course.fromJSON(payload.course);
            payload.schedulers = new List(
                payload.schedulers.map(Scheduler.fromJSON())
            );

            return payload;
        });
    }

    /**
     * Remove a course for the user.
     * @param {Course} course - The course to add
     */
    static remove(course) {
        return ajax({
            url: '/api/me/courses/',
            method: 'DELETE',
            data: {crn: course.getCRN()}
        }).then(payload => {
            payload.course = Course.fromJSON(payload.course);
            payload.schedulers = new List(
                payload.schedulers.map(Scheduler.fromJSON())
            );

            return payload;
        });
    }
}
