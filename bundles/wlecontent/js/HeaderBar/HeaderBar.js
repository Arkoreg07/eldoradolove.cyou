'use strict';

var HeaderBar = function (settings) {
    this.settings = settings;
    this.timeout = 1000; //ms
    this.body = $('body');
    this.ttl = 604800; // 60 * 60 * 24 * 7
    this.wrapperSelector = '.header-bar';

    this.init();
};

HeaderBar.prototype.init = function () {
    if (this.body === void 0 || this.settings === void 0) {
        return;
    }

    this.settings.forEach(function (bar) {
        var $bar = $(this.wrapperSelector + '[data-name="' + bar.name + '"]');
        var $hideButton = $($bar.data('close-btn'), $bar);

        //attach close event
        $hideButton.on(
            'click',
            function (e) {
                e.preventDefault();
                this.hide(bar.name);
            }.bind(this)
        );
    }.bind(this));

    setInterval(
        function () {
            this.cycle();
        }.bind(this),
        this.timeout
    );
};

HeaderBar.prototype.remove = function (name) {
    for (var i in this.settings) {
        var barData = this.settings[i];

        if (barData.name === name) {
            delete this.settings[i];
        }
    }
};

HeaderBar.prototype.cycle = function () {
    var self = this;

    self.settings.forEach(function (bar) {
        if (self.isShown()) {
            return;
        }

        if (!self.getData(bar.name)) {
            self.setData(bar.name, Date.now() + bar.first_run_time * 1000, bar.interval, 0);
        }

        var data = self.getData(bar.name);

        if (data.display < Date.now() && (data.times < bar.count || bar.count < 1)) {
            self.show(bar.name);
        }
    });
};

HeaderBar.prototype.isShown = function () {
    return this.body.find(this.wrapperSelector).hasClass('visible');
};

HeaderBar.prototype.show = function (name) {
    var $bar = $(this.wrapperSelector + '[data-name="' + name + '"]');

    $bar.addClass('visible');
};

HeaderBar.prototype.hide = function (name) {
    var data = this.getData(name);
    var $bar = $(this.wrapperSelector + '[data-name="' + name + '"]');

    $bar.removeClass('visible');

    this.setData(name, Date.now() + data.interval * 1000, data.interval, data.times + 1);
};

HeaderBar.prototype.getData = function (name) {
    var value = getCookie(this.getCookieName(name));

    if (!value) {
        return false;
    }

    return JSON.parse(value);
};

HeaderBar.prototype.setData = function (name, display, interval, times) {
    var value = JSON.stringify({display: display, interval: interval, times: times});

    setCookie(this.getCookieName(name), value, {path: '/', expires: this.ttl});
};

HeaderBar.prototype.deleteData = function (name) {
    deleteCookie(this.getCookieName(name));
};

HeaderBar.prototype.getCookieName = function (name) {
    return 'header-bar-' + name;
};
