define(["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    /**
     * A modified indexOf function with an optional key function.
     * @param {array} array - The array to search through
     * @param {any} value - The value to search for
     * @param {function} key - An optional key function for each object
     * @return {int} The index in the array, or -1
     */
    var indexOf = function (array, value, key) {
        if (key === undefined) {
            return array.indexOf(value);
        } else {
            for (var i = 0; i < array.length; i++) {
                if (key(array[i]) === value) return i;
            }

            return -1;
        }
    };

    exports.indexOf = indexOf;
    /**
     * Check if two events overlap in time.
     * @param {object} eventOne
     * @param {object} eventTwo
     * @param {boolean} Whether or not the two events' times overlap
     */
    var eventOverlap = function (eventOne, eventTwo) {
        return eventOne.start.isBetween(eventTwo.start, eventTwo.end) || eventOne.end.isBetween(eventTwo.start, eventTwo.end) || eventOne.start.isSame(eventTwo.start) || eventOne.start.isSame(eventTwo.end) || eventOne.end.isSame(eventTwo.start) || eventOne.end.isSame(eventTwo.end);
    };

    exports.eventOverlap = eventOverlap;
    /**
     * Check if two courses overlap in time.
     * @param {Course} courseOne
     * @param {Course} courseTwo
     * @param {boolean} Whether or not the two courses' times overlap
     */
    var courseOverlap = function (courseOne, courseTwo) {
        var oneMeetings = courseOne.getMeetings();
        var twoMeetings = courseTwo.getMeetings();

        for (var i = 0; i < oneMeetings.length; i++) {
            var one = oneMeetings[i];

            for (var j = 0; j < twoMeetings.length; j++) {
                var two = twoMeetings[j];

                if (eventOverlap(one, two)) {
                    return true;
                }
            }
        }

        return false;
    };

    exports.courseOverlap = courseOverlap;
    /**
     * Construct an HTML class string from a mapping of strings to boolean values.
     * @param {object} classes - The classes to evaluate
     * @return {string} An HTML class string
     */
    var makeClasses = function (classes) {
        var result = "";

        for (var key in classes) {
            if (!classes[key]) continue;

            if (result.length > 0) result += " ";

            result += key;
        }

        return result;
    };

    exports.makeClasses = makeClasses;
    /**
     * Get the appropriate hue based on an item's index in an array.
     * @param {number} index - The index of the item
     * @param {number} total - The total number of items
     * @return {number} The hue of the item
     */
    var getHueByIndex = function () {
        var index = arguments[0] === undefined ? 0 : arguments[0];
        var total = arguments[1] === undefined ? 1 : arguments[1];

        return 360 / total * index;
    };

    exports.getHueByIndex = getHueByIndex;
    /**
     * Convert a decimal number to a hexadecimal number (base 10 -> base 16)
     * @param {number} dec - The decimal value to convert
     * @return {number} A hexadecimal representation of the number
     */
    var decToHex = function (dec) {
        var hexString = parseInt(dec, 10).toString(16);
        if (hexString === "0") hexString += "0";
        return hexString;
    };

    exports.decToHex = decToHex;
    /**
     * Convert a HSV color to an RGB color. Uses the
     * algorithm described here:
     * http://en.wikipedia.org/wiki/HSL_and_HSV#From_HSV
     * to convert from HSV to RGB, then converts to hexadecimal.
     * @param {number} h - The hue of the color
     * @param {number} s - The saturation of the color
     * @param {number} v - The value of the color
     * @return {array} The [red, green, blue] components of the color
     */
    var hsvToRgb = function (h, s, v) {
        var r = 0,
            g = 0,
            b = 0;

        var chroma = s * v;
        var hPrime = h / 60;
        var x = chroma * (1 - Math.abs(hPrime % 2 - 1));

        if (hPrime >= 0 && hPrime < 1) {
            r = chroma;
            g = x;
            b = 0;
        } else if (hPrime >= 1 && hPrime < 2) {
            r = x;
            g = chroma;
            b = 0;
        } else if (hPrime >= 2 && hPrime < 3) {
            r = 0;
            g = chroma;
            b = x;
        } else if (hPrime >= 3 && hPrime < 4) {
            r = 0;
            g = x;
            b = chroma;
        } else if (hPrime >= 4 && hPrime < 5) {
            r = x;
            g = 0;
            b = chroma;
        } else if (hPrime >= 5 && hPrime < 6) {
            r = chroma;
            g = 0;
            b = x;
        }

        var m = v - chroma;

        r = Math.round(r * 255 + m);
        g = Math.round(g * 255 + m);
        b = Math.round(b * 255 + m);

        return [r, g, b];
    };

    exports.hsvToRgb = hsvToRgb;
    /** Convert an RGB color to a hexadecimal color string.
     * @param {number} r - The red value of the color
     * @param {number} g - The green value of the color
     * @param {number} b - The blue value of the color
     * @return {string} An HTML hex string
     */
    var rgbToHex = function (r, g, b) {
        return "#" + decToHex(r) + "" + decToHex(g) + "" + decToHex(b);
    };

    exports.rgbToHex = rgbToHex;
    /**
     * Get the value of a cookie
     * @param {string} name - The name of the cookie
     * @return {string} The value of the cookie or undefined
     */
    var getCookie = function (name) {
        var cookieValue = null;

        if (document.cookie && document.cookie !== "") {
            var cookies = document.cookie.split(";");
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                if (cookie.substring(0, name.length + 1) === name + "=") {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }

        return cookieValue;
    };

    exports.getCookie = getCookie;
    /**
     * Make an AJAX request with the proper CSRF authentication.
     * @param {object} config - The config object for the jQuery AJAX request.
     * @return {Promise} A jQuery promise object for the request
     */
    var ajaxCSRF = function (config) {
        var requestConfig = jQuery.extend(config, {
            headers: {
                "X-CSRFToken": getCookie("csrftoken")
            }
        });

        return jQuery.ajax(requestConfig);
    };

    exports.ajaxCSRF = ajaxCSRF;
    /**
     * A custom React PropTypes validator that checks that the prop value
     * is an object with the given properties.
     * @param {array} propertyNames - The names of the functions to check for
     * @param {boolean} required - Whether or not the prop should be required
     * @return {function} The React Prop Type validation function
     */
    var propTypeHas = function (propertyNames) {
        var required = arguments[1] === undefined ? true : arguments[1];

        return function (props, propName, componentName) {
            var prop = props[propName];

            if (required && (prop === undefined || prop === null)) {
                return new Error("Must specify non-null prop: " + propName + ".");
            }

            if (typeof prop !== "object") {
                return new Error("" + propName + " must be an object.");
            }

            for (var i = 0; i < propertyNames.length; i++) {
                var property = propertyNames[i];
                if (prop[property] === undefined) {
                    var msg = "" + propName + " must have a " + property + " property.";
                    return new Error(msg);
                }
            }
        };
    };
    exports.propTypeHas = propTypeHas;
});