(
    function () {
        if (!$) {
            $ = django.jQuery;
        }
        $(document).ready(function () {
            const csrfmiddlewaretoken = $('input[name=csrfmiddlewaretoken]').val();
            var esList = [];
            
            if (window.sessionStorage['RTU-' + modelName]) {
                $('#real_time_updates').prop('checked', true);
                subscribe();
            }

            $('#real_time_updates').change(function () {
                if (this.checked) {
                    subscribe()
                } else {
                    unsubscribe()
                }
            });

            function subscribe() {
                window.sessionStorage['RTU-' + modelName] = true;
                const href = window.location.href;
                const es = new ReconnectingEventSource(bulkUpdatesUrl);
                esList.push(es);

                es.addEventListener('json', function (e) {
                    const data = JSON.parse(e.data),
                        objPk = data[0].pk;
                    var rowUrl = modelRowUrls[objPk] +
                            (href.indexOf('?') > 0 ? href.slice(href.indexOf('?')) : ''),
                        checkbox = $('#result_list input[name=_selected_action][value=' + objPk + ']'),
                        row = checkbox.parent().parent();
                    const checkboxChecked = checkbox.is(':checked');
                    $.ajax({
                        type: 'POST',
                        url: rowUrl,
                        data: JSON.stringify({className: row[0].className, data: data}),
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
            }

            function unsubscribe() {
                esList.map(es => es._eventSource.close());
                esList = [];
                delete window.sessionStorage['RTU-' + modelName];
            }
        });
    }()
);