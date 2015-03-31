export default class Course {
    constructor(crn, courseID, title, instructor, meetings, credits,
                distribution, enrollment, maxEnrollment) {
        this.crn = crn;
        this.courseID = courseID;
        this.title = title;
        this.instructor = instructor;
        this.meetings = meetings;
        this.credits = credits;
        this.distribution = distribution;
        this.enrollment = enrollment;
        this.maxEnrollment = maxEnrollment;

        this.filterMapping = {
            distribution: this.getDistributionString()
        };
    }

    static fromJSON(j) {
        const courseID = `${j.subject} ${j.course_number} ${j.section}`;
        const meetings = `${j.meeting_days} ${j.start_time}-${j.end_time}`;
        return new Course(j.crn, courseID, j.title, j.instructor, meetings,
                          j.credits, j.distribution, j.enrollment,
                          j.max_enrollment);
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

    getMeetings() {
        return this.meetings;
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
}
