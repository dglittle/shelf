# Install

```shell
npm install shelf-merge
```

or

```html
<script src="https://unpkg.com/shelf-merge"></script>
```

# Use

``` js
let {shelf_merge} = require('shelf-merge')

let shelf = [{hello: "world"}, [1, {hello: 1}]]

console.log(shelf[0].hello) // direct reads

let change = shelf_merge(shelf, {more: "data"}) // version info infered
```
