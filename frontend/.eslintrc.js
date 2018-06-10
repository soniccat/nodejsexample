module.exports = {
    "extends": "airbnb",

    "settings": {
        "import/resolver": {
            "webpack": {
                config: 'webpack.dev.js'
            }
        }
    },

    "rules": {
        "react/jsx-closing-tag-location": "off",
        "react/sort-comp" : "off",
    }
};