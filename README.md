# Sroo

Sroo makes simple slideshows with simplest markup possible. Browse
here for a demo: <http://longstandingbug.com/sroo>.

Feautures:

- Intuitive navigation using mouse and keyboard
- Prospectus view when displaying on small devices and in portrait orientation
- Provides anchors to all slides so you have a permament links to every slide and subslide
- Auto scaling
- Uses semantic tags instead of CSS classes
- Doesn't impose any look on your presentation
- Works on modern browsers (tested on IE9, Chrome 13, Firefox 5, Opera 11)

# The Simple Markup

Each slide is a `<section>` inside `<body>`. Each section has a
optional `<h1>` header and each other node inside slide becomes a
subslide. In the outcome, subslides shares same header.

```html
<body>
  <section>
    <h1>Slide No 1</h1>
    <p>Subslide No 1.1</p>
    <p>Subslide No 1.2</p>
  </section>
  <section>
    ...
```

# Even Simpler Markup

Hooray for the lazy, because they are in favor. You can don't have to
write manually `<section>`'s. As long as each slide begins with `<h1>`
or `<hr />` (in case of slide without a title) you're done.

```html
<body>
  <h1>Slide No1</h1>
  ...subslides...
  <hr />
  <p>This slide doesn't have a title</p>
  ...
```

# Even Simpler Simpler Markdown

In case you are generating your content from Markdown, It's becomes
even better:

```markdown
# Slide No1

Some stuff

Other stuff

---

Some stuff on titleless slide
...
```

# Installation

Download sroo.css and sroo-min.js, put them somewhere
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
    <b>&lt;script src="sroo-min.js"&gt;&lt;/script&gt;</b>
  &lt;/body&gt;
&lt;/html&gt;
</code></pre>

# Jekyll

It's extra easy to use it with Jekyll: There's a layout ready for you
in _layouts directory. This doesn't require any plugins.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>{{ page.title }}</title>
    <link rel="stylesheet" type="text/css" href="sroo.css" />
  </head>
  <body>
    {{ content }}
    <script src="sroo-min.js"></script>
  </body>
</html>
```

# Footer

Inspired _heavily_ by <http://contrastrebellion.com/>.

Copywrong 2011 Szymon Witamborski

MIT License
