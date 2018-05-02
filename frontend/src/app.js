// var bar = require('./bar');
require.ensure([], require => require('./bar'), 'mychunk2').then((bar) => {
  // console.log("fulfill function is called " + bar);
  bar();
});

const image = require('../assets/screen.jpg');

function addElement() {
  const element = document.createElement('div');
  element.innerHTML = '<b>Text</b>';
  element.classList.add('hello');

  document.body.appendChild(element);

  const element2 = new Image();
  element2.src = image;
  document.body.appendChild(element2);
}


// bar();
addElement();
