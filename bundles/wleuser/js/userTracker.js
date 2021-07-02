var userTracker = {

    setTrackId: function (id) {

        userTracker.setCookie('trackIdChecked', false, {expires: 1});

        $.ajax({
            url: USER_TRACK_URL,
            type: 'post',
            headers: {
                "Auth-Token": id
            },
            xhrFields: {
                withCredentials: true
            },
            dataType: 'json'
        });
    },

    track: function () {
        var that = this;
        var logout = userTracker.getCookie('trackIdLogout');

        if (logout) {
            userTracker.setCookie('trackIdLogout', false, {expires: 1});
            userTracker.setCookie('trackIdChecked', false, {expires: 1});
            $.ajax({
                url: USER_TRACK_URL,
                type: 'post',
                xhrFields: {
                    withCredentials: true
                },
                dataType: 'json'
            });
        } else {

            var trackIdChecked = userTracker.getCookie('trackIdChecked');

            if (!trackIdChecked) {
                $.ajax({
                    url: USER_TRACK_URL,
                    type: 'get',
                    xhrFields: {
                        withCredentials: true
                    },
                    dataType: 'json',
                    success: function (resp) {

                        userTracker.setCookie('trackIdChecked', 1, {expires: 3600});

                        if (resp.hasOwnProperty('data') && resp.data.hasOwnProperty('track_id') && resp.data['track_id']) {
                            var redirect = USER_TRACK_REDIRECT_URL ? '&redirect=' + USER_TRACK_REDIRECT_URL : '';
                            that.trackOnAlternativeDomain(resp.data['track_id']);
                            window.location.href = '/sapi/loginByToken?token=' + resp.data['track_id'] + redirect + window.location.hash;
                        }
                    }
                });
            }
        }
    },

    trackOnAlternativeDomain: function (token) {
        var pixelRoute;
        var trackUrl = window.USER_TRACK_ALTERNATIVE_URL;

        if (!trackUrl || 'https://' === trackUrl.replace(/^\s+|\s+$/g, '')) {
            return;
        }

        pixelRoute = trackUrl.replace(/\/$/g, '') + Routing.generate('wle_sso_migrate', {
            token: token,
            timestamp: Date.now()
        });

        $.ajax({
            url: pixelRoute,
            type: 'get',
            xhrFields: {
                withCredentials: true
            }
        });
    },

    getCookie: function (name) {
        var matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    },

    setCookie: function (name, value, options) {
        options = options || {};

        var expires = options.expires;

        if (typeof expires === "number" && expires) {
            var d = new Date();
            d.setTime(d.getTime() + expires * 1000);
            expires = options.expires = d;
        }
        if (expires && expires.toUTCString) {
            options.expires = expires.toUTCString();
        }

        value = encodeURIComponent(value);

        var updatedCookie = name + "=" + value;

        for (var propName in options) {
            updatedCookie += "; " + propName;
            var propValue = options[propName];
            if (propValue !== true) {
                updatedCookie += "=" + propValue;
            }
        }

        document.cookie = updatedCookie;
    }
};