var React = require('react');
var RB = require('react-bootstrap');
var Button = RB.Button;
var ButtonToolbar = RB.ButtonToolbar;
var ButtonGroup = RB.ButtonGroup;
var Input = RB.Input;
var Grid = RB.Grid;
var Row = RB.Row;
var Col = RB.Col;
var TabbedArea = RB.TabbedArea;
var TabPane = RB.TabPane;
var store = require('store2');
var numeral = require('numeral');
var _ = require('lodash');
var TrackerHelper = require('tracker/helper');
window.tinycolor = require('tinyColor');
require('colorPicker');
var extend = require('extend');

var config = require('../conf/config');

/** Components */
var Notify = require('../components/Notify');
var Progress = require('../components/Progress');

require('../libs/fontawesome-iconpicker.js');

/** Utils */
var DataAPI = require('../utils/DataAPI');

/** constants */
var ENERGY_STORAGE_KEY = 'energy_value';
var SLEEP_VALUE_STORAGE_KEY = 'sleep_value';
var ENERGY_CONFIG_STORAGE_KEY = 'energy_config';
var NORMAL_COST_STORAGE_KEY = 'normal_cost';

var defaultValue = {
    energy: 100
};

var _settings = {};
var _currentPort = null;

module.exports = React.createClass({

    statics: {
        load: function () {
            return DataAPI.Settings.load().then(function (settings) {
                return (_settings = settings);
            });
        },

        get: function (key) {
            return key ? _settings[key] : _settings;
        },

        setEnergy: function (val) {
            store(ENERGY_STORAGE_KEY, val);
        },

        getDefaultEnergy: function () {
            return defaultValue.energy;
        },

        getEnergySettings: function () {
            var content = store(ENERGY_CONFIG_STORAGE_KEY);
            var configs = [];
            if (content) {
                 configs = content.split('\n').map(function (config) {
                    var configObj = TrackerHelper.getLogInfo({
                        logStr: config,
                        noTime: true
                    });
                    configObj.value = numeral(configObj.content.trim().split('=')[1]).value();
                    return configObj;
                });
            }

            return {
                energy: store(ENERGY_STORAGE_KEY) || defaultValue.energy,
                sleepValue: store(SLEEP_VALUE_STORAGE_KEY) || 10,
                normalCost: store(NORMAL_COST_STORAGE_KEY) || -4,
                configs: configs
            };
        }
    },

    getInitialState: function () {
        return {
            settings: {},
            energy: store(ENERGY_STORAGE_KEY) || defaultValue.energy,
            sleepValue: store(SLEEP_VALUE_STORAGE_KEY) || 10,
            normalCost: store(NORMAL_COST_STORAGE_KEY) || -4
        };
    },

    render: function () {
        return (
            <div className="ltt_c-page ltt_c-page-settings">
                <TabbedArea defaultActiveKey={1} animation={false}>
                    <TabPane eventKey={1} tab='App Settings'>{this.renderApplicationSettings()}</TabPane>
                    <TabPane eventKey={2} tab='Enery Settings'>{this.renderEnerySettings()}</TabPane>
                    <TabPane eventKey={3} tab='Classes Settings'><ClassesSettings/></TabPane>
                </TabbedArea>
            </div>
        );
    },

    renderApplicationSettings: function () {
        var settings = this.state;
        return (
            <form className='ltt_c-page-settings-form'>
                <Grid>
                    <h3>Basic Settings</h3>
                    <hr/>
                    <Row>
                        <Col xs={6} md={4}>
                            <Input name="name" type='text' label='Name' placeholder='input your name' value={settings.name} onChange={this.onSettingChange}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={6} md={4}>
                            <Input name="birthday" type='text' label='Birthday'
                                placeholder='your birthday'
                                help="Birthday is required for time statistical"
                                value={settings.birthday} onChange={this.onSettingChange}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={6} md={4}>
                            <Input  name="startDate" type='text' label='Start Day'
                                placeholder='the first day start using this app'
                                help="Start date is the first day when you log your activity."
                                value={settings.startDate} onChange={this.onSettingChange}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} md={8}>
                        <div class="form-group">
                            <label class="control-label">
                                <span>Log file folder</span>
                            </label>
                            <input type="text" name="logDir"
                                placeholder="full path"
                                className="form-control"
                                webkitdirectory
                                onChange={this.onSettingChange}
                                value={settings.logDir}/>
                            <span className="help-block">where to save your log file, if you have Dropbox, you may set this option to your Dropbox folder , so you can backup your log data in Dropbox.</span>
                        </div>
                        </Col>
                    </Row>
                    <h3>Advanced settings</h3>
                    <hr/>
                    <Row>
                        <Col xs={4} md={2}>
                            <Input type='text' label='Server Port'  name="serverPort"
                                help="If server port is ocupy, you can change here"
                                onChange={this.onSettingChange}
                                value={settings.serverPort}/>
                        </Col>
                    </Row>
                    <ButtonToolbar>
                        <Button bsStyle='primary' onClick={this.save}>Apply</Button>
                        <Button onClick={this.cancel}>Cancel</Button>
                    </ButtonToolbar>
                </Grid>
            </form>
        );
    },

    renderEnerySettings: function () {
        return (
            <Grid>
                <Row>
                    <Col xs={4} md={2} className="vcenter">
                        <Input name="energyValue" type='number' label='Energy Value'
                            value={this.state.energy} onChange={this.onEneryChange}/>
                    </Col>
                    <Col xs={8} md={4} className="vcenter">
                        <Progress max={100} value={this.state.energy}/>
                    </Col>
                </Row>
                <Row>
                    <Col xs={4} md={2}>
                        <Input name="normalCost" type='number' label='一般消耗'
                            addonAfter="Per Hour"
                            value={this.state.normalCost} onChange={this.onNormalChange}/>
                        <Input name="Sleep Value" type='number' label='睡眠值'
                            addonAfter="Per Hour"
                            value={this.state.sleepValue} onChange={this.onSleepValueChange}/>
                    </Col>
                </Row>
                <Row>
                    <Col xs={8} md={6}>
                        <label className="control-label"> Energy Config</label>
                        <pre id="energy-config"/>
                    </Col>
                </Row>
            </Grid>
        );
    },


    onEneryChange: function (e) {
        var value = numeral(e.target.value).value();
        store(ENERGY_STORAGE_KEY, value);
        this.setState({
            energy: value
        }, function () {
            _settings = this.state;
        });
    },

    onSleepValueChange: function (e) {
        var value = numeral(e.target.value).value();
        store(SLEEP_VALUE_STORAGE_KEY, value);
        this.setState({
            sleepValue: value
        }, function () {
            _settings = this.state;
        });
    },

    onNormalChange: function (e) {
        var value = numeral(e.target.value).value();
        store(NORMAL_COST_STORAGE_KEY, value);
        this.setState({
            normalCost: value
        }, function () {
            _settings = this.state;
        });
    },

    componentDidMount: function () {
        this.loadSettings();
        this._initEditor();
    },


    loadSettings: function () {
        var that = this;
        DataAPI.Settings.load().then(function (data) {
            that.setState(data);
            _currentPort = data.serverPort;
        });
    },

    save: function () {
        var that = this;
        DataAPI.Settings.save(this.state).then(function () {
            var newPort = that.state.serverPort;
            if (_currentPort !== newPort) {
                _currentPort = newPort;
                Ltt.serverPort = newPort;
                Ltt.restartServer();
            }
            Notify.success('Change setting success!');
        }).catch(function (err) {
            Notify.error('Change settting failed', err);
        });
    },

    cancel: function () {
        this.back();
    },

    onSettingChange: function (e) {
        var target = e.target;
        var name = target.name;
        var setting = {}
        setting[name] = target.value;
        this.setState(setting, function () {
            _settings = this.state;
        });
    },

    _initEditor: function () {
        var that = this;
        var editor = ace.edit("energy-config");
        this.editor = editor;
        editor.setTheme("ace/theme/github");
        editor.renderer.setShowGutter(false); //hide the linenumbers
        var session = editor.getSession();
        session.setMode("ace/mode/ltt");
        session.setUseWrapMode(true);
        var content = store(ENERGY_CONFIG_STORAGE_KEY);
        if (store) {
            editor.setValue(content, -1);
        }
        that._listenToEditor();
    },

    _listenToEditor: function () {
        var that = this;
        var editor = this.editor;
        var session = editor.getSession();
        session.on('change', _.debounce(function (e) {
            var content = session.getValue();
            store(ENERGY_CONFIG_STORAGE_KEY, content);
        }, 200));
    },

    componentWillUnmount: function () {
        if (this.editor) {
            this.editor.destroy();
        }
    }

});


var ClassesSettings = React.createClass({

    getInitialState: function () {
        return {
            logClasses: []
        };
    },

    render: function () {
        return (
            <div className="ltt_c-page-settings-classes">
                {this.state.logClasses.map(function (logClass) {
                    return <LogClassCard key={logClass._id} data={logClass} onDelete={this.deleteLogClass.bind(this, logClass)}/>;
                }, this)}
            </div>
        );
    },

    componentDidMount: function () {
        this.loadClasses();
    },

    loadClasses: function () {
        var that = this;
        DataAPI.Class.load().then(function (classes) {
            that.setState({
                logClasses: classes
            });
        });
    },

    deleteLogClass: function (logClass) {
        var that = this;
        DataAPI.Class.delete(logClass._id)
        .then(function (logClass) {
            var removeClassId = logClass._id;
            var logClasses = that.state.logClasses;
            var index = _.findIndex(logClasses, function (logClass) {return logClass._id === removeClassId;} )
            logClasses.splice(index, 1);
            that.setState({
                logClasses: logClasses
            });
        }).catch(function(err) {
            console.error(err.stack);
            Notify.error('delete log class failed! ' + err.message);
        })
    }
});


var LogClassCard = React.createClass({

    getInitialState: function () {
        var data = this.props.data;
        return  _.pick(data, ['name', '_id', 'description', 'color', 'icon']);
    },

    render: function () {
        var logClass = this.props.data;
        return (
            <form className='form-horizontal logClassCard'>
                <Input type='text' value={this.state._id} label='Code' disabled={true} labelClassName='col-xs-2' wrapperClassName='col-xs-10' />
                <Input type='text' name="name" value={this.state.name} label='Name' onChange={this.onFieldChange} labelClassName='col-xs-2' wrapperClassName='col-xs-10' />
                <Input type='text' name="icon" ref="icon" value={this.state.icon} label='Icon' onChange={this.onFieldChange} labelClassName='col-xs-2' wrapperClassName='col-xs-10' />
                <Input type='textarea' name="description" value={this.state.description} onChange={this.onFieldChange} label='Description' labelClassName='col-xs-2' wrapperClassName='col-xs-10' placeholder="log class description."/>
                <div className="form-group">
                    <label className="control-label col-xs-2"><span>Color</span></label>
                    <div className="col-xs-10">
                        <input type="text" value={logClass.color} name="color" className="pick-a-color form-control"/>
                    </div>
                </div>
                <span className="logClassCard-delete" onClick={this.props.onDelete}><i className="fa fa-trash"/></span>
            </form>
        )
    },

    componentDidMount: function () {
        var $picker = $(this.getDOMNode()).find(".pick-a-color");
        $picker.pickAColor({
            showSpectrum            : true,
            showSavedColors         : true,
            saveColorsPerElement    : false,
            fadeMenuToggle          : true,
            showHexInput            : false,
            showBasicColors         : true,
            allowBlank              : false,
            inlineDropdown          : false
        });
        var that = this;
        $picker.on('change', function () {
            var val = $(this).val();
            DataAPI.Class.update(extend({}, that.props.data, {color: '#' + val}))
                .then(updateClassesConfig);
        });
        $(this.refs.icon.getDOMNode()).find('input')
            .iconpicker()
            .on('iconpickerSelected', function (e) {
                var val = 'fa-' + e.iconpickerValue;
                that.setState({
                    icon: val
                }, function () {
                    this.save();
                });
            });
    },

    onFieldChange: function (e) {
        var target = e.target;
        var name = target.name;
        var val = target.value;
        var newState = {};
        newState[name] = val;
        this.setState(newState, this.save);
    },

    save: function () {
        DataAPI.Class.update(extend({}, this.props.data, _.pick(this.state, ['name', "icon", "description"])))
                .then(updateClassesConfig);
    }
});

function updateClassesConfig(cls) {
    var index = _.findIndex(config.classes, function(clsItem) {
        return clsItem._id === cls._id;
    });
    if (index >= 0) {
        config.classes.splice(index, 1, cls);
    } else {
        config.classes.push(cls);
    }
}


