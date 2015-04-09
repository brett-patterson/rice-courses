define(["exports", "module", "moment", "util"], function (exports, module, _moment, _util) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    var Moment = _interopRequire(_moment);

    var ajaxCSRF = _util.ajaxCSRF;

    var DAY_ABBR_MAP = {
        Monday: "M",
        Tuesday: "T",
        Wednesday: "W",
        Thursday: "R",
        Friday: "F"
    };

    var DAY_NUMBER_MAP = {
        M: "01",
        T: "02",
        W: "03",
        R: "04",
        F: "05"
    };

    var Course = (function () {
        function Course(crn, subject, number, section, title, instructor, description, meetings, location, credits, distribution, enrollment, maxEnrollment, waitlist, maxWaitlist, prerequisites, corequisites, restrictions) {
            _classCallCheck(this, Course);

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

        _createClass(Course, {
            getOtherSections: {
                value: function getOtherSections(cb) {
                    var _this = this;

                    ajaxCSRF({
                        url: "/courses/api/sections/",
                        method: "POST",
                        dataType: "json",
                        data: {
                            subject: this.subject,
                            number: this.number
                        }
                    }).done(function (result) {
                        if (cb) cb(result.filter(function (data) {
                            return data.section !== _this.section;
                        }).map(function (data) {
                            return Course.fromJSON(data);
                        }));
                    });
                }
            },
            _convertMeetingsToDates: {
                value: function _convertMeetingsToDates(meetings) {
                    var dates = [];

                    var meetingsPattern = /([A-Z,\s]+)([0-9,\s]+)-([0-9,\s]+)/;
                    var matches = meetingsPattern.exec(meetings);

                    if (!matches) {
                        return dates;
                    }var days = jQuery.trim(matches[1]).split(", ");
                    var starts = jQuery.trim(matches[2]).split(", ");
                    var ends = jQuery.trim(matches[3]).split(", ");

                    for (var i = 0; i < days.length; i++) {
                        var dayString = days[i],
                            start = starts[i],
                            end = ends[i];

                        for (var j = 0; j < dayString.length; j++) {
                            var day = DAY_NUMBER_MAP[dayString[j]];
                            var format = "YYYY-MM-DD HHmm";

                            dates.push({
                                start: Moment("2007-01-" + day + " " + starts[i], format),
                                end: Moment("2007-01-" + day + " " + ends[i], format)
                            });
                        }
                    }

                    return dates;
                }
            },
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
                    return "" + this.subject + " " + this.number + " " + this.section;
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
            getMeetingsString: {
                value: function getMeetingsString() {
                    var timesToDays = {};
                    for (var i = 0; i < this.meetings.length; i++) {
                        var meeting = this.meetings[i];

                        var startTime = meeting.start.format("HH:mm");
                        var endTime = meeting.end.format("HH:mm");
                        var time = "" + startTime + " - " + endTime;
                        var day = DAY_ABBR_MAP[meeting.start.format("dddd")];

                        if (timesToDays[time] === undefined) {
                            timesToDays[time] = day;
                        } else {
                            timesToDays[time] += day;
                        }
                    }

                    var result = "";
                    for (var times in timesToDays) {
                        result += "" + timesToDays[times] + " " + times + ", ";
                    }

                    return result.substring(0, result.length - 2);
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
                    var meetings = "" + j.meeting_days + " " + j.start_time + "-" + j.end_time;
                    return new Course(j.crn, j.subject, j.course_number, j.section, j.title, j.instructor, j.description, meetings, j.location, j.credits, j.distribution, j.enrollment, j.max_enrollment, j.waitlist, j.max_waitlist, j.prerequisites, j.corequisites, j.restrictions);
                }
            },
            all: {
                value: function all(cb) {
                    ajaxCSRF({
                        url: "/courses/api/all/",
                        method: "POST",
                        dataType: "json"
                    }).done(function (result) {
                        if (cb) cb(result.map(function (data) {
                            return Course.fromJSON(data);
                        }));
                    });
                }
            }
        });

        return Course;
    })();

    module.exports = Course;
});