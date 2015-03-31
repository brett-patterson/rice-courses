export default class Course {
    constructor(crn, courseID, title, instructor, description, meetings,
                location, credits, distribution, enrollment, maxEnrollment,
                waitlist, maxWaitlist, prerequisites, corequisites, restrictions) {
        this.crn = crn;
        this.courseID = courseID;
        this.title = title;
        this.instructor = instructor;
        this.description = description;
        this.meetings = meetings;
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
            distribution: this.getDistributionString()
        };
    }

    static fromJSON(j) {
        const courseID = `${j.subject} ${j.course_number} ${j.section}`;
        const meetings = `${j.meeting_days} ${j.start_time}-${j.end_time}`;
        return new Course(j.crn, courseID, j.title, j.instructor, j.description,
                          meetings, j.location, j.credits, j.distribution,
                          j.enrollment, j.max_enrollment, j.waitlist,
                          j.max_waitlist, j.prerequisites, j.corequisites,
                          j.restrictions);
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
        return this.courseID;
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
