define(["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
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
});