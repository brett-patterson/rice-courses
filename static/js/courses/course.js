define(["exports", "module"], function (exports, module) {
    "use strict";

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    var Course = (function () {
        function Course(crn, courseID, title, instructor, description, meetings, location, credits, distribution, enrollment, maxEnrollment, waitlist, maxWaitlist, prerequisites, corequisites, restrictions) {
            _classCallCheck(this, Course);

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
            getDescription: {
                value: function getDescription() {
                    return this.description;
                }
            },
            getMeetings: {
                value: function getMeetings() {
                    return this.meetings;
                }
            },
            getLocation: {
                value: function getLocation() {
                    return this.location;
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
            },
            getWaitlist: {
                value: function getWaitlist() {
                    return this.waitlist;
                }
            },
            getMaxWaitlist: {
                value: function getMaxWaitlist() {
                    return this.maxWaitlist;
                }
            },
            getWaitlistString: {
                value: function getWaitlistString() {
                    return "" + this.waitlist + "/" + this.maxWaitlist;
                }
            },
            getPrerequisites: {
                value: function getPrerequisites() {
                    return this.prerequisites;
                }
            },
            getCorequisites: {
                value: function getCorequisites() {
                    return this.corequisites;
                }
            },
            getRestrictions: {
                value: function getRestrictions() {
                    return this.restrictions;
                }
            }
        }, {
            fromJSON: {
                value: function fromJSON(j) {
                    var courseID = "" + j.subject + " " + j.course_number + " " + j.section;
                    var meetings = "" + j.meeting_days + " " + j.start_time + "-" + j.end_time;
                    return new Course(j.crn, courseID, j.title, j.instructor, j.description, meetings, j.location, j.credits, j.distribution, j.enrollment, j.max_enrollment, j.waitlist, j.max_waitlist, j.prerequisites, j.corequisites, j.restrictions);
                }
            }
        });

        return Course;
    })();

    module.exports = Course;
});