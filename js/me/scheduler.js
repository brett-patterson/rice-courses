import Schedulers from 'services/schedulers';


export default class Scheduler {
    constructor(name, map={}, shown=false) {
        this.name = name;
        this.map = map;
        this.shown = shown;
    }

    static fromJSON(j) {
        return new Scheduler(j.name, j.map, j.shown);
    }

    getName() {
        return this.name;
    }

    getMap() {
        return this.map;
    }

    getShown() {
        return this.shown;
    }

    setCourseShown(course, shown) {
        this.map[course.getCRN()] = shown;
        // console.log(Schedulers);
        // Schedulers.setCourseShown(this, course, shown);
    }
}
