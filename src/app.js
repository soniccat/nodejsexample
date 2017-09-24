var bar = require('./bar');
var image = require('./screen.png');

function addElement() {
    var element = document.createElement('div');
    element.innerHTML = "<b>Text</b>";
    element.classList.add('hello');

    document.body.appendChild(element);

    var element2 = new Image();
    element2.src = image;
    document.body.appendChild(element2);
}

bar();
addElement();