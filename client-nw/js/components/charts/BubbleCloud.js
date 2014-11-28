'use strict';
var d3 = require('d3');
var React = require('react');
var root = {};
var _ = require('lodash');

var Bubbles = function(options) {
    var chart, clear, click, collide, collisionPadding, connectEvents, data, force, gravity, hashchange, height, idValue, jitter, label, margin, maxRadius, minCollisionRadius, mouseout, mouseover, node, rScale, rValue, textValue, tick, transformData, update, updateActive, updateLabels, updateNodes, width;
    width = options.width;
    height = options.height;
    data = [];
    node = null;
    label = null;
    margin = {
        top: 5,
        right: 0,
        bottom: 0,
        left: 0
    };
    maxRadius = 65;
    var minRadius = 5;
    rScale = d3.scale.sqrt().range([minRadius, maxRadius]);
    rValue = function(d) {
        return parseInt(d.count);
    };
    idValue = function(d) {
        return d.name;
    };
    textValue = function(d) {
        return d.name;
    };
    collisionPadding = 4;
    minCollisionRadius = 12; //minRadius + 5;
    jitter = 0.5;
    transformData = function(rawData) {
        rawData.forEach(function(d) {
            d.count = parseInt(d.count);
            return rawData.sort(function() {
                return 0.5 - Math.random();
            });
        });
        return rawData;
    };
    tick = function(e) {
        var dampenedAlpha;
        dampenedAlpha = e.alpha * 0.1;
        node.each(gravity(dampenedAlpha)).each(collide(jitter)).attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
        return label.style("left", function(d) {
            return ((margin.left + d.x) - d.dx / 2) + "px";
        }).style("top", function(d) {
            return ((margin.top + d.y) - d.dy / 2) + "px";
        });
    };
    force = d3.layout.force().gravity(0).charge(0).size([width, height]).on("tick", tick);
    chart = function(selection) {
        return selection.each(function(rawData) {
            var maxDomainValue, svg, svgEnter;
            data = transformData(rawData);
            maxDomainValue = d3.max(data, function(d) {
                return rValue(d);
            });
            rScale.domain([0, maxDomainValue]);
            svg = d3.select(this).selectAll("svg").data([data]);
            svgEnter = svg.enter().append("svg");
            svg.attr("width", width + margin.left + margin.right);
            svg.attr("height", height + margin.top + margin.bottom);
            node = svgEnter.append("g").attr("id", "bubble-nodes").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            node.append("rect").attr("id", "bubble-background").attr("width", width).attr("height", height).on("click", clear);
            label = d3.select(this).selectAll("#bubble-labels").data([data]).enter().append("div").attr("id", "bubble-labels");
            update();
            hashchange();
            return d3.select(window).on("hashchange", hashchange);
        });
    };
    update = function() {
        data.forEach(function(d) {
            return d.forceR = Math.max(minCollisionRadius, rScale(rValue(d)));
        });
        force.nodes(data).start();
        updateNodes();
        return updateLabels();
    };
    updateNodes = function() {
        node = node.selectAll(".bubble-node").data(data, function(d) {
            return idValue(d);
        });
        node.exit().remove();
        return node.enter().append("a").attr("class", "bubble-node").attr("xlink:href", function(d) {
            return "#" + (encodeURIComponent(idValue(d)));
        }).call(force.drag).call(connectEvents).append("circle").attr("r", function(d) {
            var r = rScale(rValue(d));
            return r;
        });
    };
    updateLabels = function() {
        var labelEnter;
        label = label.selectAll(".bubble-label").data(data, function(d) {
            return idValue(d);
        });
        label.exit().remove();
        labelEnter = label.enter().append("a").attr("class", "bubble-label").attr("href", function(d) {
            return "#" + (encodeURIComponent(idValue(d)));
        }).call(force.drag).call(connectEvents);
        labelEnter.append("div").attr("class", "bubble-label-name").text(function(d) {
            return textValue(d);
        });
        labelEnter.append("div").attr("class", "bubble-label-value").text(function(d) {
            return rValue(d);
        });
        label.style("font-size", function(d) {
            return Math.max(8, rScale(rValue(d) / 2)) + "px";
        }).style("width", function(d) {
            return 2.5 * rScale(rValue(d)) + "px";
        });
        label.append("span").text(function(d) {
            return textValue(d);
        }).each(function(d) {
            return d.dx = Math.max(2.5 * rScale(rValue(d)), this.getBoundingClientRect().width);
        }).remove();
        label.style("width", function(d) {
            return d.dx + "px";
        });
        return label.each(function(d) {
            return d.dy = this.getBoundingClientRect().height;
        });
    };
    gravity = function(alpha) {
        var ax, ay, cx, cy;
        cx = width / 2;
        cy = height / 2;
        ax = alpha / 8;
        ay = alpha;
        return function(d) {
            d.x += (cx - d.x) * ax;
            return d.y += (cy - d.y) * ay;
        };
    };
    collide = function(jitter) {
        return function(d) {
            return data.forEach(function(d2) {
                var distance, minDistance, moveX, moveY, x, y;
                if (d !== d2) {
                    x = d.x - d2.x;
                    y = d.y - d2.y;
                    distance = Math.sqrt(x * x + y * y);
                    minDistance = d.forceR + d2.forceR + collisionPadding;
                    if (distance < minDistance) {
                        distance = (distance - minDistance) / distance * jitter;
                        moveX = x * distance;
                        moveY = y * distance;
                        d.x -= moveX;
                        d.y -= moveY;
                        d2.x += moveX;
                        return d2.y += moveY;
                    }
                }
            });
        };
    };
    connectEvents = function(d) {
        d.on("click", click);
        d.on("mouseover", mouseover);
        return d.on("mouseout", mouseout);
    };
    clear = function() {
        return location.replace("#");
    };
    click = function(d) {
        location.replace("#" + encodeURIComponent(idValue(d)));
        return d3.event.preventDefault();
    };
    hashchange = function() {
        var id;
        id = decodeURIComponent(location.hash.substring(1)).trim();
        return updateActive(id);
    };
    updateActive = function(id) {
        node.classed("bubble-selected", function(d) {
            return id === idValue(d);
        });
        if (id.length > 0) {
            return d3.select("#status").html("<h3>The word <span class=\"active\">" + id + "</span> is now active</h3>");
        } else {
            return d3.select("#status").html("<h3>No word is active</h3>");
        }
    };
    mouseover = function(d) {
        return node.classed("bubble-hover", function(p) {
            return p === d;
        });
    };
    mouseout = function() {
        return node.classed("bubble-hover", false);
    };
    chart.jitter = function(_) {
        if (!arguments.length) {
            return jitter;
        }
        jitter = _;
        force.start();
        return chart;
    };
    chart.height = function(_) {
        if (!arguments.length) {
            return height;
        }
        height = _;
        return chart;
    };
    chart.width = function(_) {
        if (!arguments.length) {
            return width;
        }
        width = _;
        return chart;
    };
    chart.r = function(_) {
        if (!arguments.length) {
            return rValue;
        }
        rValue = _;
        return chart;
    };
    return chart;
};

root.plotData = function(selector, data, plot) {
    return d3.select(selector).datum(data).call(plot);
};

function preprocessData(data) {
    data.forEach(function (item) {
        if (!item.name) {
            item.name = item.label;
        }
    });
    return data;
}
root.render = function (dom, data, options) {
    var plot, plotData = root.plotData;
    plot = Bubbles(options);
    data = preprocessData(data);
    return plotData(dom, data, plot);
};

var ReactBubble = React.createClass({
    displayName: 'bubble',
    render: function () {
        var className = 'ltt_c-chart ltt_c-chart-bubbleCloud ' + this.props.className;
        return (
            <div className={className}></div>
        );
    },

    componentDidMount: function () {
        var that = this;
        var $el = $(this.getDOMNode());
        this.size = {
            width: $el.width(),
            height: $el.height()
        };
        $(window).on('resize', function () {
            var $el = $(that.getDOMNode());
            that.size = {
                width: $el.width(),
                height: $el.height()
            };
            that.setData(that.props.data);
        });
    },

    setData: function (data) {
        this._data = data;
        root.render(this.getDOMNode(), data, _.pick(this.size, 'width', 'height'));
    }
});

module.exports = ReactBubble;
