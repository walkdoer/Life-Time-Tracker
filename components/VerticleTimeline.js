'use strict';

var React = require('react');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var _ = require('lodash');
var Moment = require('moment');
var Q = require('q');

/** Compoentns */
var Tag = require('../components/Tag');

module.exports = React.createClass({

    propTypes: {
        activitys: React.PropTypes.array
    },

    getDefaultProps: function () {
        return {
            activitys: []
        };
    },

    render: function () {
        var activitys = this.props.activitys;
        return (
            <ul className="ltt_c-VerticleTimeline cbp_tmtimeline">
            {
                activitys.map(function (activity) {
                    return <Activity data={activity}/>
                })
            }
            </ul>
        );
    }
});




var Activity = React.createClass({

    render: function () {
        var activity = this.props.data;
        var mStart = Moment(activity.start);
        var signs = activity.signs;
        var iconStyle;
        var activityCls;
        if (!_.isEmpty(activity.classes)) {
            activityCls = activity.classes[0];
        }
        if (activityCls) {
            iconStyle = {
                backgroundColor: activityCls.color
            };
        }
        var icon;
        if (!_.isEmpty(signs)) {
            if (signs.indexOf("wake"))  {
                icon = <i className="fa fa-sun-o"></i>
            } else if (signs.indexOf("sleep")) {
                icon = <i className="fa fa-bed"></i>
            }
        }
        if (!icon && activityCls && activityCls.icon) {
            icon = <i className={"fa " + activityCls.icon}/>
        }
        return (
            <li className="ltt_c-VerticleTimeline-Activity">
                <div className="cbp_cls" style={{backgroundColor: activityCls.color}}>{activityCls.name}</div>
                <time className="cbp_tmtime" datetime={activity.start}>
                    <span className="cbp_date">{mStart.format('YYYY-MM-DD')}</span>
                    <span className="cbp_time">{mStart.format('HH:mm')}</span>
                </time>
                <div className="cbp_tmicon" style={iconStyle}>{icon}</div>
                <div className="cbp_tmlabel">
                    <div className="arrow"></div>
                    <div className="cbp_title">
                        {activity.project ? <span>{activity.project.name}</span> : null}
                        {activity.version ? <span>{activity.version.name}</span> : null}
                        {activity.task ? <span>{activity.task.name}</span> : null}
                    </div>
                    <div className="cbp_tags">
                    {
                        activity.tags ? activity.tags.map(function (tag) {
                            return <Tag>{tag}</Tag>
                        }) : null
                    }
                    </div>
                    <div className="cbp_content">{activity.content}</div>
                </div>
            </li>
        );
    }
});