class classtest {
    constructor() {
        this.num = 1;
        this.classname();
        this.count();
    }
    
    count() {
        var e = this;
        this.interval = setInterval(function() {
            e.num++;
            e.classname();
            if(e.num == 10) e.clear();
        }, 1000);
    }
    clear() {
        clearInterval(this.interval);
    }
}

module.exports = classtest;