define(["exports", "module", "react", "bootbox", "courses/course", "util"], function (exports, module, _react, _bootbox, _coursesCourse, _util) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

    module.exports = showConflicts;

    var React = _interopRequire(_react);

    var Bootbox = _interopRequire(_bootbox);

    var Course = _interopRequire(_coursesCourse);

    var ajaxCSRF = _util.ajaxCSRF;

    var ConflictsBody = React.createClass({
        displayName: "ConflictsBody",

        onClearClicked: function onClearClicked(event) {
            jQuery(event.target).siblings().find("label").each(function (i, label) {
                jQuery(label).removeClass("active").find("input").prop("checked", false);
            });
        },

        render: function render() {
            var _this = this;

            var msg = "We found some conflicts in your schedule. For each " + "conflict, please select the course you want to move.";

            var conflicts = this.props.conflicts.map(function (conflict, i) {
                var _conflict = _slicedToArray(conflict, 2);

                var courseOne = _conflict[0];
                var courseTwo = _conflict[1];

                return React.createElement(
                    "li",
                    { key: "conflict" + i, className: "conflict-choice" },
                    React.createElement(
                        "div",
                        { className: "btn-group", "data-toggle": "buttons" },
                        React.createElement(
                            "label",
                            { className: "btn btn-default" },
                            React.createElement("input", { type: "radio", value: courseOne.getCRN() }),
                            courseOne.getCourseID()
                        ),
                        React.createElement(
                            "label",
                            { className: "btn btn-default" },
                            React.createElement("input", { type: "radio", value: courseTwo.getCRN() }),
                            courseTwo.getCourseID()
                        )
                    ),
                    React.createElement("a", { onClick: _this.onClearClicked,
                        className: "glyphicon glyphicon-ban-circle clear-btn" })
                );
            });

            return React.createElement(
                "div",
                null,
                React.createElement(
                    "p",
                    null,
                    msg
                ),
                React.createElement(
                    "ol",
                    null,
                    conflicts
                )
            );
        }
    });

    function showConflicts(conflicts, cb) {
        var suffix = conflicts.length > 1 ? "s" : "";
        var dialog = Bootbox.dialog({
            title: "" + conflicts.length + " conflict" + suffix,
            message: jQuery("<div/>", { id: "conflicts-modal-content" }),
            size: "large",
            show: false,
            closeButton: false,
            buttons: {
                cancel: {
                    label: "Cancel",
                    className: "btn-danger"
                },
                confirm: {
                    label: "Confirm",
                    className: "btn-success",
                    callback: function callback() {
                        jQuery("input:checked", this).each(function (i, input) {
                            ajaxCSRF({
                                url: "/me/api/alternate/",
                                method: "POST",
                                data: {
                                    crn: input.value
                                },
                                dataType: "json"
                            }).done(function (result) {
                                cb(Course.fromJSON(result.course), result.alternates.map(function (courseJSON) {
                                    return Course.fromJSON(courseJSON);
                                }));
                            });
                        });
                    }
                }
            }
        });

        dialog.on("show.bs.modal", function (event) {
            React.render(React.createElement(ConflictsBody, { conflicts: conflicts }), jQuery("#conflicts-modal-content", event.target)[0]);
        });

        dialog.modal("show");
    }
});