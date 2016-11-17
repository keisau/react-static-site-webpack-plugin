# React Static Site Webpack plugin
---

Inspired by [static site generator webpack plugin](https://github.com/markdalgleish/static-site-generator-webpack-plugin), but instead of hand-coding a path array, I chose to parse React Router's `Route` tree to generate a path array. Even then, I can only make sure it will work only with simple usage of React Router. Advanced behaviors like `IndexRoute` and asterisk/wildcard path matching can be implemented in other form when building a static site.

## Pre-requisites
---
1. Node JS (6 is preferrable)
2. yarn (some scripts will not work with npm)

## Usage
---
1. Refer to [example](https://github.com/pierresaux/react-static-site-webpack-plugin/tree/master/example)

## Contribute
---
I am looking forward to feedbacks. Make sure your issues or emails state the main point and cover:
1. Facts,
2. Constructive opinions, or
3. Working codes that improve/fix
