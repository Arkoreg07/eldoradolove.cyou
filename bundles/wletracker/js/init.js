(function() {
    var tracker = new Tracker();

    $('body').on('click', '[data-tracker-click]', function () {
        var eventType = $(this).data('tracker-click');
        tracker.track(eventType);
    });
})();
