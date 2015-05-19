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

/** Components */
var Notify = require('../components/Notify');
var Progress = require('../components/Progress');

/** Utils */
var DataAPI = require('../utils/DataAPI');

/** constants */
var ENERGY_STORAGE_KEY = 'energy_value';
var SLEEP_VALUE_STORAGE_KEY = 'sleep_value';
var ENERGY_CONFIG_STORAGE_KEY = 'energy_config';
var NORMAL_COST_STORAGE_KEY = 'normal_cost';

module.exports = React.createClass({

    statics: {
        getEnergySettings: function () {
            var content = store(ENERGY_CONFIG_STORAGE_KEY);
            var configs = content.split('\n').map(function (config) {
                var configObj = TrackerHelper.getLogInfo({
                    logStr: config,
                    noTime: true
                });
                configObj.value = numeral(configObj.content.trim().split('=')[1]).value();
                return configObj;
            });
            return {
                energy: store(ENERGY_STORAGE_KEY) || 100,
                sleepValue: store(SLEEP_VALUE_STORAGE_KEY) || 10,
                normalCost: store(NORMAL_COST_STORAGE_KEY) || 3,
                configs: configs
            };
        }
    },

    getInitialState: function () {
        return {
            settings: {},
            energy: store(ENERGY_STORAGE_KEY) || 100,
            sleepValue: store(SLEEP_VALUE_STORAGE_KEY) || 10,
            normalCost: store(NORMAL_COST_STORAGE_KEY) || 3
        };
    },

    render: function () {
        return (
            <div className="ltt_c-page ltt_c-page-settings">
                <TabbedArea defaultActiveKey={1} animation={false}>
                    <TabPane eventKey={1} tab='App Settings'>{this.renderApplicationSettings()}</TabPane>
                    <TabPane eventKey={2} tab='Enery Settings'>{this.renderEnerySettings()}</TabPane>
                </TabbedArea>
            </div>
        );
    },

    renderApplicationSettings: function () {
        var settings = this.state.settings;
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
                            <Input type='text' label='Server Port' placeholder='default is 3333' name="serverPort"
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
        });
    },

    onSleepValueChange: function (e) {
        var value = numeral(e.target.value).value();
        store(SLEEP_VALUE_STORAGE_KEY, value);
        this.setState({
            sleepValue: value
        });
    },

    onNormalChange: function (e) {
        var value = numeral(e.target.value).value();
        store(NORMAL_COST_STORAGE_KEY, value);
        this.setState({
            normalCost: value
        });
    },

    componentDidMount: function () {
        this.loadSettings();
        this._initEditor();
    },


    loadSettings: function () {
        var that = this;
        DataAPI.Settings.load().then(function (data) {
            that.setState({
                settings: data
            });
        });
    },

    save: function () {
        DataAPI.Settings.save(this.state.settings).then(function () {
            Notify.success('Change setting success!');
        }).catch(function (err) {
            Notify.error('Change settting failed', err);
        });
    },

    cancel: function () {
        this.back();
    },

    onSettingChange: function (e) {
        console.log(e);
        var settings = this.state.settings;
        var target = e.target;
        var name = target.name;
        settings[name] = target.value;
        this.setState({
            settings: settings
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


