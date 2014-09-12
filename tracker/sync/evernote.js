'use strict';

var fs = require('fs');
var mkdirp = require('mkdirp');
var Evernote = require('evernote').Evernote;

var authToken = "S=s36:U=3c1621:E=14f2c2730a3:C=147d4760490:P=1cd:A=en-devtoken:V=2:H=285c74e67428520b8057bdc485f8bdb5";




var logsPath = '../../logs/',
    ext = 'md';



exports.sync = function () {
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
                throw err;
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
        notebooks.forEach(function (note) {
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
        filter.notebookGuid = note.guid || '1d2a83f0-a9ab-4fd8-9bcb-eee562a27ff7';
        noteStore.findNotesMetadata(filter, 0, 100, spec, function (err, result) {
            if (err) {
                throw err;
            }

            console.log('一共找到' + result.totalNotes + '个笔记');
            var notes = result.notes;

            notes.forEach(function (note) {
                if (note.title && note.title.match(/^\d{4}-\d{1,2}-\d{1,2}\s*$/)) {
                    noteStore.getNote(authToken, note.guid, true, false, false, false, function (err, result) {
                        if (err) {
                            throw err;
                        }
                        var noteTitle = note.title;
                        var content = stripENML(result.content);
                        var dateArr = noteTitle.split('-').map(function (val) {
                            return parseInt(val);
                        });
                        var path = logsPath + dateArr.slice(0, 2).join('/');
                        //mkdir is the directory is not exist;
                        mkdirp(path, function (err) {
                            if (err) {
                                throw err;
                            }
                            var file = path + '/' + dateArr[2] + '.' + ext;
                            fs.writeFile(file, content, function (err) {
                                if (err) {
                                    throw err;
                                }
                                console.log(noteTitle + '已同步');
                            });
                        });
                    });
                }
            });
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
