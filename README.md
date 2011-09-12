# Slideshow Bob

Slideshow Bob makes simple slideshows with simplest markup
possible.

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

Download slideshow-bob.css and slideshow-bob.js, put them somewhere
and add bolded parts to your html file:

<pre><code>
&lt;!DOCTYPE html&gt;
&lt;html&gt;
  &lt;head&gt;
    &lt;meta charset="utf-8" /&gt;
    &lt;title&gt;Presentation&lt;/title&gt;
    <b>&lt;link rel="stylesheet" type="text/css" href="slideshow-bob.css" /&gt;</b>
  &lt;/head&gt;
  &lt;body&gt;
    &lt;section&gt;
      &lt;h1&gt;Slide 1&lt;/h1&gt;
      ...
    &lt;/section&gt;
    ...
    <b>&lt;script src="slideshow-bob.js"&gt;&lt;/script&gt;</b>
  &lt;/body&gt;
&lt;/html&gt;
</code></pre>

# Jekyll

It's extra easy to use it with Jekyll: There's a layout ready for you
in _layouts directory. This doesn't require any plugins for Jekyll.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>{{ page.title }}</title>
    <link rel="stylesheet" type="text/css" href="slideshow-bob.css" />
  </head>
  <body>
    {{ content }}
    <script src="slideshow-bob.js"></script>
  </body>
</html>
```

# Footer

Inspired _heavily_ by <http://contrastrebellion.com/>.

Copywrong 2011 Szymon Witamborski

MIT License
