(function() {
    var dump = function(e) {
        var s = "";
        for(a in e) {
            s += a + ": " + e[a] + "\n"
        }
        return s;
    };

    var pin = function(a, key /* and arguments */) {
        var value = a[key];
        for(var i = 2; i < arguments.length; ++i) {
            a[arguments[i]] = value;
        }
    };

    var handlers = {
        "Up": function() {
            console.log("up!");
        },
        "Down": function() {
            console.log("down!");
        },
        "Left": function() {
            console.log("left!");
        },
        "Right": function() {
            console.log("right");
        }
    };
    pin(handlers, "Up", "PageUp", 38, 33);
    pin(handlers, "Down", "PageDown", 40, 34);
    pin(handlers, "Left", 37);
    pin(handlers, "Right", 39);

    window.onkeydown = function (e) {
        console.log(e);
        var handler = handlers[e.key] || handlers[e.keyCode];
        if(handler){
            handler();
            return false;
        }
    };
})();
