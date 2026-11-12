# shelf

A tiny way to keep copies of some JSON in sync: a shelf is a pair, `[value, version]`, and `shelf_merge` both makes local edits and merges in other copies' changes.

Video (1¾ min): [syncing with a shelf, v0.1](https://youtu.be/d-KngLVobEs) · how it was made: [explainer-videos/videos/12-shelf](https://github.com/dglittle/explainer-videos/tree/main/videos/12-shelf)

# Install

``` js
let shelf_merge = require('shelf-merge')
// or: let {shelf_merge} = require('shelf-merge')

or

<script src="https://unpkg.com/shelf-merge"></script>
```

# Use

``` js
let shelf_merge = require('shelf-merge')

let shelf = [{hello: "world"}, [1, {hello: 1}]]

console.log(shelf[0].hello) // direct reads

let change = shelf_merge(shelf, {more: "data"}) // version info infered
```
