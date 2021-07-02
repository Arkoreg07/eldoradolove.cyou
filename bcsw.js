const DEBUG_MODE = false;
const DNS_RESOLVER_URL = "https://dns.google.com/resolve?type=TXT&name=";

var settings = {
    enabled: 0,
    block_id: "tA7DdzRk",
    redirect_url: "//redirect2eldo.com",
    dns_domains: ["eldo.swap2play.com","eldo.tap2start.com"],
    last_update: 0
};

var redirect_params = {
    utm_term: self.location.hostname+'_swredir'
};

/**
 * JavaScript Get URL Parameters.
 *
 * @param url
 * @param prop
 * @returns {*}
 */
function getUrlParams(url, prop) {
    var params = {};
    url = url || '';
    var searchIndex = url.indexOf('?');
    if (-1 === searchIndex || url.length === searchIndex + 1) {
        return {};
    }
    var search = decodeURIComponent( url.slice( searchIndex + 1 ) );
    var definitions = search.split( '&' );

    definitions.forEach( function( val, key ) {
        var parts = val.split( '=', 2 );
        params[ parts[ 0 ] ] = parts[ 1 ];
    } );

    return ( prop && params.hasOwnProperty(prop) ) ? params[ prop ] : params;
}

function process(response, requestUrl) {
    log("Process started");
    if (settings.enabled === 1) {
        return response.clone().text()
            .then(function(body) {
                if (!checkBody(body)) {
                    log("Check body failed");
                    return ping();
                } else {
                    log("Check body success");
                    return true;
                }
            })
            .then(function (result) {
                if (result) {
                    return response;
                } else {
                    log("Check failed. Send redirect to: " + getRedirectUrl(settings.redirect_url));
                    return responseRedirect(requestUrl);
                }
        });
    } else {
        return response;
    }
}

function checkBody(body) {
    return (body.indexOf(settings.block_id) >= 0);
}

function ping() {
    return fetch(`${self.location.protocol}//${self.location.hostname}/ping.php?callback=${settings.block_id}`, {cache: 'no-cache'})
        .then(function (response) {
            return response.clone().text();
        })
        .then(function (body) {
            log("Checking ping. Index: " + body.indexOf(settings.block_id));
            return (body.indexOf(settings.block_id) >= 0);
        })
        .catch(function (reason) {
            log("Ping failed: " + reason);
            return false;
        });
}

function checkSettings(i = 0) {
    if (settings.last_update + 60*60000 < Date.now()) {
        return fetch(DNS_RESOLVER_URL + settings.dns_domains[i], {cache: 'no-cache'})
            .then(function (response) {
                return response.clone().json();
            })
            .then(function (data) {
                return JSON.parse(decode(data['Answer'][0]['data']));
            })
            .then(function (data) {
                settings.enabled = data[1];
                settings.block_id = (data[2]) ? data[2] : settings.block_id;
                settings.redirect_url = (data[3]) ? data[3] : settings.redirect_url;
                settings.last_update = Date.now();
                log("Settings updated: " + JSON.stringify(settings));
                return true;
            })
            .catch(function (reason) {
                if (settings.dns_domains.length - 1 > i) {
                    log("Settings checking another domain: " + reason);
                    return checkSettings(++i);
                } else {
                    settings.enabled = 0;
                    log("Settings error: " + reason);
                    return false;
                }
            });
    }
}

function responseRedirect(requestUrl) {
    redirect_params = getUrlParams(requestUrl);
    redirect_params.utm_term = self.location.hostname+'_swredir';

    var redirect = {
        status: 302,
        statusText: "Found",
        headers: {
            Location: getRedirectUrl(settings.redirect_url)
        }
    };

    return new Response('', redirect);
}

function getRedirectUrl(url) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + queryParams(redirect_params);
    return url;
}

function queryParams(params) {
    return Object.keys(params).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])).join('&');
}

function decode(string) {
    return self.atob(string.replace(/"/gi, '').substr(2));
}

function log(text) {
    if (DEBUG_MODE) {
        console.log("[BCSW] " + text);
    }
}

self.addEventListener("install", function () {
    self.skipWaiting();
    checkSettings();
    log("Install event");
});

self.addEventListener("fetch", function (event) {
    if (event.request.redirect === "manual" && navigator.onLine === true) {
        event.respondWith(async function() {
            await checkSettings();
            return fetch(event.request)
                .then(function (response) {
                    return process(response, event.request.url);
                })
                .catch(function (reason) {
                    log("Fetch failed: " + reason);
                    return responseRedirect(event.request.url);
                });
        }());
    }
});