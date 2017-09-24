var bar = require('./bar');
var nodePackage = require("./package.json");


function addElement() {
    var element = document.createElement('div');

    element.innerHTML = "<b>Text</b><img src='./screen.png'/>";
    element.classList.add('hello');

    document.body.appendChild(element);
}

bar();
addElement();