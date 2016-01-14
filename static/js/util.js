import jQuery from 'jquery';

/**
 * A modified indexOf function with an optional key function.
 * @param {array} array - The array to search through
 * @param {any} value - The value to search for
 * @param {function} key - An optional key function for each object
 * @return {int} The index in the array, or -1
 */
export function indexOf(array, value, key) {
    if (key === undefined) {
        return array.indexOf(value);
    } else {
        for (let i = 0; i < array.length; i++) {
            if (key(array[i]) === value)
                return i;
        }

        return -1;
    }
}

/**
 * Check if two events overlap in time.
 * @param {object} eventOne
 * @param {object} eventTwo
 * @param {boolean} Whether or not the two events' times overlap
 */
export function eventOverlap(eventOne, eventTwo) {
    return (eventOne.start.isBetween(eventTwo.start, eventTwo.end) ||
            eventOne.end.isBetween(eventTwo.start, eventTwo.end) ||
            eventOne.start.isSame(eventTwo.start) ||
            eventOne.start.isSame(eventTwo.end) ||
            eventOne.end.isSame(eventTwo.start) ||
            eventOne.end.isSame(eventTwo.end));
}

/**
 * Check if two courses overlap in time.
 * @param {Course} courseOne
 * @param {Course} courseTwo
 * @param {boolean} Whether or not the two courses' times overlap
 */
export function courseOverlap(courseOne, courseTwo) {
    const oneMeetings = courseOne.getMeetings();
    const twoMeetings = courseTwo.getMeetings();

    for (let i = 0; i < oneMeetings.length; i++) {
        let one = oneMeetings[i];

        for (let j = 0; j < twoMeetings.length; j++) {
            let two = twoMeetings[j];

            if (eventOverlap(one, two)) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Construct an HTML class string from a mapping of strings to boolean values.
 * @param {object} classes - The classes to evaluate
 * @return {string} An HTML class string
 */
export function makeClasses(classes) {
    let result = '';

    for (let key in classes) {
        if (!classes[key])
            continue;

        if (result.length > 0)
            result += ' ';

        result += key;
    }

    return result;
}

/**
 * Get the appropriate hue based on an item's index in an array.
 * @param {number} index - The index of the item
 * @param {number} total - The total number of items
 * @return {number} The hue of the item
 */
export function getHueByIndex(index=0, total=1) {
    return 360 / total * index;
}

/**
 * Convert a decimal number to a hexadecimal number (base 10 -> base 16)
 * @param {number} dec - The decimal value to convert
 * @return {number} A hexadecimal representation of the number
 */
export function decToHex(dec) {
    let hexString = parseInt(dec, 10).toString(16);
    if (hexString === '0')
        hexString += '0';
    return hexString;
}

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
export function hsvToRgb(h, s, v) {
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

    r = Math.round(r * 255 + m);
    g = Math.round(g * 255 + m);
    b = Math.round(b * 255 + m);

    return [r, g, b];
}

/** Convert an RGB color to a hexadecimal color string.
 * @param {number} r - The red value of the color
 * @param {number} g - The green value of the color
 * @param {number} b - The blue value of the color
 * @return {string} An HTML hex string
 */
export function rgbToHex(r, g, b) {
    return `#${decToHex(r)}${decToHex(g)}${decToHex(b)}`;
}

/**
 * Get the value of a cookie
 * @param {string} name - The name of the cookie
 * @return {string} The value of the cookie or undefined
 */
export function getCookie(name) {
    let cookieValue = null;

    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = jQuery.trim(cookies[i]);
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }

    return cookieValue;
}


/**
 * Make an AJAX request with the proper CSRF authentication.
 * @param {object} config - The config object for the jQuery AJAX request.
 * @return {Promise} A jQuery promise object for the request
 */
export function ajaxCSRF(config) {
    const requestConfig = jQuery.extend(config, {
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    });

    return jQuery.ajax(requestConfig);
}

/**
 * A custom React PropTypes validator that checks that the prop value
 * is an object with the given properties.
 * @param {array} propertyNames - The names of the functions to check for
 * @param {boolean} required - Whether or not the prop should be required
 * @return {function} The React Prop Type validation function
 */
export function propTypeHas(propertyNames, required=true) {
    return (props, propName) => {
        const prop = props[propName];

        if (required && (prop === undefined || prop === null)) {
            return new Error(`Must specify non-null prop: ${propName}.`);
        }

        if (typeof prop !== 'object') {
            return new Error(`${propName} must be an object.`);
        }

        for (let i = 0; i < propertyNames.length; i++) {
            const property = propertyNames[i];
            if (prop[property] === undefined) {
                const msg = `${propName} must have a ${property} property.`;
                return new Error(msg);
            }
        }
    };
}

/**
 * Wrap an ES6 React Component class to autobind methods like React.createClass
 * does.
 * @param {klass} class - The class to wrap
 * @return {class} A class with appropriate methods correctly bound.
 */
export function wrapComponentClass(klass) {
    // See https://github.com/facebook/react/blob/master/src/isomorphic/classic/class/ReactClass.js#L79
    const reactInterfaceKeys = [
        'mixins', 'statics', 'propTypes', 'contextTypes', 'childContextTypes',
        'getDefaultProps', 'getInitialState', 'getChildContext', 'render',
        'componentWillMount', 'componentDidMount', 'componentWillReceiveProps',
        'shouldComponentUpdate', 'componentWillUpdate', 'componentDidUpdate',
        'componentWillUnmount', 'updateComponent'
    ];

    let Constructor = (...args) => {
        let instance = new klass(...args);
        let proto = Object.getPrototypeOf(instance);
        for (let key of Object.getOwnPropertyNames(proto)) {
            let isReactKey = reactInterfaceKeys.indexOf(key) > -1;
            let isFunction = typeof proto[key] === 'function';
            if (!isReactKey && isFunction) {
                instance[key] = proto[key].bind(instance);
            }
        }
        return instance;
    };

    Constructor.propTypes = klass.propTypes;
    Constructor.defaultProps = klass.defaultProps;

    return Constructor;
}


/**
 * Collapse a series of partial functions into one function.
 * @param {partials} array - An array of partial functions
 * @return {function} A single, collapsed
 */
export function collapsePartials(...partials) {
    return (...args) => {
        return partials.slice(1).reduce((v, f) => f(v), partials[0](...args));
    };
}
