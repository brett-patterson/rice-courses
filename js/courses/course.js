import Moment from 'moment';
import {ajaxCSRF} from 'util';


const DAY_ABBR_MAP = {
    'Monday': 'M',
    'Tuesday': 'T',
    'Wednesday': 'W',
    'Thursday': 'R',
    'Friday': 'F'
};

const DAY_NUMBER_MAP = {
    'M': '01',
    'T': '02',
    'W': '03',
    'R': '04',
    'F': '05'
};


export default class Course {
    constructor(crn, subject, number, section, title, instructor, description,
                meetings, location, credits, distribution, enrollment,
                maxEnrollment, waitlist, maxWaitlist, prerequisites,
                corequisites, restrictions) {
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

        this.filterMapping = {
            distribution: this.getDistributionString(),
            courseID: this.getCourseID()
        };
    }

    static fromJSON(j) {
        const meetings = `${j.meeting_days} ${j.start_time}-${j.end_time}`;
        return new Course(j.crn, j.subject, j.course_number, j.section,
                          j.title, j.instructor, j.description, meetings,
                          j.location, j.credits, j.distribution,
                          j.enrollment, j.max_enrollment, j.waitlist,
                          j.max_waitlist, j.prerequisites, j.corequisites,
                          j.restrictions);
    }

    static all(cb) {
        ajaxCSRF({
            url: '/courses/api/all/',
            method: 'POST',
            dataType: 'json'
        }).done(result => {
            if (cb)
                cb(result.map(data => {
                    return Course.fromJSON(data);
                }));
        });
    }

    getOtherSections(cb) {
        ajaxCSRF({
            url: '/courses/api/sections/',
            method: 'POST',
            dataType: 'json',
            data: {
                subject: this.subject,
                number: this.number
            }
        }).done(result => {
            if (cb)
                cb(result.filter(data => {
                    return data.section !== this.section;
                }).map(data => {
                    return Course.fromJSON(data);
                }));
        });
    }

    _convertMeetingsToDates(meetings) {
        let dates = [];

        const meetingsPattern = /([A-Z,\s]+)([0-9,\s]+)-([0-9,\s]+)/;
        const matches = meetingsPattern.exec(meetings);

        if (!matches)
            return dates;

        const days = jQuery.trim(matches[1]).split(', ');
        const starts = jQuery.trim(matches[2]).split(', ');
        const ends = jQuery.trim(matches[3]).split(', ');

        for (let i = 0; i < days.length; i++) {
            const dayString = days[i], start = starts[i], end = ends[i];

            for (let j = 0; j < dayString.length; j++) {
                const day = DAY_NUMBER_MAP[dayString[j]];
                const format = 'YYYY-MM-DD HHmm';

                dates.push({
                    start: Moment(`2007-01-${day} ${starts[i]}`, format),
                    end: Moment(`2007-01-${day} ${ends[i]}`, format)
                });
            }
        }

        return dates;
    }

    filterValue(key) {
        let value = this.filterMapping[key];
        if (value === undefined)
            value = this[key];
        return value;
    }

    getCRN() {
        return this.crn;
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
}
