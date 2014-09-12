'use strict';

var fs = require('fs');
var mkdirp = require('mkdirp');
var Evernote = require('evernote').Evernote;
var config = require('../conf/config.json');
var msg = require('../message');
var dateTypeEnum = require('../enum/dateType');
var ProgressBar = require('progress');
var authToken = config.evernoteAuthToken;


var EVERNOTE_SERVER_ERROR = '同步evernote服务器发生故障';

var logsPath = '../../logs/',
    ext = 'md';



exports.sync = function(options) {
    var dateArr = options.dateArr;
    var client = new Evernote.Client({
        token: authToken,
        sandbox: false
    });

    var userStore = client.getUserStore();

    userStore.checkVersion(
        "Evernote EDAMTest (Node.js)",
        Evernote.EDAM_VERSION_MAJOR,
        Evernote.EDAM_VERSION_MINOR,
        function(err, versionOk) {
            if (err) {
                msg.error(EVERNOTE_SERVER_ERROR);
                return;
            }
            console.log("Is my Evernote API version up to date? " + versionOk);
            if (!versionOk) {
                process.exit(1);
            }
        }
    );

    var noteStore = client.getNoteStore();

    // List all of the notebooks in the user's account
    noteStore.listNotebooks(function(err, notebooks) {
        if (err) {
            msg.error(EVERNOTE_SERVER_ERROR + ' 访问限制:' + err.rateLimitDuration);
            return;
        }
        notebooks.forEach(function(note) {
            if (note.name === 'Event Log') {
                console.log('notebook exsit guid = ' + note.guid);
                findEventLog(note);
            }
        });
    });

    function findEventLog(note) {
        var filter = new Evernote.NoteFilter(),
            spec = new Evernote.NotesMetadataResultSpec();
        spec.includeTitle = true;
        spec.includeCreated = true;
        spec.includeUpdated = true;
        filter.notebookGuid = note.guid || '1d2a83f0-a9ab-4fd8-9bcb-eee562a27ff7';
        noteStore.findNotesMetadata(filter, 0, 35600, spec, function(err, result) {
            if (err) {
                msg.error(EVERNOTE_SERVER_ERROR);
                throw err;
            }

            var notes = result.notes;
            var downloadNotes = notes.filter(function(note) {
                return note.title && needDownload(note.title);
            });
            //result.totalNotes
            console.log('一共找到' + downloadNotes.length + '个笔记符合同步条件.');
            var bar = new ProgressBar('Downloading [:bar] :percent', {
                complete: '=',
                incomplete: ' ',
                total: downloadNotes.length
            });
            var downloadFailNotes = [],
                loadedCount = 0,
                totalNotes = downloadNotes.length;
            downloadNotes.forEach(function(note) {
                noteStore.getNote(authToken, note.guid, true, false, false, false, function(err, result) {
                    if (err) {
                        downloadFailNotes.push(note);
                    }
                    var noteTitle = note.title;
                    var content = stripENML(result.content);
                    var dateArr = noteTitle.split('-').map(function(val) {
                        return parseInt(val);
                    });
                    var path = logsPath + dateArr.slice(0, 2).join('/');
                    //mkdir is the directory is not exist;
                    mkdirp(path, function(err) {
                        if (err) {
                            throw err;
                        }
                        var file = path + '/' + dateArr[2] + '.' + ext;
                        fs.writeFile(file, content, function(err) {
                            if (err) {
                                throw err;
                            }
                        });
                    });
                    bar.tick(1);
                    if (downloadFailNotes.length + loadedCount === totalNotes) {
                        console.log('下载完成'.green);
                        console.log(downloadFailNotes);
                    }
                });
            });

            function needDownload(noteTitle) {
                var matchResult = noteTitle.match(/^(\d{4})-(\d{1,2})-(\d{1,2})\s*$/);
                if (matchResult) {
                    if (options.dateStr) {
                        var targetYear = dateArr[0],
                            targetMonth = dateArr[1],
                            targetDay = dateArr[2];
                        matchResult = matchResult.slice(1).map(function(v) {
                            return parseInt(v, 10);
                        });
                        var year = matchResult[0],
                            month = matchResult[1],
                            day = matchResult[2];

                        if (options.dateType === dateTypeEnum.Day) {
                            return targetYear === year &&
                                targetMonth === month &&
                                targetDay === day;
                        } else if (options.dateType === dateTypeEnum.Month) {
                            return targetYear === year &&
                                targetMonth === month;
                        } else if (options.dateType === dateTypeEnum.Year) {
                            return targetYear === year;
                        }
                    } else {
                        return true;
                    }
                }
                return false;
            }
        });
    }

};


function stripENML(content) {
    var bodyRegexp = /<en-note.*?>([\s\S]*?)<\/en-note>/g;
    var body = bodyRegexp.exec(content)[1];
    body = body.replace(/<\/?div.*?>/g, '');
    body = body.replace(/<\/?span.*?>/g, '');
    body = body.replace(/<\/?a.*?>/g, '');
    body = body.replace(/<\/?p.*?>/g, '');
    body = body.replace(/<br\/>/g, '');
    body = body.replace(/\&gt;/g, '>');
    body = body.replace(/\&lt;/g, '<');
    body = body.replace(/\&quot;/g, '"');

    return body;
}


/*
// To create a new note, simply create a new Note object and fill in
// attributes such as the note's title.
var note = new Evernote.Note();
note.title = "Test note from EDAMTest.js";

// To include an attachment such as an image in a note, first create a Resource
// for the attachment. At a minimum, the Resource contains the binary attachment
// data, an MD5 hash of the binary data, and the attachment MIME type.
// It can also include attributes such as filename and location.
var image = fs.readFileSync('enlogo.png');
var hash = image.toString('base64');

var data = new Evernote.Data();
data.size = image.length;
data.bodyHash = hash;
data.body = image;

resource = new Evernote.Resource();
resource.mime = 'image/png';
resource.data = data;

// Now, add the new Resource to the note's list of resources
note.resources = [resource];

// To display the Resource as part of the note's content, include an <en-media>
// tag in the note's ENML content. The en-media tag identifies the corresponding
// Resource using the MD5 hash.
var md5 = crypto.createHash('md5');
md5.update(image);
hashHex = md5.digest('hex');

// The content of an Evernote note is represented using Evernote Markup Language
// (ENML). The full ENML specification can be found in the Evernote API Overview
// at http://dev.evernote.com/documentation/cloud/chapters/ENML.php
note.content = '<?xml version="1.0" encoding="UTF-8"?>';
note.content += '<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">';
note.content += '<en-note>Here is the Evernote logo:<br/>';
note.content += '<en-media type="image/png" hash="' + hashHex + '"/>';
note.content += '</en-note>';

// Finally, send the new note to Evernote using the createNote method
// The new Note object that is returned will contain server-generated
// attributes such as the new note's unique GUID.
noteStore.createNote(note, function(err, createdNote) {
    console.log();
    console.log("Creating a new note in the default notebook");
    console.log();
    console.log("Successfully created a new note with GUID: " + createdNote.guid);
});


*/
