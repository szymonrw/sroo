/*
  Slideshow Bob -- simple web slideshow library
  License: MIT
  Copywrong 2011 Szymon Witamborski
  http://longstandingbug.com/info.html
*/
(function() {
    /* These fns are only for debugging */
    var dump = function(e) {
        var s = "";
        for(a in e) {
            s += a + ": " + e[a] + "\n"
        }
        return s;
    };

    var log = function(x) {
        if(console && console.log) {
            console.log(x);
        }
    }
    /* end of debugging fns */

    var pin = function(a, key /* and arguments */) {
        var value = a[key];
        for(var i = 2; i < arguments.length; ++i) {
            a[arguments[i]] = value;
        }
    };


    var bob = {};
    window.bob = bob;

    /* This function loads lazily list of slides. */
    var slides = (function() {
        var list;
        return function() {
            if(!list){
                list = document.querySelectorAll("body > section");
            }
            return list;
        }
    })();
    bob.slides = slides;

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

    var page = function(offset) {
        var current = Math.floor(scroll() / window.innerHeight);
        if(typeof offset === "number") {
            var desired = current + offset;
            scroll(desired * window.innerHeight);
            return desired;
        } else {
            return current;
        }
    }
    bob.page = page;

    var current_slide = function() {
        return slides()[page()];
    }
    bob.current_slide = current_slide;

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
