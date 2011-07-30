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
    };
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
            return page(); // return actual current
        } else {
            return current;
        }
    };
    bob.page = page;

    var current_slide = function() {
        return slides()[page()];
    };
    bob.current_slide = current_slide;

    var subslide = function(offset) {
        var slide = current_slide();
        var subs = slide.children;
        var active = slide.bob_active;
        if (typeof active !== "number") {
            for (var i = 0; i < subs.length; ++i) {
                if (getComputedStyle(subs[i]).display === "table-cell" &&
                    subs[i].nodeName !== "H1") {
                    active = i;
                    break;
                }
            }
            slide.bob_active = active;
        }

        if (typeof offset === "number") {
            var desired = active + offset;

            if (subs[0].nodeName === "H1") {
                desired = Math.max(1, desired);
            } else {
                desired = Math.max(0, desired);
            }
            desired = Math.min(subs.length - 1, desired);

            subs[active].style.display = "none";
            subs[desired].style.display = "table-cell";
            slide.bob_active = desired;
            return desired;
        } else {
            return active;
        }
    };
    bob.subslide = subslide;

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
            var sub = subslide();
            if (subslide(1) === sub) {
                var current = page();
                if(current !== page(1)) {
                    sub = subslide();
                    subslide(-sub);
                }
            }
        },
        "Left": function() {
            log("left!");
            subslide(-1);
        },
        "Right": function() {
            log("right");
            subslide(1);
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
