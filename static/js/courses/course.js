define(["exports", "module"], function (exports, module) {
    "use strict";

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    var Course = (function () {
        function Course(crn, courseID, title, instructor, meetings, credits, distribution, enrollment, maxEnrollment) {
            _classCallCheck(this, Course);

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

        _createClass(Course, {
            filterValue: {
                value: function filterValue(key) {
                    var value = this.filterMapping[key];
                    if (value === undefined) value = this[key];
                    return value;
                }
            },
            getCRN: {
                value: function getCRN() {
                    return this.crn;
                }
            },
            getCourseID: {
                value: function getCourseID() {
                    return this.courseID;
                }
            },
            getTitle: {
                value: function getTitle() {
                    return this.title;
                }
            },
            getInstructor: {
                value: function getInstructor() {
                    return this.instructor;
                }
            },
            getMeetings: {
                value: function getMeetings() {
                    return this.meetings;
                }
            },
            getCredits: {
                value: function getCredits() {
                    return this.credits;
                }
            },
            getDistribution: {
                value: function getDistribution() {
                    return this.distribution;
                }
            },
            getDistributionString: {
                value: function getDistributionString() {
                    var result = "";
                    for (var i = 0; i < this.distribution; i++) {
                        result += "I";
                    }return result;
                }
            },
            getEnrollment: {
                value: function getEnrollment() {
                    return this.enrollment;
                }
            },
            getMaxEnrollment: {
                value: function getMaxEnrollment() {
                    return this.maxEnrollment;
                }
            },
            getEnrollmentString: {
                value: function getEnrollmentString() {
                    return "" + this.enrollment + "/" + this.maxEnrollment;
                }
            },
            getEnrollmentPercentage: {
                value: function getEnrollmentPercentage() {
                    if (this.enrollment <= this.maxEnrollment) {
                        return this.enrollment / this.maxEnrollment * 100;
                    }return 0;
                }
            }
        }, {
            fromJSON: {
                value: function fromJSON(j) {
                    var courseID = "" + j.subject + " " + j.course_number + " " + j.section;
                    var meetings = "" + j.meeting_days + " " + j.start_time + "-" + j.end_time;
                    return new Course(j.crn, courseID, j.title, j.instructor, meetings, j.credits, j.distribution, j.enrollment, j.max_enrollment);
                }
            }
        });

        return Course;
    })();

    module.exports = Course;
});