define(["exports"], function (exports) {
    "use strict";

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var CourseFilter = (function () {
        /**
         * Create a new CourseFilter object.
         * @param {string} key - The key to filter objects for
         * @param {string} name - A human-readable name for the filter
         * @param {array} keywords - An array of string keywords that all denote
         *  the filter
         * @param {any} value - The value to filter for
         * @param {function} compare - A function that takes two values and returns
         *  a boolean that is the result of a comparison between the two
         */

        function CourseFilter(key, name) {
            var keywords = arguments[2] === undefined ? [] : arguments[2];
            var value = arguments[3] === undefined ? "" : arguments[3];
            var compare = arguments[4] === undefined ? CourseFilter.contains : arguments[4];

            _classCallCheck(this, CourseFilter);

            this.key = key;
            this.name = name;

            this.keywords = keywords;
            this.keywords.push(key);

            this.value = value;
            this.compare = compare;
        }

        _createClass(CourseFilter, {
            getKey: {

                /**
                 * Get the filter key.
                 * @return {string} The filter's key
                 */

                value: function getKey() {
                    return this.key;
                }
            },
            getName: {

                /**
                 * Get the filter name
                 * @return {string} The name of the filter
                 */

                value: function getName() {
                    return this.name;
                }
            },
            getKeywords: {

                /** Get the filter keywords.
                 * @return {array} The filter's keywords
                 */

                value: function getKeywords() {
                    return this.keywords;
                }
            },
            setValue: {

                /**
                 * Set the value for the filter.
                 * @param {any} value - The new value
                 */

                value: function setValue(value) {
                    this.value = value;
                }
            },
            test: {

                /**
                 * Test whether an object passes through the filter
                 * @param {object} obj - The object to test
                 * @return {boolean} Whether the object passes the filter
                 */

                value: function test(obj) {
                    return this.compare(obj[this.key], value);
                }
            }
        }, {
            contains: {

                /**
                 * A string comparison function that checks for containment (ignores case).
                 * @param {string} one - The string to look inside of
                 * @param {string} two - The string to check for
                 * @return {boolean} Whether `one` contains `two`
                 */

                value: function contains(one, two) {
                    var haystack = String(one).toLowerCase();
                    var needle = two.toLowerCase();
                    return haystack.indexOf(needle) > -1;
                }
            },
            exact: {

                /**
                 * A factory that returns a function which filters courses based on
                 * an exact match.
                 * @param {string} field - The course field to filter on
                 * @param {any} value - The value to filter for
                 * @return {function} The filtering function
                 */

                value: function exact(one, two) {
                    return String(one).toLowerCase() === String(two).toLowerCase();
                }
            }
        });

        return CourseFilter;
    })();

    var FILTERS = [new CourseFilter("crn", "CRN", ["crn"]), new CourseFilter("course_id", "Course ID", ["courseid", "course_id", "course id"]), new CourseFilter("title", "Title", ["title"]), new CourseFilter("instructor", "Instructor", ["instructor"]), new CourseFilter("meeting", "Meetings", ["meeting", "meetings"]), new CourseFilter("credits", "Credits", ["credits"]), new CourseFilter("s_distribution", "Distribution", ["dist", "distribution"], "", CourseFilter.exact)];

    //     {
    //         id: 'major',
    //         cleanName: 'Major',
    //         keywords: ['major'],
    //         factory: function(field, value) {
    //             return function(course) {
    //                 // requirements.courses(value, function(courses) {
    //                 //     TODO: FACTORY SHOULD ACCEPT PROMISES
    //                 // });
    //                 return true;
    //             };
    //         }
    //     }
    // ];
    exports.FILTERS = FILTERS;
});