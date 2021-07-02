var AutoPopup = {
    subscribe: function (popupKey, event, selector) {
        $(document).on(event, selector, function () {
            AutoPopup.open(popupKey);
        });
    },

    open: function (popupKey) {
        var selector = "#auto-popup-" + popupKey;
        if ($(selector).length > 0) {
            $(selector).eq(0).trigger('click');
        }
    }
};