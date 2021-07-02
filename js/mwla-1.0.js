'use strict';

var frameId = "page_hit";
var apiHost = "";
var apiUrl = "";
var apiPath = "/api/v18/hits";
var attempt = 0;
var cookieNames = {
    guestId: "gstId",
    utmTags: "utm_tags",
    refCode: "aff",
    lastRefCode: "last_aff"
};

var mwla = {
    exec: function () {
        _params = window._params || [];

        if(!document.getElementById(frameId)){
            if (_params.length > 0) {
                attempt = 0;

                var frame = this.createFrame();
                document.body.appendChild(frame);

                var form = this.createForm();
                document.body.appendChild(form);

                form.submit();
            }
        } else {
            if(attempt > 10){
                this.clear();
            }
            attempt++;
            window.setTimeout(this.exec(), 1000);
        }
    },
    createForm: function () {
        var params = this.extendObject(this.getRequirements(), window._params.shift());
        var form = document.createElement("form");

        apiHost = document.location.protocol + "//" + params.trackDomain;
        apiUrl = apiHost + apiPath;
        delete params.trackDomain;

        form.id  = frameId + "_form"; form.target = frameId; form.action = apiUrl; form.method = "POST";
        cookieNames.guestId = params.guestIdCookieName;
        delete params.guestIdCookieName;

        for(var p in params) {
            if (params.hasOwnProperty(p)) {
                if (params[p] !== "") {
                    var element = document.createElement("input");
                    element.type = "hidden";
                    element.name = p;
                    element.value = params[p];

                    form.appendChild(element);
                }
            }
        }
        return form;
    },
    createFrame: function () {
        var frame = document.createElement("iframe");
        frame.id = frameId;
        frame.name = frameId;
        frame.style.display = "none";

        return frame;
    },
    clear: function () {
        var frame = document.getElementById(frameId);
        if (frame) {
            frame.parentNode.removeChild(frame);
        }

        var form = document.getElementById(frameId + "_form");
        if (form) {
            form.parentNode.removeChild(form);
        }
    },
    setGuestId: function (value) {
        if (value === "undefined") {
            return;
        }

        if (value === this.getCookieByName(cookieNames.guestId)) {
            return;
        }

        var date = new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000);
        document.cookie = cookieNames.guestId + "=" + value + "; path=/; expires=" + date.toUTCString();
        window.dispatchEvent(new CustomEvent("mwla:guest_id", {detail: value}));
    },
    getCookieByName: function(name) {
        var match = document.cookie.match(new RegExp(name + '=([^;]+)'));
        if (match) {
            return decodeURIComponent(match[1]);
        }

        return "";
    },
    getUtmTags: function () {
        return this.getCookieByName(cookieNames.utmTags);
    },
    getRefCode: function () {
        return this.getCookieByName(cookieNames.refCode);
    },
    getLastRefCode: function () {
        return this.getCookieByName(cookieNames.lastRefCode);
    },
    extendObject: function (obj, src) {
        for (var key in src) {
            if (src.hasOwnProperty(key)) {
                obj[key] = src[key];
            }
        }
        return obj;
    },
    getRequirements: function() {
        return {
            url: document.URL,
            referer: this.getReferrer() || document.referrer,
            utmTags: this.getUtmTags(),
            refCode: this.getRefCode(),
            lastRefCode: this.getLastRefCode(),
            guestIdCookieName: cookieNames.guestId
        };
    },
    getReferrer: function () {
        try {
            var params = JSON.parse(JSON.stringify(window._params));
            return params.shift().referer;
        } catch(e) {
            return null;
        }
    }
};


//event listener for message from iframe with guestId
var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
var eventer = window[eventMethod];
var messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";

eventer(messageEvent, function(e) {
    if (e.origin !== apiHost) {
        return;
    }

    try {
        var data = JSON.parse(e.data);
        mwla.setGuestId(data.guestId);
        mwla.clear();
    } catch (exception) {
        if (window.console) {
            window.console.error("Json parse error.");
        }
    }
},false);

window.mwla = mwla;
