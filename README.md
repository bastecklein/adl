# adl

Ape Design Language module library

## Setup

You will need to add the repo as a dependency in your package.json file:

```json
"dependencies": {
    "adl": "git+ssh://git@github.com:bastecklein/adl.git#main"
}
```

The adl module also imports icon fonts and stylesheets into your project.  The module is designed to be used with [webpack](https://github.com/webpack/webpack) and utilizes the style-loader and css-loader dependencies.

```json
"devDependencies": {
    "webpack": "*",
    "css-loader": "*",
    "style-loader": "*"
}

You will need to add the following to the **module** section of your webpack config:

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

## Usage

```javascript
    import adl from "adl";
```

## Icon Font

adl uses the **FluentSystemIcons-Resizable.ttf** icon font from [Fluent UI System Icons](https://github.com/microsoft/fluentui-system-icons).