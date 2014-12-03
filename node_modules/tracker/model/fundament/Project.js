/**
 * Project
 */
'use strict';
var Project = function (name, attrs) {
    this.name = name;
    var ver = attrs.version || attrs.ver;
    if (ver) {
    	this.version = ver;
    }
    this.attributes = attrs;
};

module.exports = Project;
