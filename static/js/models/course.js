import Moment from 'moment';
import {OrderedMap, Map} from 'immutable';

import Term from './term';
import {ajax} from 'util';


const DAY_ABBR_MAP = {
    'M': 'Monday',
    'T': 'Tuesday',
    'W': 'Wednesday',
    'R': 'Thursday',
    'F': 'Friday',
    'S': 'Saturday',
    'U': 'Sunday'
};


export default class Course {
    constructor(term, crn, subject, number, section, title, instructor, description,
                meetings, location, credits, distribution, enrollment,
                maxEnrollment, waitlist, maxWaitlist, prerequisites,
                corequisites, restrictions, crossListed) {
        this.term = term;
        this.crn = crn;
        this.subject = subject;
        this.number = number;
        this.section = section;
        this.title = title;
        this.instructor = instructor;
        this.description = description;
        this.meetings = this._convertMeetingsToDates(meetings);
        this.location = location;
        this.credits = credits;
        this.distribution = distribution;
        this.enrollment = enrollment;
        this.maxEnrollment = maxEnrollment;
        this.waitlist = waitlist;
        this.maxWaitlist = maxWaitlist;
        this.prerequisites = prerequisites;
        this.corequisites = corequisites;
        this.restrictions = restrictions;
        this.crossListed = crossListed;
    }

    static fromJSON(j) {
        let crossListed = [];

        if (j.cross_list_group !== undefined)
            crossListed = j.cross_list_group.map(courseJSON => {
                return Course.fromJSON(courseJSON);
            });

        const term = Term.fromJSON(j.term);
        return new Course(term, j.crn, j.subject, j.course_number, j.section,
                          j.title, j.instructor, j.description, j.meetings,
                          j.location, j.credits, j.distribution, j.enrollment,
                          j.max_enrollment, j.waitlist, j.max_waitlist,
                          j.prerequisites, j.corequisites, j.restrictions,
                          crossListed);
    }

    static list(query=undefined, filters=new Map(), page=-1, termId=null) {
        let data = {};

        if (query) {
            data.q = query;
        }

        if (page >= 0) {
            data.page = page;
        }

        if (termId !== null) {
            data.term = termId;
        }

        Object.assign(data, filters.toObject());

        return ajax({
            url: '/api/courses/',
            method: 'GET',
            data
        }).then(result => {
            result.courses = new OrderedMap(
                result.courses
                    .map(Course.fromJSON)
                    .map(c => [c.getCRN(), c])
            );

            return result;
        });
    }

    static get(crn, term) {
        return ajax({
            url: `/api/courses/${term.getID()}/${crn}/`,
            method: 'GET'
        }).then(result => {
            return Course.fromJSON(result);
        });
    }

    static getSubjects(term=null) {
        return ajax({
            url: '/api/courses/subjects/',
            method: 'GET',
            data: {
                term: term ? term.id : undefined
            }
        });
    }

    getOtherSections() {
        return ajax({
            url: '/api/courses/sections/',
            method: 'GET',
            data: {
                subject: this.subject,
                number: this.number,
                term: this.term.id
            }
        }).then(result => result
            .map(Course.fromJSON)
            .filter(c => c.getSection() !== this.section)
        );
    }

    _convertMeetingsToDates(meetings) {
        let dates = [];

        for (let i = 0; i < meetings.length; i++) {
            const {day, start, end} = meetings[i];

            dates.push({
                day,
                start: Moment(DAY_ABBR_MAP[day] + ' ' + start, 'dddd HH:mm:ss'),
                end: Moment(DAY_ABBR_MAP[day] + ' ' + end, 'dddd HH:mm:ss')
            });
        }

        return dates;
    }

    equals(other) {
        if (!(other instanceof Course)) return false;
        return this.getCRN() === other.getCRN();
    }

    getTerm() {
        return this.term;
    }

    getCRN() {
        return this.crn;
    }

    getSubject() {
        return this.subject;
    }

    getNumber() {
        return this.number;
    }

    getSection() {
        return this.section;
    }

    getCourseID() {
        return `${this.subject} ${this.number} ${this.section}`;
    }

    getTitle() {
        return this.title;
    }

    getInstructor() {
        return this.instructor;
    }

    getDescription() {
        return this.description;
    }

    getMeetings() {
        return this.meetings;
    }

    getMeetingsString() {
        let timesToDays = {};
        for (let i = 0; i < this.meetings.length; i++) {
            let meeting = this.meetings[i];

            let startTime = meeting.start.format('HH:mm');
            let endTime = meeting.end.format('HH:mm');
            let time = `${startTime} - ${endTime}`;

            if (timesToDays[time] === undefined) {
                timesToDays[time] = meeting.day;
            } else {
                timesToDays[time] += meeting.day;
            }
        }

        let result = '';
        for (let times in timesToDays) {
            result += `${timesToDays[times]} ${times}, `;
        }

        return result.substring(0, result.length - 2);
    }

    getLocation() {
        return this.location;
    }

    getCredits() {
        return this.credits;
    }

    getDistribution() {
        return this.distribution;
    }

    getDistributionString() {
        let result = '';
        for (let i = 0; i < this.distribution; i++)
            result += 'I';
        return result;
    }

    getEnrollment() {
        return this.enrollment;
    }

    getMaxEnrollment() {
        return this.maxEnrollment;
    }

    getEnrollmentString() {
        return `${this.enrollment}/${this.maxEnrollment}`;
    }

    getEnrollmentPercentage() {
        if (this.enrollment <= this.maxEnrollment)
            return this.enrollment / this.maxEnrollment * 100;
        return 0;
    }

    getWaitlist() {
        return this.waitlist;
    }

    getMaxWaitlist() {
        return this.maxWaitlist;
    }

    getWaitlistString() {
        return `${this.waitlist}/${this.maxWaitlist}`;
    }

    getPrerequisites() {
        return this.prerequisites;
    }

    getCorequisites() {
        return this.corequisites;
    }

    getRestrictions() {
        return this.restrictions;
    }

    getCrossListed() {
        return this.crossListed;
    }
}
