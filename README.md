# adl

Ape Design Language module library

## Setup

Add the repo as a dependency in your package.json file:

```json
"dependencies": {
    "adl": "git+ssh://git@github.com:bastecklein/adl.git#main"
}
```

### For Webpack-based Projects

The adl module imports icon fonts and stylesheets. When using [webpack](https://github.com/webpack/webpack), add the style-loader and css-loader dependencies:

```json
"devDependencies": {
    "webpack": "*",
    "css-loader": "*",
    "style-loader": "*"
}
```

Add the following to the **module** section of your webpack config:

```javascript
module: {
    rules: [
        {
            test: /\.css$/i,
            use: ["style-loader", "css-loader"],
        },
        {
            test: /\.(woff|woff2|eot|ttf|otf)$/i,
            type: "asset/resource",
            generator: {
                filename: "fonts/[name][ext]"
            }
        }
    ]
}
```

### For Non-Webpack Node.js Projects

No special configuration needed. The module will automatically use the CommonJS wrapper.

## Usage

### ES Module (Webpack/Browser)

```javascript
import adl from "adl";
```

### CommonJS (Node.js without Webpack)

```javascript
const adl = require("adl");
```

### Async Usage (if needed)

Since the CommonJS wrapper uses dynamic imports, you may need to handle it as a promise in some environments:

```javascript
const adlPromise = require("adl");
adlPromise.then(adl => {
    // Use adl module here
});
```

Complete API documentation and function demos can be found at the [Ape Design Language demo website](https://design.ape-apps.com/).

## Icon Font

adl uses the **FluentSystemIcons-Resizable.ttf** icon font from [Fluent UI System Icons](https://github.com/microsoft/fluentui-system-icons).