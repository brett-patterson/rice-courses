import {Map, List} from 'immutable';

import Course from './course';
import {ajax} from 'util';


export default class Schedule {
    constructor(id, name, color, courses=new List(), map=new Map()) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.courses = courses;
        this.map = map;
    }

    static fromJSON(j) {
        const courses = new List(j.map.map(pair => Course.fromJSON(pair[0])));
        const map = new Map(j.map.map(pair => {
            pair[0] = pair[0].crn;
            return pair;
        }));

        return new Schedule(j.id, j.name, j.color, courses, map);
    }

    /**
     * Get all schedules for the user.
     */
    static fetchAll(term) {
        return ajax({
            url: '/api/me/schedules/',
            method: 'GET',
            data: { term: term ? term.getID() : undefined }
        }).then(schedules => new List(schedules.map(Schedule.fromJSON)));
    }

    /**
     * Add a new schedule.
     * @param {string} name - The name for the new schedule.
     */
    static add(name, term) {
        return ajax({
            url: '/api/me/schedules/',
            method: 'POST',
            data: { name, term: term.getID() }
        }).then(Schedule.fromJSON);
    }

    equals(other) {
        if (!(other instanceof Schedule)) return false;
        return this.getID() === other.getID();
    }

    remove() {
        return ajax({
            url: `/api/me/schedules/${this.id}/`,
            method: 'DELETE'
        });
    }

    getID() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    setName(name) {
        this.name = name;

        return ajax({
            url: `/api/me/schedules/${this.id}/`,
            method: 'PUT',
            data: { name }
        }).then(Schedule.fromJSON);
    }

    getCourses() {
        return this.courses;
    }

    getMap() {
        return this.map;
    }

    getColor() {
        return this.color;
    }

    addCourse(course) {
        this.courses = this.courses.push(course);
        this.map = this.map.set(course.getCRN(), true);

        return ajax({
            url: `/api/me/schedules/${this.id}/course/`,
            method: 'POST',
            data: {
                crn: course.getCRN()
            }
        }).then(Schedule.fromJSON);
    }

    setCourseShown(course, shown) {
        this.map = this.map.set(course.getCRN(), shown);

        return ajax({
            url: `/api/me/schedules/${this.id}/course/`,
            method: 'PUT',
            data: {
                crn: course.getCRN(),
                shown
            }
        }).then(Schedule.fromJSON);
    }

    removeCourse(course) {
        this.courses = this.courses.filter(c => c.getCRN() !== course.getCRN());
        this.map = this.map.delete(course.getCRN());

        return ajax({
            url: `/api/me/schedules/${this.id}/course/`,
            method: 'DELETE',
            data: {
                crn: course.getCRN()
            }
        }).then(Schedule.fromJSON);
    }
}
