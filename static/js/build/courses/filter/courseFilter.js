define(["exports", "module"], function (exports, module) {
    "use strict";

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    var CourseFilter = (function () {
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

        function CourseFilter(key, name) {
            var _this = this;

            var keywords = arguments[2] === undefined ? [] : arguments[2];
            var value = arguments[3] === undefined ? "" : arguments[3];
            var suggestions = arguments[4] === undefined ? [] : arguments[4];

            _classCallCheck(this, CourseFilter);

            this.key = key;
            this.name = name;

            this.keywords = keywords;
            this.keywords.push(key);

            this.value = value;

            if (typeof suggestions === "function") {
                this.suggestions = [];
                suggestions(function (result) {
                    _this.suggestions = result;
                });
            } else {
                this.suggestions = suggestions;
            }
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
            getValue: {

                /** Get the value for the filter.
                 * @return {any} The filter's value
                 */

                value: function getValue() {
                    return this.value;
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
            getSuggestions: {

                /**
                 * Get all suggestions.
                 * @return {array} The array of suggestions
                 */

                value: function getSuggestions() {
                    return this.suggestions;
                }
            },
            getApplicableSuggestions: {

                /**
                 * Get all suggestions that start with the current value.
                 * @return {array} A filtered list of suggestions.
                 */

                value: function getApplicableSuggestions() {
                    var _this = this;

                    return this.suggestions.filter(function (suggestion) {
                        var suggest = suggestion.toLowerCase();
                        var val = _this.value.toLowerCase();
                        return suggest.indexOf(val) === 0 && suggest !== val;
                    });
                }
            },
            toJSON: {

                /**
                 * Serialize the filter to a JSON string.
                 * @return {string} The serialized filter
                 */

                value: function toJSON() {
                    return JSON.stringify({
                        key: this.key,
                        name: this.name,
                        keywords: this.keywords,
                        value: this.value,
                        suggestions: this.suggestions
                    });
                }
            }
        }, {
            arrayFromJSON: {

                /**
                 * Reconstruct an array of CourseFilter objects from a JSON string.
                 * @param {string} json - The JSON string to parse
                 * @return {array<CourseFilter>} The reconstructed CourseFilter objects
                 */

                value: function arrayFromJSON(jsonString) {
                    var objList = JSON.parse(jsonString);

                    return objList.map(function (objJSON) {
                        var obj = JSON.parse(objJSON);
                        var keyIndex = obj.keywords.indexOf(obj.key);
                        if (keyIndex > -1) {
                            obj.keywords.splice(keyIndex, 1);
                        }

                        return new CourseFilter(obj.key, obj.name, obj.keywords, obj.value, obj.suggestions);
                    });
                }
            }
        });

        return CourseFilter;
    })();

    module.exports = CourseFilter;
});