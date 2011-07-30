/*
  Slideshow Bob -- simple web slideshow library
  License: MIT
  Copywrong 2011 Szymon Witamborski
  http://longstandingbug.com/info.html
*/
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

    var log = function(x) {
        if(console && console.log) {
            console.log(x);
        }
    }

    var bob = {};
    window.bob = bob;
    var scroll = function(x) {
        if (typeof x === "undefined") {
            return (document.documentElement.scrollTop +
                    document.body.scrollTop);
        } else {
            document.documentElement.scrollTop = x;
            document.body.scrollTop = x;
            return x;
        }
    };
    bob.scroll = scroll;

    var page = function(page_offset) {
        var current_page = Math.floor(scroll() / window.innerHeight);
        page_offset = page_offset || 0;
        var to_scroll = (current_page + page_offset) * window.innerHeight;
        scroll(to_scroll);
        return current_page + page_offset;
    }
    bob.page = page;

    var handlers = {
        "Up": function() {
            log("up!");
            page(-1);
        },
        "Down": function() {
            log("down!");
            page(1);
        },
        "Spacebar": function () {
            // here we will also change subslides
            log("space!");
            page(1);
        },
        "Left": function() {
            log("left!");
        },
        "Right": function() {
            log("right");
        }
    };
    pin(handlers, "Up", "PageUp", 38, 33);
    pin(handlers, "Down", "PageDown", 40, 34);
    pin(handlers, "Spacebar", 32);
    pin(handlers, "Left", 37);
    pin(handlers, "Right", 39);

    window.onkeydown = function (e) {
        log("key: " + e.key + " keyCode: " + e.keyCode);
        var handler = handlers[e.key] || handlers[e.keyCode];
        if(handler){
            handler();
            return false;
        }
    };
})();
