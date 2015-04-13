define(["exports", "module", "react", "bootbox", "util"], function (exports, module, _react, _bootbox, _util) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    module.exports = showSchedulerExport;

    var React = _interopRequire(_react);

    var Bootbox = _interopRequire(_bootbox);

    var ajaxCSRF = _util.ajaxCSRF;

    var ExportBody = React.createClass({
        displayName: "ExportBody",

        componentDidMount: function componentDidMount() {
            var _this = this;

            ajaxCSRF({
                url: "/me/api/scheduler/export/",
                method: "POST",
                data: {
                    id: this.props.scheduler.id
                }
            }).done(function (data) {
                jQuery(React.findDOMNode(_this.refs.content)).html(data);
            });
        },

        render: function render() {
            return React.createElement("div", { ref: "content" });
        }
    });

    function showSchedulerExport(scheduler) {
        var dialog = Bootbox.dialog({
            message: jQuery("<div/>", { id: "export-modal-content" }),
            onEscape: function () {},
            show: false,
            buttons: {
                close: {
                    label: "Close"
                }
            }
        });

        dialog.on("show.bs.modal", function (event) {
            React.render(React.createElement(ExportBody, { scheduler: scheduler }), jQuery("#export-modal-content", event.target)[0]);
        });

        dialog.modal("show");
    }
});