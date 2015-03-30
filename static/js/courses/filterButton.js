define(["exports", "module", "react", "reactBootstrap", "util"], function (exports, module, _react, _reactBootstrap, _util) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var React = _interopRequire(_react);

    var Button = _reactBootstrap.Button;
    var hsvToHex = _util.hsvToHex;
    module.exports = React.createClass({
        displayName: "filterButton",

        /**
         * Get the appropriate color for the filter button.
         * @param {number} h - The hue for the color
         * @param {boolean} darken - Whether or not to darken the color slightly
         * @return {string} An HTML hex color string
         */
        getColor: function getColor(h) {
            var darken = arguments[1] === undefined ? false : arguments[1];

            var v = darken === true ? 0.75 : 0.85;
            return hsvToHex(h, 1, v);
        },

        getInitialState: function getInitialState() {
            return {
                darken: false
            };
        },

        darken: function darken() {
            this.setState({
                darken: true
            });
        },

        lighten: function lighten() {
            this.setState({
                darken: false
            });
        },

        fired: function fired() {
            if (this.props.delegate) {
                this.props.delegate.addFilter(this.props.filter, "");
            }
        },

        render: function render() {
            var style = {
                backgroundColor: this.getColor(this.props.hue, this.state.darken)
            };

            return React.createElement(
                "button",
                { className: "btn btn-filter", style: style,
                    onMouseEnter: this.darken, onMouseLeave: this.lighten,
                    onClick: this.fired },
                this.props.filter.getName()
            );
        }
    });
});