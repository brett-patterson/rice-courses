define(["exports", "module", "react", "bootbox", "courses/course", "me/scheduler", "util"], function (exports, module, _react, _bootbox, _coursesCourse, _meScheduler, _util) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    module.exports = showSchedulerExport;

    var React = _interopRequire(_react);

    var Bootbox = _interopRequire(_bootbox);

    var Course = _interopRequire(_coursesCourse);

    var Scheduler = _interopRequire(_meScheduler);

    var ajaxCSRF = _util.ajaxCSRF;

    var ExportBody = React.createClass({
        displayName: "ExportBody",

        propTypes: {
            scheduler: React.PropTypes.instanceOf(Scheduler).isRequired
        },

        componentDidMount: function componentDidMount() {
            var _this = this;

            ajaxCSRF({
                url: "/me/api/scheduler/export/",
                method: "POST",
                data: {
                    id: this.props.scheduler.getID()
                }
            }).done(function (data) {
                var courses = data.map(function (courseJSON) {
                    var course = Course.fromJSON(courseJSON);
                    var crn = course.getCRN();
                    var crnInput = React.createElement("input", { type: "text", className: "text-center",
                        value: crn, maxLength: 5, readOnly: true,
                        onClick: _this.selectCRN });
                    return React.createElement(
                        "p",
                        { key: crn },
                        React.createElement(
                            "strong",
                            null,
                            course.getCourseID()
                        ),
                        " ",
                        crnInput
                    );
                });

                React.render(React.createElement(
                    "div",
                    null,
                    courses
                ), React.findDOMNode(_this.refs.content));
            });
        },

        selectCRN: function selectCRN(event) {
            event.target.select();
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