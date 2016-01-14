export default class CourseFilter {
    /**
     * Create a new CourseFilter object.
     * @param {string} key - The key to filter objects for
     * @param {string} name - A human-readable name for the filter
     * @param {array} keywords - An array of string keywords that all denote
     *  the filter
     * @param {any} value - The value to filter for
     * @param {array or function} - An array of value suggestions or an function
     *  that takes a callback used to provide the suggestions
     *  a boolean that is the result of a comparison between the two
     */
    constructor(key, name, keywords=[], value='', suggestions=[]) {
        this.key = key;
        this.name = name;

        this.keywords = keywords;
        this.keywords.push(key);

        this.value = value;

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
     * Serialize the filter to a JSON string.
     * @return {string} The serialized filter
     */
    toJSON() {
        return JSON.stringify({
            key: this.key,
            name: this.name,
            keywords: this.keywords,
            value: this.value,
            suggestions: this.suggestions
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
            const obj = JSON.parse(objJSON);
            const keyIndex = obj.keywords.indexOf(obj.key);
            if (keyIndex > -1) {
                obj.keywords.splice(keyIndex, 1);
            }

            return new CourseFilter(obj.key, obj.name, obj.keywords, obj.value,
                                    obj.suggestions);
        });
    }
}
