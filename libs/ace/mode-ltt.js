ace.define("ace/mode/ltt_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
    'use strict';

    var oop = require("ace/lib/oop");
    var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

    var ExampleHighlightRules = function() {

        this.$rules = {
                'start': [ // Example rules:
                    {
                        token: "constant",
                        regex: "INT_MAX|INT_MIN"
                    }, // INT_MAX -> constant(INT_MAX)

                    {
                        token: ["constant", "keyword"],
                        regex: "^(#{1,6})(.+)$"
                    }, // ### Header -> constant(###), keyword( Header)

                    {
                        token: "constant",
                        regex: "(a+)(b)(\\1)"
                    }, // aabaa -> constant(aabaa) :: abaa -> constant(aba) + a

                    {
                        token: function(first, second) {
                            if (first == "a") return ["constant", "keyword"];
                            return ["keyword", "constant"];
                        },
                        regex: "(.)(world)"
                    },
                    {   // project <>
                        token : "ltt_project",
                        regex : "<.*>"
                    },
                    {   // version<>
                        token : "ltt_version",
                        regex : "\\$.*?\\$"
                    },
                    {   // task (task)
                        token : "ltt_task",
                        regex : "\\((.*?)\\)"
                    },
                    {   // subTask #subTask#
                        token : "ltt_subTask",
                        regex : "#(.*?)#"
                    },
                    {   // logClass {}
                        token : "ltt_logClass",
                        regex : "\\{.*\\}"
                    },

                    {   //time 00:00~12:00
                        token : "ltt_time",
                        regex : "(\\d{1,2}\\s*:\\s*\\d{1,2})(\\s*~\\s*)(\\d{1,2}\\s*:\\s*\\d{1,2})"
                    },

                    {
                        token: "ltt_tag_start",
                        regex: "\\[",
                        push: "tags"
                    },

                    {
                        token: 'ltt_link',
                        regex: "(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?"
                    },

                    {
                        token: 'ltt_people',
                        regex: "@\\((.*?)\\)"
                    }
                ],
                tags: [
                    {
                        token: "ltt_tag_end",
                        regex: "\\]",
                        next: "pop"
                    },

                    {
                        token: "ltt_tag_split",
                        regex: ","
                    },

                    {
                        token: "ltt_tag",
                        regex: "[^,\\]]+"
                    }
                ]
            } // aworld -> constant(a), keyword(world) :: bworld -> keyword(a), constant(world)],

        this.normalizeRules();

    }

    oop.inherits(ExampleHighlightRules, TextHighlightRules);

    exports.ExampleHighlightRules = ExampleHighlightRules;
});

ace.define("ace/mode/ltt",["require","exports","module","ace/lib/oop","ace/mode/text","ace/tokenizer","ace/mode/ltt_highlight_rules"], function(require, exports, module) {
    'use strict';
    var oop = require("ace/lib/oop");
    var TextMode = require("ace/mode/text").Mode;
    var Tokenizer = require("ace/tokenizer").Tokenizer;
    var ExampleHighlightRules = require("ace/mode/ltt_highlight_rules").ExampleHighlightRules;

    var Mode = function() {
        this.$tokenizer = new Tokenizer(new ExampleHighlightRules().getRules());
        this.$highlightRules = new ExampleHighlightRules();
    };
    oop.inherits(Mode, TextMode);

    (function() {
    }).call(Mode.prototype);

    exports.Mode = Mode;
});
