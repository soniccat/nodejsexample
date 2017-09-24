


function bar() {
	setTimeout(function() { require('style-loader!./my.css'); }, 1000);
}

module.exports = bar;