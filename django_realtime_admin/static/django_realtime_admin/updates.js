(
    function () {
        if (!$) {
            $ = django.jQuery;
        }
        $(document).ready(function () {
            const csrfmiddlewaretoken = $('input[name=csrfmiddlewaretoken]').val();

            $.each(updatesUrls, function (idx, updatesUrl) {
                const es = new ReconnectingEventSource(updatesUrl),
                    objPk = updatesUrl.split('/')[4],
                    rowUrl = updatesUrl.replace('updates', 'row');

                var checkbox = $('#result_list input[name=_selected_action][value=' + objPk + ']'),
                    row = checkbox.parent().parent();

                console.log(rowUrl);

                es.addEventListener('json', function (e) {
                    const checkboxChecked = checkbox.is(':checked');
                    $.ajax({
                        type: 'POST',
                        url: rowUrl,
                        data: JSON.stringify({className: row[0].className, data: $.parseJSON(e.data)}),
                        success: function (html) {
                            console.log(html);
                            row.replaceWith(html);

                            checkbox = $('#result_list input[name=_selected_action][value=' + objPk + ']');
                            row = checkbox.parent().parent();

                            checkbox.change(function () {
                                if (this.checked) {
                                    row.addClass('selected')
                                } else {
                                    row.removeClass('selected')
                                }
                            });
                            checkbox.prop('checked', checkboxChecked);

                            row.addClass('object-updated');
                            setTimeout(function () {
                                row.removeClass('object-updated');
                            }, 500)
                        },
                        contentType: "application/json",
                        dataType: 'html',
                    });
                }, false);
            })
        });
    }()
);