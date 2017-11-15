//var bar = require('./bar');
require.ensure([], function(require) {
    return require("./bar");
}, "mychunk2").then(function (bar) {
    //console.log("fulfill function is called " + bar);
    bar()
});

var image = require('../assets/screen.png');

function addElement() {
    var element = document.createElement('div');
    element.innerHTML = "<b>Text</b>";
    element.classList.add('hello');

    document.body.appendChild(element);

    var element2 = new Image();
    element2.src = image;
    document.body.appendChild(element2);
}


//bar();
addElement();