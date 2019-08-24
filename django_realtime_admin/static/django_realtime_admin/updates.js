(
    function () {
        if (!$) {
            $ = django.jQuery;
        }
        $(document).ready(function () {
            const csrfmiddlewaretoken = $('input[name=csrfmiddlewaretoken]').val();
            var esList = [];
            
            $('#real_time_updates').change(function () {
                if (this.checked) {
                    subscribe()
                } else {
                    unsubscribe()
                }
            });

            if (window.sessionStorage['RTU-' + modelName]) {
                $('#real_time_updates').prop('checked', true);
            }

            function subscribe() {
                window.sessionStorage['RTU-' + modelName] = true;
                $.each(updatesUrls, function (idx, updatesUrl) {
                    const es = new ReconnectingEventSource(updatesUrl),
                        objPk = updatesUrl.split('/')[4],
                        rowUrl = updatesUrl.replace('updates', 'row') +
                            window.location.href.slice(window.location.href.indexOf('?'));
                    esList.push(es);

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
                            beforeSend: function(xhr){xhr.setRequestHeader('X-CSRFToken', csrfmiddlewaretoken);},
                            contentType: "application/json",
                            dataType: 'html',
                        });
                    }, false);
                })
            }

            function unsubscribe() {
                esList.map(es => es._eventSource.close());
                esList = [];
                delete window.sessionStorage['RTU-' + modelName];
            }
        });
    }()
);