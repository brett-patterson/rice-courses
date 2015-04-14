define(["exports", "module", "react"], function (exports, module, _react) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var React = _interopRequire(_react);

    module.exports = React.createClass({
        displayName: "filterInput",

        getInitialState: function getInitialState() {
            this.mouseOverSuggestions = false;

            return {
                value: this.props.filter.getValue(),
                showSuggestions: false
            };
        },

        remove: function remove() {
            this.props.delegate.removeFilter(this.props.filter);
        },

        inputKeyDown: function inputKeyDown(event) {
            if (event.keyCode === 13) {
                // Enter: Focus main input
                React.findDOMNode(this.props.delegate.refs.input).focus();
            } else if (event.keyCode === 8 && this.state.value === "") {
                // Backspace: Remove input if no text entered
                this.remove();
                React.findDOMNode(this.props.delegate.refs.input).focus();
            } else if (event.keyCode === 40) {
                // Down arrow: Focus suggestions menu if it exists
                if (this.refs.suggestions) {
                    this.mouseOverSuggestions = true;

                    var suggestNode = React.findDOMNode(this.refs.suggestions);
                    jQuery("a", suggestNode).eq(0).focus();
                    event.preventDefault();
                }
            }
        },

        inputChanged: function inputChanged(event) {
            this.setValue(event.target.value);
        },

        onInputClick: function onInputClick(event) {
            // Prevent the event from bubbling down to the FilterWidget, which
            // takes focus on click
            event.stopPropagation();
        },

        onFocus: function onFocus(event) {
            this.setState({
                showSuggestions: true
            });
        },

        onBlur: function onBlur(event) {
            if (!this.mouseOverSuggestions) {
                this.setState({
                    showSuggestions: false
                });
            }
        },

        setValue: function setValue(value) {
            this.props.delegate.updateFilter(this.props.filter, value);

            this.setState({
                value: value
            });
        },

        suggestionClicked: function suggestionClicked(event) {
            this.acceptSuggestion(event.target.text);
        },

        suggestionKeyFired: function suggestionKeyFired(event) {
            if (event.keyCode === 13) {
                // Enter: accept the suggestion
                this.acceptSuggestion(event.target.text);
            } else if (event.keyCode === 40) {
                // Down arrow: focus the next suggestion
                jQuery(event.target).parent().next().find("a").focus();
                event.preventDefault();
            } else if (event.keyCode === 38) {
                // Up arrow: focus the previous suggestion or focus the input if
                // at the top of the list of suggestions
                var prev = jQuery(event.target).parent().prev();

                if (prev.length === 0) {
                    React.findDOMNode(this.refs.input).focus();
                } else {
                    prev.find("a").focus();
                }

                event.preventDefault();
            }
        },

        acceptSuggestion: function acceptSuggestion(suggestion) {
            var _this = this;

            this.setValue(suggestion);

            this.setState({
                showSuggestions: false
            }, function () {
                React.findDOMNode(_this.refs.input).focus();
            });
        },

        onMouseEnter: function onMouseEnter(event) {
            this.mouseOverSuggestions = true;
        },

        onMouseLeave: function onMouseLeave(event) {
            this.mouseOverSuggestions = false;
        },

        renderSuggestions: function renderSuggestions(event) {
            var _this = this;

            var applicable = this.props.filter.getApplicableSuggestions();

            if (!this.state.showSuggestions || applicable.length === 0) {
                return undefined;
            }

            var suggestionItems = applicable.map(function (suggestion, i) {
                var key = "" + applicable.length + "." + i;
                return React.createElement(
                    "li",
                    { key: key },
                    React.createElement(
                        "a",
                        { tabIndex: i, onClick: _this.suggestionClicked,
                            onKeyDown: _this.suggestionKeyFired },
                        suggestion
                    )
                );
            });

            return React.createElement(
                "div",
                { ref: "suggestions", className: "filter-suggestions",
                    onMouseEnter: this.onMouseEnter,
                    onMouseLeave: this.onMouseLeave },
                React.createElement(
                    "ul",
                    null,
                    suggestionItems
                )
            );
        },

        render: function render() {
            var virtual = jQuery("<span/>", {
                text: this.state.value
            }).hide().appendTo(document.body);

            var style = {
                marginLeft: 5,
                width: virtual.width() + 10
            };

            virtual.remove();

            return React.createElement(
                "div",
                { className: "filter-view" },
                React.createElement(
                    "span",
                    { className: "filter-view-name" },
                    "" + this.props.filter.getName()
                ),
                React.createElement("input", { ref: "input", className: "filter-view-input", style: style,
                    onKeyDown: this.inputKeyDown,
                    onChange: this.inputChanged,
                    value: this.state.value,
                    onClick: this.onInputClick,
                    onFocus: this.onFocus,
                    onBlur: this.onBlur }),
                this.renderSuggestions(),
                React.createElement(
                    "a",
                    { onClick: this.remove },
                    React.createElement("span", { className: "glyphicon glyphicon-remove" })
                )
            );
        }
    });
});