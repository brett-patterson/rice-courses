export default class CourseFilter {
    /**
     * Create a new CourseFilter object.
     * @param {string} key - The key to filter objects for
     * @param {string} name - A human-readable name for the filter
     * @param {array} keywords - An array of string keywords that all denote
     *  the filter
     * @param {any} value - The value to filter for
     * @param {function} compare - A function that takes two values and returns
     * @param {array or function} - An array of value suggestions or an function
     *  that takes a callback used to provide the suggestions
     *  a boolean that is the result of a comparison between the two
     */
    constructor(key, name, keywords=[], value='', compare=CourseFilter.contains,
                suggestions=[]) {
        this.key = key;
        this.name = name;

        this.keywords = keywords;
        this.keywords.push(key);

        this.value = value;
        this.compare = compare;

        if (typeof suggestions === 'function') {
            this.suggestions = [];
            suggestions(result => {
                this.suggestions = result;
            });
        } else {
            this.suggestions = suggestions;
        }
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

    /** Get the value for the filter.
     * @return {any} The filter's value
     */
    getValue() {
        return this.value;
    }

    /**
     * Set the value for the filter.
     * @param {any} value - The new value
     */
    setValue(value) {
        this.value = value;
    }

    /**
     * Get all suggestions.
     * @return {array} The array of suggestions
     */
    getSuggestions() {
        return this.suggestions;
    }

    /**
     * Get all suggestions that start with the current value.
     * @return {array} A filtered list of suggestions.
     */
    getApplicableSuggestions() {
        return this.suggestions.filter(suggestion => {
            return suggestion.toLowerCase().indexOf(this.value.toLowerCase()) === 0;
        });
    }

    /**
     * Test whether a Course passes through the filter
     * @param {Course} course - The course to test
     * @return {boolean} Whether the course passes the filter
     */
     test(course) {
        return this.compare(course.filterValue(this.key), this.value);
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
