class CourseFilter {
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
    constructor(key, name, keywords=[], value='', compare=CourseFilter.contains) {
        this.key = key;
        this.name = name;

        this.keywords = keywords;
        this.keywords.push(key);

        this.value = value;
        this.compare = compare;
    }

    /**
     * Get the filter key.
     * @return {string} The filter's key
     */
    getKey() {
        return this.key;
    }

    /**
     * Get the filter name
     * @return {string} The name of the filter
     */
    getName() {
        return this.name;
    }

    /** Get the filter keywords.
     * @return {array} The filter's keywords
     */
    getKeywords() {
        return this.keywords;
    }

    /**
     * Set the value for the filter.
     * @param {any} value - The new value
     */
    setValue(value) {
        this.value = value;
    }

    /**
     * Test whether an object passes through the filter
     * @param {object} obj - The object to test
     * @return {boolean} Whether the object passes the filter
     */
     test(obj) {
        return this.compare(obj[this.key], value);
     }

    /**
     * A string comparison function that checks for containment (ignores case).
     * @param {string} one - The string to look inside of
     * @param {string} two - The string to check for
     * @return {boolean} Whether `one` contains `two`
     */
    static contains(one, two) {
        const haystack = String(one).toLowerCase();
        const needle = two.toLowerCase();
        return haystack.indexOf(needle) > -1;
    }

    /**
     * A factory that returns a function which filters courses based on
     * an exact match.
     * @param {string} field - The course field to filter on
     * @param {any} value - The value to filter for
     * @return {function} The filtering function
     */
    static exact(one, two) {
        return String(one).toLowerCase() === String(two).toLowerCase();
    }
}


export const FILTERS = [
    new CourseFilter('crn', 'CRN', ['crn']),
    new CourseFilter('course_id', 'Course ID', ['courseid', 'course_id', 'course id']),
    new CourseFilter('title', 'Title', ['title']),
    new CourseFilter('instructor', 'Instructor', ['instructor']),
    new CourseFilter('meeting', 'Meetings', ['meeting', 'meetings']),
    new CourseFilter('credits', 'Credits', ['credits']),
    new CourseFilter('s_distribution', 'Distribution', ['dist', 'distribution'],
                     '', CourseFilter.exact)
];

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