---
layout: slideshow
title: Flat-structured slideshow
---

# This slideshow doesn't have `<section>`s

Indeed, they are magically added by Slideshow Bob.

Just like in normal version, every node inside slide becomes a
subslide.

- like lists
- or code examples

{% highlight javascript %}
alert('Hello!');
{% endhighlight %}

# How to structure slides then?

Each slide begins with a `<h1>` heading or a horizontal ruler `<hr />`.

---

This should be helpful for people using Markdown or Textile,
etc. (Jekyll too! :) )

`<h1>` is `#` in Markdown and horizontal ruler is `---` or...

> You can produce a horizontal rule tag (`<hr />`) by placing three or
  more hyphens, asterisks, or underscores on a line by themselves. If
  you wish, you may use spaces between the hyphens or
  asterisks. *[markdown docs]*

# But:

One caveat!

End-user must have JavaScript enabled.
