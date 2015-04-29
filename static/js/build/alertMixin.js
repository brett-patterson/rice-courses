define(["exports", "module", "react", "reactBootstrap", "util"], function (exports, module, _react, _reactBootstrap, _util) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var React = _interopRequire(_react);

    var Alert = _reactBootstrap.Alert;
    var indexOf = _util.indexOf;
    module.exports = {
        getInitialState: function getInitialState() {
            return {
                alerts: []
            };
        },

        addAlert: function addAlert(html, style) {
            var timeout = arguments[2] === undefined ? 3000 : arguments[2];

            this.setState(React.addons.update(this.state, {
                alerts: {
                    $push: [{ html: html, style: style, timeout: timeout, id: Date.now() }]
                }
            }));
        },

        handleAlertDismissFactory: function handleAlertDismissFactory(message) {
            var _this = this;

            return function (event) {
                var index = indexOf(_this.state.alerts, message.id, function (message) {
                    return message.id;
                });

                if (index > -1) _this.setState(React.addons.update(_this.state, {
                    alerts: {
                        $splice: [[index, 1]]
                    }
                }));
            };
        },

        renderAlerts: function renderAlerts() {
            var _this = this;

            var alerts = this.state.alerts.map(function (message, index) {
                return React.createElement(
                    Alert,
                    { key: message.id,
                        bsStyle: message.style,
                        dismissAfter: message.timeout,
                        onDismiss: _this.handleAlertDismissFactory(message) },
                    React.createElement("span", { dangerouslySetInnerHTML: { __html: message.html } })
                );
            });

            return React.createElement(
                "div",
                { className: "alert-container" },
                alerts
            );
        }
    };
});