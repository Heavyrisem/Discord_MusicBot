const classtest = require('./class');

class test extends classtest {
    constructor() {
        super();
    }
    classname() {
        console.log(this.num);
    }
}

const d = new test;

module.exports = test;