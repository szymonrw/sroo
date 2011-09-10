/*
  Slideshow Bob -- simple web slideshow library
  License: MIT
  Copywrong 2011 Szymon Witamborski
  http://longstandingbug.com/info.html
*/
(function() {
    var body = document.body;
    var slides = [];
    var slide, node, nodeName, i, ii;
    var active_slide = 0;

    // reorganize body to sections if not structured properly
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

    // add to each slide's object it's active slide index
    for (i = 0, ii = slides.length; i < ii; ++i) {
        slides[i].active_subslide = 0;
    }

    if (!window.requestAnimationFrame) {
	window.requestAnimationFrame = (function() {
	    return window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(callback, element) {
		    window.setTimeout( callback, 1000 / 60 );
		};
	})();
    }

    var vertical_position = function(x) {
        if (typeof x === "undefined") {
            return Math.max(document.documentElement.scrollTop,
                            document.body.scrollTop);
        } else {
            document.documentElement.scrollTop = x;
            document.body.scrollTop = x;
            return x;
        }
    };

    var make_scroller = function(target, speed) {
        speed = speed || 10;
        var begin = vertical_position();
        var pos;
        var that = function() {
            that.progress = Math.min(that.progress + speed, 100);
            pos = (begin * (100 - that.progress) + (that.target * that.progress)) / 100;
            vertical_position(pos);
            if (that.progress < 100) {
                requestAnimationFrame(that);
            }
        }
        that.target = target;
        that.progress = 0;
        return that;
    }

    var scroller;
    var scroll = function(target){
        if (scroller && scroller.progress < 100) {
            scroller.target = target;
        } else {
            scroller = make_scroller(target);
            requestAnimationFrame(scroller);
        }
    };

    var move_to_slide = function(slide_num, immediately) {
        if(slide_num < 0 || slide_num >= slides.length) {
            return false;
        }
        (immediately? vertical_position : scroll)(slides[slide_num].offsetTop);
        active_slide = slide_num;
        return true;
    };

    Object.prototype.delete_class = function(class_name) {
        this.className = this.className.replace(class_name, "");
        return this;
    }

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

        subs[slide.active_subslide + header_offset].
            delete_class(" shown").
            className += " hidden";
        subs[subslide_num + header_offset].
            delete_class(" hidden").
            className += " shown";

        slide.active_subslide = subslide_num;
        return true;
    };

    var step = function(direction) {
        var active_subslide = slides[active_slide].active_subslide;
        if(!move_to_subslide(active_subslide + direction)) {
            if(move_to_slide(active_slide + direction)) {
                if(direction > 0) {
                    move_to_subslide(0);
                } else {
                    move_to_subslide("last");
                }
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
            move_to_slide((+nums[1])-1, true);
            move_to_subslide((+nums[2])-1);
        } else {
            update_location();
        }
    };

    // Reposition window after zooming
    window.onresize = function() {
        move_to_slide(active_slide, true);
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
