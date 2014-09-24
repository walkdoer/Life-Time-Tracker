var calendar = new CalHeatMap();
d3.json("/calendars/sport/2014", function(error, data) {
    var renderData = {};
    data.forEach(function (val) {
        var seconds = new Date(val.date).getTime() / 1000;
        renderData[seconds] = val.sportTime;
    });
    calendar.init({
        id:'sport-calendar',
        data: renderData,
        start: new Date(2014, 0),
        domain: "month",
        subDomain: "day",
        cellSize: 10,
        cellPadding: 2
    });
});
