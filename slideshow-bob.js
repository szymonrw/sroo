/*
  Slideshow Bob -- simple web slideshow library
  License: MIT
  Copywrong 2011 Szymon Witamborski
  http://longstandingbug.com/info.html
*/
(function() {
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
            return Math.max(document.documentElement.scrollTop,
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

    var step = function(direction) {
        // here we will also change subslides
        var sub = subslide();
        if (subslide(direction) === sub) {
            var current = page();
            var next = page(direction);
        }
    };
    bob.step = step;

    Object.prototype.multiset = function () {
        for(var i = 0, ii = arguments.length - 1, value = arguments[ii]; i < ii; ++i) {
            this[arguments[i]] = value;
        }
    };

    var handlers = {};
    handlers.multiset(38, 33, 37,     function() { step(-1); }); // Up, PageUp and Left
    handlers.multiset(40, 34, 39, 32, function() { step( 1); }); // Down, PageDown, Right and Space

    var preventDefault = function (event) {
        if (event.preventDefault) event.preventDefault();
        event.returnValue = false;
        return false;
    }

    window.onkeydown = function (event) {
        console.log(event.keyCode);
        var handler = handlers[event.keyCode];
        if(handler){
            handler(event);
            return preventDefault(event);
        }
    };

    /* Preventing from handling scrolling when Ctrl is pressed --
       -- otherwise zooming in Firefox 5 is broken */
    var preventWheel = false;
    handlers[17] = function() { preventWheel = true; };
    window.onkeyup = function(event) {
        if (event.keyCode === 17) {
            preventWheel = false;
        }
    }

    var wheel = function(event) {
        if(!preventWheel) {
            var delta;
            if (typeof event.wheelDelta === "number") {
                delta = event.wheelDelta < 0 ? 1 : -1;
            } else if (typeof event.detail === "number") {
                delta = event.detail > 0 ? 1 : -1;
            }
            step(delta);
            return preventDefault(event);
        }
    };

    window.onmousewheel = wheel;
    window.addEventListener('DOMMouseScroll', wheel, false);
})();

/* The following part is optional:
   Takes document without <section>s and makes them for you.
   Each part starting with <h1> or <hr> is considered a slide.
*/

(function() {
    window.onload = function() {
        var body = document.body;
        if(body.firstElementChild.nodeName !== "SECTION") {
            var slides = [];
            var slide = document.createElement("section");
            slides.push(slide);
            slide.appendChild(body.firstElementChild);
            while(body.childElementCount > 0) {
                var node = body.removeChild(body.firstElementChild);
                var nodeName = node.nodeName;
                if (nodeName === "HR" || nodeName === "H1") {
                    slide = document.createElement("section");
                    slides.push(slide);
                }
                if (nodeName !== "HR") {
                    slide.appendChild(node);
                }
            }
            for(var i = 0; i < slides.length; ++i) {
                body.appendChild(slides[i]);
            }
        }
    };
})();
