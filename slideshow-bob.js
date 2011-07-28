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

    var change_page = function(page_offset) {
        var page = Math.floor(scroll() / window.innerHeight);
        var to_scroll = (page + page_offset) * window.innerHeight;
        scroll(to_scroll);
        return page + page_offset;
    }
    bob.change_page = change_page;

    var handlers = {
        "Up": function() {
            console.log("up!");
            change_page(-1);
        },
        "Down": function() {
            console.log("down!");
            change_page(1);
        },
        "Spacebar": function () {
            // here we will also change subslides
            console.log("space!");
            change_page(1);
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
    pin(handlers, "Spacebar", 32);
    pin(handlers, "Left", 37);
    pin(handlers, "Right", 39);

    window.onkeydown = function (e) {
        console.log("key: " + e.key + " keyCode: " + e.keyCode);
        var handler = handlers[e.key] || handlers[e.keyCode];
        if(handler){
            handler();
            return false;
        }
    };
})();
