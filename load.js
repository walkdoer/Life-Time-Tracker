(function(window, undefined) {
    'use strict';
    var EMPTY_FUN = function () {};
    var isArray = Array.isArray || function (el) { return Object.prototype.toString.call(el) === "[object Array]";}

    /**
     * use XMLHttpRequest to load file
     */
    var loadScript = function (url, options) {
        if (!url) {
            return;
        }
        var onProgress = options.onProgress || EMPTY_FUN;
        var onExcuted = options.onExcuted || EMPTY_FUN;
        var onError = options.onError || EMPTY_FUN;
        var onAbort = options.onAbort || EMPTY_FUN;
        var onComplete = options.onComplete || EMPTY_FUN;

        var req = new XMLHttpRequest();

        req.addEventListener("progress", updateProgress, false);
        req.addEventListener("load", transferComplete, false);
        req.addEventListener("error", transferFailed, false);
        req.addEventListener("abort", transferCanceled, false);

        req.open("GET", url);
        req.send();


        function updateProgress(e) {
            var progress = calculateProgress(e);
            if (progress !== null) {
                onProgress(progress);
            }
        }

        function transferComplete(e) {
            var element = e.target;
            var scriptDOM = document.createElement("script");
            scriptDOM.innerHTML = element.responseText;
            document.documentElement.appendChild(scriptDOM);
            onComplete();

            scriptDOM.addEventListener("load", function() {
                onExcuted();
            });
        }

        function transferFailed(e) {
            onError(e);
        }

        function transferCanceled(e) {
            onAbort(e);
        }

        function calculateProgress(e) {
           if (e.lengthComputable) {
                return e.loaded / e.total;
            } else {
                return null;
            }
        }
    };


    window.loadJS = function (urls, options) {
        var onProgress = options.onProgress || EMPTY_FUN;
        var onExcuted = options.onExcuted || EMPTY_FUN;
        var onError = options.onError || EMPTY_FUN;
        var onAbort = options.onAbort || EMPTY_FUN;
        var onComplete = options.onComplete || EMPTY_FUN;

        if (!isArray(urls)) {
            urls = [urls];
        }
        urls = urls.filter(function (url) { return !!url;});
        var scriptLength = urls.length;
        var queue = urls.slice(0);
        var scriptProgresses = Object.create(null);
        urls.forEach(function (url) {
            loadScript(url, {
                onProgress: function (progress) {
                    scriptProgresses[url] = progress;
                    var totalProgress = calculateTotalProgress();
                    if (totalProgress !== null) {
                        onProgress(totalProgress);
                    }
                },

                onComplete: function () {
                    var index = queue.indexOf(url);
                    if (index >= 0) {
                        queue.splice(index, 1);
                    }
                    if (queue.length === 0) {
                        onComplete();
                    }
                },

                onError: function () {
                    onError(url);
                },

                onExcuted: function () {
                    onExcuted(url);
                    console.log('excuted:' + url);
                },

                onAbort: function () {
                    onAbort(url);
                }
            });
        });

        function calculateTotalProgress() {
            var sum = 0, isRun = false;
            for (var key in scriptProgresses) {
                isRun = true;
                sum += scriptProgresses[key];
            }
            if (!isRun) { return null; }
            return sum / (scriptLength);
        }
    };

})(window);