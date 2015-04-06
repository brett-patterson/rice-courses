define(["exports", "jquery"], function (exports, _jquery) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var jQuery = _interopRequire(_jquery);

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
     * Convert a HSV color to a hexadecimal RGB color. Uses the
     * algorithm described here:
     * http://en.wikipedia.org/wiki/HSL_and_HSV#From_HSV
     * to convert from HSV to RGB, then converts to hexadecimal.
     * @param {number} h - The hue of the color
     * @param {number} s - The saturation of the color
     * @param {number} v - The value of the color
     * @return {string} An HTML hexadecimal string 
     */
    var hsvToHex = function (h, s, v) {
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

        r = r * 255 + m;
        g = g * 255 + m;
        b = b * 255 + m;

        return "#" + decToHex(r) + "" + decToHex(g) + "" + decToHex(b);
    };

    exports.hsvToHex = hsvToHex;
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
});