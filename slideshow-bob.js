/*
  Slideshow Bob -- simple web slideshow library
  License: MIT
  Copywrong 2011 Szymon Witamborski
  http://longstandingbug.com/info.html
*/
(function() {
    // reorganize body to sections if not structured properly
    var body = document.body;
    var slides = [];
    var slide, node, nodeName, i, ii;
    var active_slide = 0;

    if(body.firstElementChild.nodeName !== "SECTION") {
        slide = document.createElement("section");
        slides.push(slide);
        slide.appendChild(body.firstElementChild);
        while(body.childElementCount > 0) {
            node = body.removeChild(body.firstElementChild);
            nodeName = node.nodeName;
            if (nodeName === "HR" || nodeName === "H1") {
                slide = document.createElement("section");
                slides.push(slide);
            }
            if (nodeName !== "HR" && nodeName !== "SCRIPT") {
                slide.appendChild(node);
            }
        }
        for(i = 0, ii = slides.length; i < ii; ++i) {
            body.appendChild(slides[i]);
        }
    } else {
        slides = document.querySelectorAll("body > section");
    }

    for (i = 0, ii = slides.length; i < ii; ++i) {
        slides[i].active_subslide = 0;
    }

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

    var move_to_slide = function(slide_num) {
        if(slide_num < 0 || slide_num >= slides.length) {
            return;
        }
        scroll(slides[slide_num].offsetTop);
        active_slide = slide_num;
    };

    var move_to_subslide = function(subslide_num) {
        var slide = slides[active_slide];
        var subs = slide.children;
        var header_offset = subs[0].nodeName === "H1" ? 1 : 0;

        if(subslide_num === "last") {
            subslide_num = subs.length - 1 - header_offset;
        }

        if(subslide_num < 0 || subslide_num + header_offset >= subs.length) {
            return false;
        }

        if(typeof slide.active_subslide !== "number") {
            slide.active_subslide = 0;
        }

        subs[slide.active_subslide + header_offset].style.display = "none";
        subs[subslide_num + header_offset].style.display = "table-cell";
        slide.active_subslide = subslide_num;
        return true;
    };

    var step = function(direction) {
        var active_subslide = slides[active_slide].active_subslide;
        if(!move_to_subslide(active_subslide + direction)) {
            move_to_slide(active_slide + direction);
            if(direction > 0) {
                move_to_subslide(0);
            } else {
                move_to_subslide("last");
            }
        }
        update_location();
    }


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
        var handler = handlers[event.keyCode];
        if(handler){
            handler(event);
            return preventDefault(event);
        }
    };

    var update_location = function() {
        var active_subslide = slides[active_slide].active_subslide;
        location.assign("#slide-" + (active_slide + 1) +
                        ((typeof active_subslide === "number" && active_subslide !== 0) ?
                         ("-" + (active_subslide + 1)) : ""));
    };

    var slide_nums = /\#slide-?(\d+)-?(\d*)$/i;
    window.onload = function() {
        var nums = slide_nums.exec(location.hash);
        if(nums) {
            move_to_slide((+nums[1])-1);
            move_to_subslide((+nums[2])-1);
        } else {
            update_location();
        }
    };

    // Reposition window after zooming
    window.onresize = function() {
        move_to_slide(active_slide);
    };

    // Preventing from handling scrolling when Ctrl is pressed --
    // -- otherwise zooming in Firefox 5 is broken
    var zooming = false;
    handlers[17] = function() { zooming = true; };
    window.onkeyup = function(event) {
        if (event.keyCode === 17) {
            zooming = false;
        }
    }

    var wheel = function(event) {
        if (!zooming) {
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

    // export public interface
    window.bob = {
        scroll: scroll,
        move_to_slide: move_to_slide,
        move_to_subslide: move_to_subslide
    };
}());
