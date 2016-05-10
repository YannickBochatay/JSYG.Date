# Date
Date constructor for [JSYG framework](https://github.com/YannickBochatay/JSYG) or standalone

### Installation

##### with npm
```shell
npm install jsyg-date
```

##### with bower
```shell
bower install jsyg-date
```


### Usage

##### es6 modules (webpack+babel)
```javascript
import JDate from "jsyg-date"

new JDate().add("");
```

##### without bundler
```html
<script src="node_modules/jsyg-date/JSYG.Date.js"></script>
<script>
  console.log( new JSYG.Date().add("1 month 2 seconds").toString() );
</script>
```