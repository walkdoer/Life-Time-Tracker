var SetIntervalMixin = {
    componentWillMount: function() {
        this.intervals = [];
    },
    setInterval: function() {
        var id = setInterval.apply(null, arguments);
        this.intervals.push(id);
        return id;
    },
    clearInterval: function (intervalId) {
        if (intervalId !== undefined) {
            this.intervals.forEach(function (id) {
                if (id === intervalId) {
                    clearInterval(id);
                }
            });
        } else {
            this.intervals.map(clearInterval);
        }
    },
    componentWillUnmount: function() {
        this.clearInterval();
    }
};

module.exports = SetIntervalMixin;