$(function () {
    ///////////////////////////////////////////////////////////////
    // Standard drawing board functionalities
    ///////////////////////////////////////////////////////////////

    var canvas = $("#mainCanvas"),
        height = canvas.height(),
        width = canvas.width(),
        colors = ["black", "red", "green", "blue", "yellow", "magenta", "white", "blueviolet", "chocolate", "crimson"],
        colorElement = $("input#color"),
        colorPickerContainer = $("#colorPickerContainer"),
        buttonPressed = false;
    
    $.each(colors,
        function (i, color) {
            var currentId = "color_" + i;
            colorPickerContainer
                .append($("<input type='radio' name='colorpicker'>").attr('id', currentId).val(i).click(
                    function() {
                        colorElement.val($(this).val()).trigger('change');
                    }))
                .append($('<label>').attr('for', currentId)
                .append($("<span>").css({'background-color': color})));
        });
    

    canvas
        .mousedown(function () {
            buttonPressed = true;
        })
        .mouseup(function () {
            buttonPressed = false;
        })
        .mousemove(function (e) {
            if (buttonPressed) {
                setPoint(e.offsetX, e.offsetY, colorElement.val());
            }
        });
    
    //To create a circle with arc(): Set start angle to 0 and end angle to 2*Math.PI.
    //https://www.w3schools.com/tags/canvas_arc.asp
    var ctx = canvas[0].getContext("2d");
    function setPoint(x, y, colorIdx) {
        ctx.fillStyle = colors[colorIdx];
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    function clearPoints() {
        ctx.clearRect(0, 0, canvas.width(), canvas.height());
    }
    $("#clear").click(function () {
        clearPoints();
    });


    ///////////////////////////////////////////////////////////////
    // SignalR specific code
    ///////////////////////////////////////////////////////////////
    var hub = $.connection.drawingBoard;

    // State setup
    hub.state.color = colorElement.val(); 

    var connected = false;

    // UI events
    colorElement.change(function () {
        hub.state.color = $(this).val();
    });

    canvas.mousemove(function (e) {
        if (buttonPressed && connected) {
            console.log('moved');
            hub.server.broadcastPoint(
                Math.round(e.offsetX), Math.round(e.offsetY)
            );
        }
    });
    $("#clear").click(function () {
        if (connected) {
            hub.server.broadcastClear();
        }
    });
    // Event handlers
    hub.client.clear = function () {
        clearPoints();
    };
    hub.client.drawPoint = function (x, y, color) {
        setPoint(x, y, color);
    };
    hub.client.update = function (points) {
        if (!points) {
            return;
        }
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                if (points[x][y]) {
                    setPoint(x, y, points[x][y]);
                }
            }
        }
    };


    $.connection.hub.start()
        .done(function () {
            connected = true;
        });
});