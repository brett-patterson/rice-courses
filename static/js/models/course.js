import Moment from 'moment';
import {OrderedMap} from 'immutable';

import {ajax} from 'util';


const DAY_ABBR_MAP = {
    'Monday': 'M',
    'Tuesday': 'T',
    'Wednesday': 'W',
    'Thursday': 'R',
    'Friday': 'F',
    'Saturday': 'S',
    'Sunday': 'U'
};


export default class Course {
    constructor(crn, subject, number, section, title, instructor, description,
                meetings, location, credits, distribution, enrollment,
                maxEnrollment, waitlist, maxWaitlist, prerequisites,
                corequisites, restrictions, crossListed) {
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

        return new Course(j.crn, j.subject, j.course_number, j.section,
                          j.title, j.instructor, j.description, j.meetings,
                          j.location, j.credits, j.distribution, j.enrollment,
                          j.max_enrollment, j.waitlist, j.max_waitlist,
                          j.prerequisites, j.corequisites, j.restrictions,
                          crossListed);
    }

    static list(filters=[], page=-1, order=null, termId=null) {
        let data = {
            filters: JSON.stringify(filters)
        };

        if (page >= 0) {
            data.page = page;
        }

        if (order !== null) {
            data.order = order;
        }

        if (termId !== null) {
            data.term = termId;
        }

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

    getOtherSections() {
        return ajax({
            url: '/api/courses/sections/',
            method: 'GET',
            data: {
                subject: this.subject,
                number: this.number
            }
        }).then(result => result
            .map(Course.fromJSON)
            .filter(c => c.getSection() !== this.section)
        );
    }

    _convertMeetingsToDates(meetings) {
        let dates = [];

        for (let i = 0; i < meetings.length; i++) {
            const [start_string, end_string] = meetings[i].split(',');

            dates.push({
                start: Moment.utc(start_string),
                end: Moment.utc(end_string)
            });
        }

        return dates;
    }

    equals(other) {
        if (!(other instanceof Course)) return false;
        return this.getCRN() === other.getCRN();
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
            let day = DAY_ABBR_MAP[meeting.start.format('dddd')];

            if (timesToDays[time] === undefined) {
                timesToDays[time] = day;
            } else {
                timesToDays[time] += day;
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
