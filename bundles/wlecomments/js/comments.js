var wle_comments = {

    formSubmit: function (el) {

        var form = $(el);
        form.find('.control-group b').remove();
        form.find('.error').removeClass('error');
        $(".submit-comment-success").hide();

        $.ajax({
            type: form.attr('method'),
            url: form.attr('action'),
            dataType: 'json',
            data: form.serialize(),
            success: function (data) {

                if (data.success) {
                    $(".submit-comment-success").show();
                    form[0].reset();
                } else {
                    if ($.isPlainObject(data.errors) || $.isArray(data.errors)) {
                        for (key in data.errors) {
                            var div = form.find('#' + key).parent();
                            if (div.length) {
                                div.addClass('error')
                                    .append($('<b>' + data.errors[key] + '</b>'));
                            } else {
                                $.jGrowl(data.errors[key]);
                            }
                        }
                    }
                    form.find('.control-group-captcha img').attr('src', data.captcha);
                }

                if (data.flash) {
                    $.jGrowl(data.flash);
                }
            }
        });
    }

}