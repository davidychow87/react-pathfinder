export default class Unit {

    //Entity is used as node or edge type, this is base prototype for node and edges
    constructor(entity, properties) {
        this.entity = entity;
        this.load(properties || {});
    }

    //load properties (id, name, age etc) from an object
    load(properties) {
        let p = Object.create(null);

        Object.keys(properties).forEach((prop) => {
            p[prop] = properties[prop];
        });

        this.properties = p;

        return this;
    }

    set(property, value) {
        return this.properties[property] = value;
    }

    unset(property) {
        return delete this.properties[property];
    }

    has(property) {
        return Object.prototype.hasOwnProperty.call(this.properties, property);
    }

    get(property) {
        return this.properties[property];
    }

    toString() {
        return [this.constructor.name, ' (', this.entity, ' ', JSON.stringify(this.properties) ,')'].join('');
    }
}