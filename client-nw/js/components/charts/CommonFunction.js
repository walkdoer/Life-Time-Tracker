module.exports = {

    getUserHighchartOptions: function() {
        var options = {};
        if (this.props.legend === false) {
            options.legend = { enabled: false };
        }
        return options;
    }
};