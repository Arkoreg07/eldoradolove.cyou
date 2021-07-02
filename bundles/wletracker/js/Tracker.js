var Tracker = function () {};

Tracker.prototype.track = function (eventType) {
    var img = new Image();
    var body = document.body;

    img.id = eventType;
    img.src = Routing.generate('wle_tracker.tracker_track_gif', {
        eventType: eventType,
        timestamp: Date.now()
    });
    img.width = 1;
    img.height = 1;

    img.onload = function () {
        this.cleanup(eventType);
    }.bind(this);

    img.onerror = function () {
        this.cleanup(eventType);
    }.bind(this);

    body.appendChild(img);
};

Tracker.prototype.cleanup = function (eventType) {
    document.getElementById(eventType).remove();
};
