---
layout: slideshow
title: Sroo
---

# Sroo

Sroo makes simple slideshows with simplest markup possible. Project is
hosted here: <http://github.com/santamon/sroo>.

> Other feautures:
>
> - Works on modern browsers (tested on IE9, Chrome 13, Firefox 5, Opera 11)
- Intuitive navigation using mouse and keyboard
- Provides #anchors to all slides.
- Uses semantic tags instead of CSS classes.
- Doesn't impose any look on your presentation.

# The Simple Markup

Each slide is a `<section>` inside `<body>`. Each section has a
optional `<h1>` header and each other node inside slide becomes a
subslide. In the outcome, subslides shares same header.

<pre><code>
&lt;body&gt;
  &lt;section&gt;
    &lt;h1&gt;Slide No 1&lt;/h1&gt;
    &lt;p&gt;Subslide No 1.1&lt;/p&gt;
    &lt;p&gt;Subslide No 1.2&lt;/p&gt;
  &lt;/section&gt;
  &lt;section&gt;
    ...
</code></pre>

# Even Simpler Markup

You can don't have to write manually `<section>`'s. As long as each
slide begins with `<h1>` or `<hr />` (in case of slide without a
title) you're done.

<pre><code>
&lt;body&gt;
  &lt;h1&gt;Slide No1&lt;/h1&gt;
  ...subslides...
  &lt;hr /&gt;
  &lt;p&gt;This slide doesn't have a title&lt;/p&gt;
  ...
</code></pre>

# Even Simpler Simpler Markdown

In case you are generating your content from Markdown, It's becomes
even better:

<pre><code>
# Slide No1

Some stuff

Other stuff

---

Some stuff on titleless slide
...
</code></pre>

# Installation

Download sroo.css and sroo.js, put them somewhere
and then add the bolded parts to your html file:

<pre><code>
&lt;!DOCTYPE html&gt;
&lt;html&gt;
  &lt;head&gt;
    &lt;meta charset="utf-8" /&gt;
    &lt;title&gt;Presentation&lt;/title&gt;
    <b>&lt;link rel="stylesheet" type="text/css" href="sroo.css" /&gt;</b>
  &lt;/head&gt;
  &lt;body&gt;
    &lt;section&gt;
      &lt;h1&gt;Slide 1&lt;/h1&gt;
      ...
    &lt;/section&gt;
    ...
    <b>&lt;script src="sroo.js"&gt;&lt;/script&gt;</b>
  &lt;/body&gt;
&lt;/html&gt;
</code></pre>

# Jekyll

It's extra easy to use it with Jekyll: There's a layout ready for you
in _layouts directory. This doesn't require any plugins.

<pre><code>
&lt;!DOCTYPE html&gt;
&lt;html&gt;
  &lt;head&gt;
    &lt;meta charset="utf-8" /&gt;
    &lt;title&gt;&#123;&#123; page.title &#125;&#125;&lt;/title&gt;
    &lt;link rel="stylesheet" type="text/css" href="sroo.css" /&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &#123;&#123; content &#125;&#125;
    &lt;script src="sroo.js"&gt;&lt;/script&gt;
  &lt;/body&gt;
&lt;/html&gt;
</code></pre>

# Footer

> Inspired _heavily_ by <http://contrastrebellion.com/>.
>
> Copywrong 2011 Szymon Witamborski
>
> MIT License
