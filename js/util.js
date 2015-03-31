/**
 * Construct an HTML class string from a mapping of strings to boolean values.
 * @param {object} classes - The classes to evaluate
 * @return {string} An HTML class string
 */
export const makeClasses = classes => {
    let result = '';

    for (let key in classes) {
        if (!classes[key])
            continue;

        if (result.length > 0)
            result += ' ';

        result += key;
    }

    return result;
};

/**
 * Convert a decimal number to a hexadecimal number (base 10 -> base 16)
 * @param {number} dec - The decimal value to convert
 * @return {number} A hexadecimal representation of the number
 */
export const decToHex = dec => {
    let hexString = parseInt(dec, 10).toString(16);
    if (hexString === '0')
        hexString += '0';
    return hexString;
};

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
export const hsvToHex = (h, s, v) => {
    let r = 0, g = 0, b = 0;

    const chroma = s * v;
    const hPrime = h / 60;
    const x = chroma * (1 - Math.abs(hPrime % 2 - 1));

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

    const m = v - chroma;

    r = r * 255 + m;
    g = g * 255 + m;
    b = b * 255 + m;

    return `#${decToHex(r)}${decToHex(g)}${decToHex(b)}`;
};
