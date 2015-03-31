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
}
