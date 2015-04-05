define(["exports", "module", "services/schedulers"], function (exports, module, _servicesSchedulers) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    var Schedulers = _interopRequire(_servicesSchedulers);

    var Scheduler = (function () {
        function Scheduler(name) {
            var map = arguments[1] === undefined ? {} : arguments[1];
            var shown = arguments[2] === undefined ? false : arguments[2];

            _classCallCheck(this, Scheduler);

            this.name = name;
            this.map = map;
            this.shown = shown;
        }

        _createClass(Scheduler, {
            getName: {
                value: function getName() {
                    return this.name;
                }
            },
            setName: {
                value: function setName(name) {
                    this.name = name;
                    // TODO: ADD SERVER CALL
                }
            },
            getMap: {
                value: function getMap() {
                    return this.map;
                }
            },
            setCourseShown: {
                value: function setCourseShown(course, shown) {
                    this.map[course.getCRN()] = shown;
                    // console.log(Schedulers);
                    // Schedulers.setCourseShown(this, course, shown);
                }
            },
            getShown: {
                value: function getShown() {
                    return this.shown;
                }
            },
            setShown: {
                value: function setShown(shown) {
                    this.shown = shown;
                    // TODO: ADD SERVER CALL
                }
            }
        }, {
            fromJSON: {
                value: function fromJSON(j) {
                    return new Scheduler(j.name, j.map, j.shown);
                }
            }
        });

        return Scheduler;
    })();

    module.exports = Scheduler;
});