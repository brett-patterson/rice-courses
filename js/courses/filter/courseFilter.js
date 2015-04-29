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
            const suggest = suggestion.toLowerCase();
            const val = this.value.toLowerCase();
            return suggest.indexOf(val) === 0 && suggest !== val;
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
     * Serialize the filter to a JSON string.
     * @return {string} The serialized filter
     */
    toJSON() {
        const obj = {
            key: this.key,
            name: this.name,
            keywords: this.keywords,
            value: this.value,
            compare: this.compare,
            suggestions: this.suggestions
        };

        return JSON.stringify(obj, (key, value) => {
            if (typeof value === 'function') {
                return value.toString();
            }

            return value;
        });
    }

     /**
      * Reconstruct an array of CourseFilter objects from a JSON string.
      * @param {string} json - The JSON string to parse
      * @return {array<CourseFilter>} The reconstructed CourseFilter objects
      */
    static arrayFromJSON(jsonString) {
        const objList = JSON.parse(jsonString);

        return objList.map(objJSON => {
            const obj = JSON.parse(objJSON, (key, value) => {
                if (value && typeof value === 'string' &&
                    value.substr(0, 8) === 'function') {
                    const startArgs = value.indexOf('(') + 1;
                    const endArgs = value.indexOf(')');
                    const startBody = value.indexOf('{') + 1;
                    const endBody = value.lastIndexOf('}');

                    return new Function(value.substring(startArgs, endArgs),
                                        value.substring(startBody, endBody));
                }

                return value;
            });

            const keyIndex = obj.keywords.indexOf(obj.key);
            if (keyIndex > -1) {
                obj.keywords.splice(keyIndex, 1);
            }

            return new CourseFilter(obj.key, obj.name, obj.keywords, obj.value,
                                    obj.compare, obj.suggestions);
        });
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
