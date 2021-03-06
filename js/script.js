/******************************************************************************
 * 
 * DOCUMENT READY
 *
 ****************************************************************************/

$(document).ready(function () {

    //instantiate parser class    
    try {
        parser = new Parser(maxchar);

    } catch (err) {
        console.log("Parser class not found.");
    }

    //jqUI tabs
    if ($("#tabs").length > 0) {
        var $tabs = $("#tabs");
        tabber = $tabs.tabs({
            create: function () {
                $(this).tabs("disable", 1);
            }
        });
        $tabs.show();
    }

    if ($("#decor").length > 0) {
        renderTriangles();
    }

//toggle dependent modules
    $("#input").on("change", "form input[type='checkbox']", function () {
        var $element = $(this);
        var $hidden = $element.closest('.checkbox').find("input[type='hidden']");
        var id = $(this).attr("id");
        var checked = $element.prop('checked');
        var $todisable = null;
        var $toenable = null;
        var $toenable_hidden = null;
        if (checked) {
            $hidden.prop('disabled', false);
        } else {
            $hidden.prop('disabled', true);
        }

        if (id === "pos") {
            $todisable = $("#input form input#morph");
            $toenable = $("#input form input#morph, #input form input#morph_hidden");
            $toenable_hidden = $("#input form input#morph_hidden");
        }
        if (id === "npchunk" || id === "syntax" || id === "ner") {
            $todisable = $("#input form input#morph, #input form input#pos, #input form input#morph_hidden, #input form input#pos_hidden");
            $toenable = $("#input form input#pos");
            $toenable_hidden = $("#input form input#morph_hidden, #input form input#pos_hidden");
        }

        if ($todisable && $toenable) {
            if (!checked) {
                if (!$("#input form input#npchunk").prop('checked') && !$("#input form input#syntax").prop('checked') && !$("#input form input#ner").prop('checked')) {
                    $toenable.prop('disabled', false);
                }
            } else {
                $todisable.prop('checked', true).prop('disabled', true);
                $toenable_hidden.prop('disabled', false);
            }
        }

    });

    //show preverbs on token hover
    $("#parsed").on("mouseenter", ".token", function () {
        var $token = $(this);
        var depType = $token.data("deptype");
        if (depType && depType === "PREVERB") {
            $token.closest(".sentence").find("#" + $token.data("target_id")).addClass("preverb_target");
        }
    });
    $("#parsed").on("mouseleave", ".token", function () {
        var $token = $(this);
        $token.closest(".sentence").find(".token").removeClass("preverb_target");
    });

    //show target on row hover - vetical view
    $("#parsed").on("mouseenter", "#datatable tr", function () {
        var $row = $(this);
        var target_id = $row.find('td.target').data('target_id');
        if (!target_id) {
            return false;
        }
        $row.addClass("target_highlight");
        $("#parsed #datatable tr#" + target_id).addClass("target_highlight");
    });
    $("#parsed").on("mouseleave", "#datatable tr", function () {
        $("#parsed #datatable tr").removeClass("target_highlight");
    });

    //show modal on token click
    $("#parsed").on("click", ".token", function () {
        if ($.inArray('morph', parser.modules) < 0) {
            return false;
        }
        var $token = $(this);
        var html = parser.getAnnotList($token.data('anas'), "horizontal");
        if (html) {
            var $modal = $("#annot_modal");
            $modal.html(html);
            var dialog = $modal.dialog(dialog_options);
            dialog.on("dialogopen", function (event, ui) {
                $("#annot_modal").tooltip(morph_label_options);
            });
            dialog.on("dialogclose", function (event, ui) {
                $("#annot_modal").tooltip("destroy");
                dialog.unbind("dialogclose");
            });
            dialog.dialog({title: $token.text()}).dialog('open').unbind('dialogopen');
        }
    });

    //show dependeny model
    $("#parsed").on("click", ".dep_toggle", function () {
        var $sentence = $(this).closest(".sentence");
        var $modal = $("#deptree_modal");

        var dialog = $modal.dialog({
            title: $modal.attr("title"),
            width: 'auto',
            height: 'auto',
            resizable: true,
            draggable: true,
            modal: true,
            open: function (event, ui) {
                createDepTree($modal, $sentence);    //deptree-builder.js
                $(this).scrollLeft(0).scrollTop($(this)[0].scrollHeight);
                $("body").css("overflow", "hidden");
            },
            close: function () {
                $("body").css("overflow", "auto");
                $(this).dialog('destroy').hide();
            }
        }).dialog('open').unbind('dialogopen');
    });

    //show constituent model
    $("#parsed").on("click", ".const_toggle", function () {
        var $sentence = $(this).closest(".sentence");
        var $modal = $("#consttree_modal");

        var dialog = $modal.dialog({
            title: $modal.attr("title"),
            width: $(window).width() * 0.8,
            height: $(window).height() * 0.8,
            resizable: false,
            draggable: true,
            modal: true,
            open: function (event, ui) {
                createConstTree($modal, $sentence);    //consttree-builder.js
                $(this).scrollLeft(0).scrollTop($(this)[0].scrollHeight);
                $("body").css("overflow", "hidden");
            },
            close: function () {
                $("body").css("overflow", "auto");
                $(this).dialog('destroy').hide();
                $modal.html("");
            }
        }).dialog('open').unbind('dialogopen');

    });

    //check and submit form
    $("#input form button[type='submit']").on("click", function (e) {
        e.preventDefault();
        var $form = $(this).closest("form");
        var text = $form.find("textarea").val();
        if (text === undefined || text === "") {
            addError($form, translations.no_input_error);
            return false;
        }
        if ($form.find("input[type='checkbox']:checked").length < 1) {
            addError($form, "Select at least one module.");
            return false;
        }
        if (text.length > parser.getMaxChar()) {
            addError($form, translations.too_long_error.replace(/\*/, parser.getMaxChar()));
            return false;
        }
        $form.find("#form-feedback").text("");
        var callback = function (response) {
            if (response.status === true) {
                var xml = response.xml;
                var zipurl = response.zipurl;
                var modules = response.modules;
                if (xml && zipurl && modules) {
                    parser.$xml = $(xml);
                    parser.zipurl = zipurl;
                    parser.modules = modules;
                    //console.log(self.modules);
                    parser.getParsed(parser.orientation);
                    initOutputLayout();
                }
            }
        };
        parser.submitInput($form.attr("action"), $form.serialize(), callback);
        return false;
    });

    //navbar toggle animation
    $('#navigation-xs').on('show.bs.offcanvas', function (e) {
        var $button = $(".navbar-toggle");
        $button.addClass('active');
    });
    $('#navigation-xs').on('hide.bs.offcanvas', function (e) {
        var $button = $(".navbar-toggle");
        $button.removeClass('active');
    });

    //show segments
    $("#filter").on('change', "input", function () {
        var $checkbox = $(this);
        var item = $checkbox.val();
        var checked = $checkbox.prop("checked");
        if (item === undefined || item === "") {
            return false;
        }
        parser.highlightSegment(item, checked);
    });

    //get emlam alternatives on key-up
    $("#emlam #textbox").keyup(function () {
        var $element = $(this);
        if ($element.val() === "" || $element.val().length > 3000) {
            $("#suggestions").removeClass("clicked").html("");
            return false;
        }
        var input = $element.val();
        var last = input.substr(input.length - 1);
        if (last !== " ") {
            $("#suggestions").removeClass("clicked").html("");
            return false;
        }
        var symbol = $("<textarea/>").html("&#9166;").text();
        var n = input.lastIndexOf(symbol);
        if (n > -1) {
            input = input.substring(n + symbol.length + 1, input.length);
            $("#suggestions").removeClass("clicked").html("");
        }

        var lastfourwords = [];
        var regex = /[^ ]+/g;
        var words = (input.match(regex) || []);
        var limit = words.length >= 4 ? 4 : words.length;
        for (var i = limit; i >= 1; i--) {
            lastfourwords.push(words[words.length - i].trim());
        }
        var text = lastfourwords.join(' ');
        if (/\S/.test(text)) {
            parser.getProbs(text);
        }
    });

    //select from emlam alternatives
    $("#emlam #suggestions").on("click", "li", function () {
        var $elem = $(this);
        if ($elem.hasClass("selected")) {
            return false;
        }
        $elem.parent().find(".selected").removeClass("selected");
        $elem.addClass("selected");
        var word = $elem.find(".word").text();
        var $textbox = $("#textbox");
        if ($("#suggestions").hasClass("clicked")) {
            var n = $textbox.val().lastIndexOf(" ");
            if (n > -1) {
                $textbox.val($textbox.val().substring(0, n + 1) + word + " ");
            }
        } else {
            $textbox.val($textbox.val() + word + " ");
        }
        //$elem.parent().addClass("clicked");
        $textbox.trigger('keyup');
        setTimeout(function () {
            $textbox.focus();
        }, 100);
    });

    //helper tooltip
    $(".help").tooltip({
        track: true,
        tooltipClass: "my-tooltip"
    });
    $(".help").click(function () {
        $(this).tooltip('open');
    });

    //switch language
//    $("#langswitch, #langswitch-xs").on("click", "a", function (e) {
//        e.preventDefault();
//        var $element = $(this);
//        if ($element.hasClass('active')) {
//            return false;
//        }
//
//        var refresh_url = window.location.href;
//        var href = $element.attr('href');
//        var re = /#(.*)?$/g;
//        var match = re.exec(refresh_url);
//        if (match) {
//            refresh_url = refresh_url.replace(match[0], "");
//        }
//
//        var request = $.ajax({
//            type: "POST",
//            context: this,
//            url: href,
//            dataType: "json"
//        });
//        request.done(function (response) {
//            if (response.status === true) {
//                window.location.href = refresh_url;
//            }
//        });
//        request.fail(function (jqXHR, exception) {
//            displayError(jqXHR, exception);
//        });
//    });

    //switch view
    $("#controls #viewswitch").bootstrapSwitch({
        state: false,
        offColor: 'primary',
        onColor: 'info',
        labelWidth: '10px',
        handleWidth: '10px'
    });
    $("#controls #viewswitch").on('switchChange.bootstrapSwitch', function (event, state) {
        var orientation = state === true ? "vertical" : "horizontal";
        $("#orientation_switch > label").toggleClass("active");
        $(".ui-tooltip").hide();
        parser.getParsed(orientation);
        if (parser.orientation === "horizontal") {
            $("#datatable").tooltip("destroy");
        }
        initOutputLayout();
    });

    //render home page decoration
    var wwidth = $(window).width();
    $(window).resize(function () {
        var _wwidth = $(window).width();
        if (wwidth !== _wwidth) {
            wwidth = _wwidth;
            if ($("#decor").length > 0) {
                renderTriangles();
            }
        }
    });

});

//error animation
function addError($form, msg) {
    $form.find("#form-feedback").text(msg);
    $form.find("textarea").addClass("error");
    setTimeout(function () {
        $form.find("textarea").removeClass("error");
    }, 1000);
}

//init output layout
function initOutputLayout() {
    var $form = $("#form");
    $form.find("button[type='submit']").prop('disabled', false);
    $active_boxes.prop('disabled', false);
    $form.find("textarea").prop('disabled', false);
    tabber.tabs("enable", 1);
    $("#tabs").tabs("option", "active", 1);
    if ($.inArray('morph', parser.modules) > 0) {
        $("#parsed").tooltip({
            items: '.tooltipper',
            content: function (event, ui) {
                var $token = $(this);
                var html = parser.getAnnotList($token.data('anas'), "horizontal");
                return html;
            },
            open: function (event, ui) {
                ui.tooltip.css("max-width", "100%");
            },
            tooltipClass: "my-tooltip"
        });
    }
    initDataTable();
    $(document).scrollTop(0);
}

function initDataTable() {
    if ($("#datatable").length > 0) {
        tabulator = new Tabulator();
        tabulator.init(datatable_options);
        tabulator.createSelectFilter();
        if ($.inArray('morph', parser.modules) > 0) {
            $("#datatable").tooltip(morph_label_options);
        }
    }
}

function renderTriangles() {
    var $decor = $("#decor");
    $decor.find("canvas").remove();
    var pattern = Trianglify({
        width: $decor.innerWidth(),
        height: $decor.innerHeight() * 1.2,
        cell_size: 200,
        x_colors: ['#194762', '#005283', '#308BC1', '#579AC1', '#005283', '#003555']
    });
    $decor.append(pattern.canvas());
}

function displayError(jqXHR, textStatus, exception) {
    if (jqXHR.status === 0) {
        alert('No connection. Verify Network.');
    } else if (jqXHR.status == 404) {
        alert('Requested page not found. [404]');
    } else if (jqXHR.status == 500) {
        alert('Internal Server Error [500].');
    } else if (exception === 'parsererror') {
        alert('Requested JSON parse failed.');
    } else if (exception === 'timeout') {
        alert('Time out error.');
    } else if (exception === 'abort') {
        alert('Ajax request aborted.');
    } else {
        alert('Uncaught Error\n' + jqXHR.responseText);
    }
    $spinner.addClass("hidden");
}