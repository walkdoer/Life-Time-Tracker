/**
 * 使用 XMLHttpRequest 来请求文件，可以知道文件的加载进度
 * @author andrew(zhangmhao@gmail.com)
 */
(function(win, doc, undefined) {
    'use strict';
    var head = doc.head;
    var EMPTY_FUN = function () {};
    var isArray = Array.isArray || function (el) { return Object.prototype.toString.call(el) === "[object Array]";};

    /**
     * use XMLHttpRequest to load file
     */
    var loadFile = function (url, options) {
        if (!url) {
            return;
        }
        var onProgress = options.onProgress || EMPTY_FUN;
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
            onComplete(e);
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

    function calculateTotalProgress(scriptProgresses, scriptLength) {
        var sum = 0, isRun = false;
        for (var key in scriptProgresses) {
            isRun = true;
            sum += scriptProgresses[key];
        }
        if (!isRun) { return null; }
        return sum / (scriptLength);
    }

    win.loadFile = function (urls, options) {
        var onProgress = options.onProgress || EMPTY_FUN;
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
        var responseCache = {};
        urls.forEach(function (url) {
            var timer = win.setTimeout(function () {
                loadFile(url, {
                    onProgress: function (progress) {
                        scriptProgresses[url] = progress;
                        var totalProgress = calculateTotalProgress(scriptProgresses, scriptLength);
                        if (totalProgress !== null) {
                            onProgress(totalProgress);
                        }
                    },

                    onComplete: function (e) {
                        var index = queue.indexOf(url);
                        var element = e.target;
                        queue.splice(index, 1);
                        responseCache[url] = element.responseText;
                        if (queue.length === 0) {
                            onComplete.apply(null, urls.map(function (url) {
                                return responseCache[url];
                            }));
                        }
                    },

                    onError: function () {
                        onError(url);
                    },

                    onAbort: function () {
                        onAbort(url);
                    }
                });
                clearTimeout(timer);
                timer = null;
            }, 0);
        });
    };
    win.loadJS = function (urls, options) {
        var onProgress = options.onProgress || EMPTY_FUN;
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
        var responseCache = {};
        urls.forEach(function (url) {
            loadFile(url, {
                onProgress: function (progress) {
                    scriptProgresses[url] = progress;
                    var totalProgress = calculateTotalProgress(scriptProgresses, scriptLength);
                    if (totalProgress !== null) {
                        onProgress(totalProgress);
                    }
                },

                onComplete: function (e) {
                    var index = queue.indexOf(url);
                    var element = e.target;
                    var insertResponse = function (response) {
                        var scriptDOM = doc.createElement("script");
                        scriptDOM.innerHTML = response;
                        head.appendChild(scriptDOM);
                    };

                    if (index === 0) {
                        queue.splice(index, 1);
                        insertResponse(element.responseText);
                        queue = queue.filter(function (url) {
                            var response = responseCache[url];
                            if (response) {
                                insertResponse(response);
                                return false;
                            } else {
                                return true;
                            }
                        });
                    } else if (index > 0) {
                        //cache
                        responseCache[url] = element.responseText;
                    }
                    if (queue.length === 0) {
                        onComplete();
                    }
                },

                onError: function () {
                    onError(url);
                },

                onAbort: function () {
                    onAbort(url);
                }
            });
        });
    };

})(window, document);