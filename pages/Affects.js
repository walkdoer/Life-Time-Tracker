/**
 * @jsx React.DOM
 */

var React = require('react');
var $ = require('jquery');
var Moment = require('moment');
var ReactBootStrap = require('react-bootstrap');
var TabbedArea = ReactBootStrap.TabbedArea;
var TabPane = ReactBootStrap.TabPane;
var Modal = ReactBootStrap.Modal;
var ModalTrigger = ReactBootStrap.ModalTrigger;
var Button = ReactBootStrap.Button;
var ReactPropTypes = React.PropTypes;
var numeral = require('numeral');
var cx = require('react/lib/cx');

/** constant */
var ENTER_KEY_CODE = 13;

/** Components */
var LoadingMask = require('../components/LoadingMask');
var Notify = require('../components/Notify');

/** Actions */

var AffectAction = require('../actions/AffectAction');
var AffectStore = require('../stores/AffectStore');
var AffectConstant = require('../constants/AffectConstant');

/** utils */
var DataAPI = require('../utils/DataAPI');


module.exports = React.createClass({

    getInitialState: function () {
        return this.getStateFromStore();
    },

    getStateFromStore: function () {
        return {
            loaded: AffectStore.loaded,
            loadError: AffectStore.loadError,
            positiveAffects: AffectStore.positiveAffects,
            negativeAffects: AffectStore.negativeAffects
        };
    },

    componentDidMount: function () {
        AffectStore.addChangeListener(this._onStoreChange);
        AffectAction.load();
    },

    _onStoreChange: function () {
        this.setState(this.getStateFromStore());
    },

    componentWillUnmount: function () {
        AffectStore.removeChangeListener(this._onStoreChange);
    },

    render: function () {
        var positiveAffects = this.state.positiveAffects;
        var negativeAffects = this.state.negativeAffects;

        var from = new Moment().startOf('week').toDate(),
            to = new Moment().endOf('week').toDate();

        return <div className="ltt_c-page ltt_c-page-Affects">
            <div className="ltt_c-page-Affects-content">
                <div className="ltt_c-page-Affects-content-header">
                    <div className="ltt_c-page-Affects-content-header-title">情绪管理</div>
                    <ModalTrigger modal={<RecordModal className="ltt_c-RecordModal"
                        negativeAffects={negativeAffects}
                        positiveAffects={positiveAffects}/>}>
                        <Button bsSize="medium">New Record</Button>
                    </ModalTrigger>
                </div>
                <Grid className="ltt_c-page-Affects-content-chart">
                    <Row>
                        {positiveAffects.map(function (affect) {
                            return <Col><WeekAffectLine affect={affect} from={from} to={to}/></Col>
                        })}
                    </Row>

                    <Row>
                        {negativeAffects.map(function (affect) {
                            return <Col><WeekAffectLine affect={affect} from={from} to={to}/></Col>
                        })}
                    </Row>
                </Grid>
            </div>
            <Aside/>
        </div>
    }
});

var Grid = React.createClass({

    render: function () {
        var className = "ltt_c-Grid";
        if (this.props.className) {
            className += ' ' +  this.props.className;
        }
        return <div {...this.props} className={className}>{this.props.children}</div>
    }
});

var Row = React.createClass({

    render: function () {
        var className = "ltt_c-Row";
        if (this.props.className) {
            className += ' ' +  this.props.className;
        }
        return <div {...this.props} className={className}>{this.props.children}</div>
    }
});


var Col = React.createClass({

    render: function () {
        var className = "ltt_c-Col";
        if (this.props.className) {
            className += + ' ' +  this.props.className;
        }
        return <div {...this.props} className={className}>{this.props.children}</div>
    }
});

var WeekAffectLine = React.createClass({

    render: function () {
        return (
            <div className="ltt_c-chart-WeekAffectLine">
            </div>
        );
    },

    componentDidMount: function () {
        var that = this;
        DataAPI.AffectRecord.load({
            affectId: this.props.affect._id,
            from: this.props.from,
            to: this.props.to
        }).then(function (data) {
            that.plot(data);
        })
    },
    plot: function (data) {
        var affect = this.props.affect;
        $(this.getDOMNode()).highcharts({
            chart: {
                type: 'spline'
            },
            title: {
                text: affect.name + ' : 一周情绪走势'
            },
            subtitle: {
                text: new Moment(this.props.from).format('MM-DD') + ' ~ ' + new Moment(this.props.to).format('MM-DD')
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: { // don't display the dummy year
                    hour: '%I %p',
                    minute: '%I:%M %p'
                },
                title: {
                    enabled: true,
                    text: 'Hours of the Day'
                },
            },
            yAxis: {
                title: {
                    text: 'Affect Score'
                },
                min: -5,
                max: 5
            },
            tooltip: {
                headerFormat: '<b>{series.name}</b><br>',
                //pointFormat: '{point.x:%e. %b}: {point.y}'
            },

            plotOptions: {
                spline: {
                    marker: {
                        enabled: true
                    }
                }
            },

            series: this.getSeries(data)
        });
    },


    getSeries: function (data) {
        var today = new Moment().format('YYYY-MM-DD ');
        var series = [];
        data.forEach(function (affectRecord) {
            var createTime = new Moment(affectRecord.createTime);
            var day = createTime.day();
            var serie = series.filter(function (serie) {
                return serie.name === day;
            })[0];
            console.log(today + createTime.format('HH:mm:ss'))
            var newDate = new Moment(today + createTime.format('HH:mm:ss'));
            var item = [
                newDate.unix() * 1000,
                affectRecord.score
            ];
            if (serie) {
                serie.data.push(item);
            } else {
                series.push({
                    name: day,
                    data: [item]
                });
            }
        });
        return series;
    }
});

var Aside = React.createClass({

    getInitialState: function () {
        return this.getStateFromStore();
    },

    getStateFromStore: function () {

        return {
            loaded: AffectStore.loaded,
            loadError: AffectStore.loadError,
            createError: AffectStore.createError,
            positiveAffects: AffectStore.positiveAffects,
            negativeAffects: AffectStore.negativeAffects
        };
    },

    render: function () {
        if (this.state.loadError) {
            Notify.error('加载失败');
        }
        return <aside className="ltt_c-page-Affects-sidebar">
            <TabbedArea defaultActiveKey={1} animation={false}>
                <TabPane eventKey={1} tab="Positive">
                    <AffectsList items={this.state.positiveAffects} type="P"/>
                </TabPane>
                <TabPane eventKey={2} tab="Negative">
                    <AffectsList items={this.state.negativeAffects} type="N"/>
                </TabPane>
            </TabbedArea>
            <LoadingMask loaded={this.state.loaded}/>
        </aside>
    },

    componentDidMount: function () {
        AffectStore.addChangeListener(this._onStoreChange);
        AffectAction.load();
    },

    _onStoreChange: function () {
        this.setState(this.getStateFromStore());
    },

    componentWillUnmount: function () {
        AffectStore.removeChangeListener(this._onStoreChange);
    }
})

var RecordModal = React.createClass({

    getInitialState: function () {
        return {
            record: this._initScore()
        };
    },

    _initScore: function () {
        var record = {};
        this.props.positiveAffects.forEach(initScore);
        this.props.negativeAffects.forEach(initScore);

        function initScore(affect) {
            record[affect._id] = 0;
        }

        return record;
    },

    componentWillReceiveProps: function () {
        this.setState({
            record: this._initScore()
        });
    },

    render: function() {
        var that = this;
        return (
            <Modal {...this.props} bsStyle="primary" title="记录情绪" animation={true}>
                <div className="modal-body">
                    <h1>Positive</h1>
                    <div className="affectList">
                        {this.props.positiveAffects.map(function (affect){
                            return <AffectRange affect={affect} onChange={that._onValueChange}/>;
                        })}
                    </div>
                    <h1>Negative</h1>
                    <div className="affectList">
                        {this.props.negativeAffects.map(function (affect){
                            return <AffectRange affect={affect} onChange={that._onValueChange}/>;
                        })}
                    </div>
                </div>
                <div className="modal-footer">
                    <Button onClick={this.props.onRequestHide}>Close</Button>
                    <Button bsStyle="primary" onClick={this._onSave}>Save</Button>
                </div>
            </Modal>
        );
    },

    getRecord: function () {
        return this.state.record;
    },

    _onSave: function () {
        var record = this.getRecord();
        var that = this;
        DataAPI.AffectRecord.create(record).then(function () {
            that.props.onRequestHide();
        }).fail(function () {
            Notify.error('Record affect failed');
        });
    },

    _onValueChange: function (affect, score) {
        var record = this.state.record;
        record[affect._id] = score;
        this.setState({
            record: record
        });
    }
});

var AffectRange = React.createClass({

    getInitialState: function () {
        return {
            value: this.props.value || 0
        };
    },

    render: function() {
        var affect = this.props.affect;
        return (
            <div className="ltt_c-AffectRange">
                <label for={affect.name}>{affect.name} {this.state.value}</label>
                <input id={affect.name} type ="range" min ="-5" max="5" step ="1" onChange={this.onChange}/>
            </div>
        );
    },

    onChange: function (e) {
        this.setState({
            value: e.target.value
        }, function () {
            this.props.onChange(this.props.affect, numeral(this.state.value).value());
        });
    }
});

var AffectsList = React.createClass({


    render: function () {
        return <div className="ltt_c-AffectsList">
            {this.props.items.map(function(affect) {
                return <Affect affect={affect}/>
            })}
            <div className="ltt_c-AffectsList-item ltt_c-AffectsList-add">
                <AffectTextInput onSave={this.newAffect} placeholder="Add New Affect"/>
            </div>
        </div>
    },

    newAffect: function (name) {
        AffectAction.create({
            type: this.props.type,
            name: name
        });
    }
});


var Affect = React.createClass({

    getInitialState: function () {
        return {
            isEditing: false
        };
    },


    render: function () {
        var affect = this.props.affect;

        var input;
        if (this.state.isEditing) {
            input = <AffectTextInput value={affect.name}
                onSave={this._onSave}/>
        }

        return <div className={
            cx({
                'ltt_c-Affect': true,
                'editing': this.state.isEditing
            })}>
            <label onDoubleClick={this._enterEditing}>{affect.name}</label>
            {input}
        </div>
    },

    _enterEditing: function () {
        this.setState({
            isEditing: true
        });
    },

    _onSave: function (val) {
        console.log('save ' + val);
        AffectAction.updateText(this.props.affect.id, val);
        this.setState({
            isEditing: false
        });
    }
});


var AffectTextInput = React.createClass({

    propTypes: {
        className: ReactPropTypes.string,
        id: ReactPropTypes.string,
        placeholder: ReactPropTypes.string,
        onSave: ReactPropTypes.func.isRequired,
        value: ReactPropTypes.string
    },

    getInitialState: function() {
        return {
            value: this.props.value || ''
        };
    },

    render: function(){
        return (
          <input
            className={this.props.className}
            id={this.props.id}
            placeholder={this.props.placeholder}
            onChange={this._onChange}
            onKeyDown={this._onKeyDown}
            value={this.state.value}
            autoFocus={true}/>
        );
    },


    _save: function() {
        this.props.onSave(this.state.value);
        this.setState({
            value: ''
        });
    },


    _onChange: function(event) {
        this.setState({
            value: event.target.value
        });
    },

    _onKeyDown: function(event) {
        if (event.keyCode === ENTER_KEY_CODE) {
            this._save();
        }
    }
});

