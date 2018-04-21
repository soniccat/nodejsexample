const fs = require('fs');
const express = require('express');

const app = express();
// var content = fs.readFileSync('./dist/index.html');

app.use(express.static('./dist'));
// app.get('/mmm', function (req, res) {
//     res.header("Content-Type", "text/html");
//     res.send("override");
// });

app.listen(80, () => {

});
