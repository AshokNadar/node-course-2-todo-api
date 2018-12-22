var express = require('express');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {Users} = require('./models/user');

var app = express();
app.use(bodyParser.json());
app.post('/todos',(req,res) =>{
// console.log(req.body);
var newTodo = new Todo({
       text:req.body.text
 });
    newTodo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);

    });

});

app.listen(3000,()=>{
    console.log('starting at port number 3000');
    
});

module.exports = {app};
// var newTodo = new Todo({
//     text:'cook dinner'
// });
// newTodo.save().then((doc) =>{
//     console.log('saved todos',doc);
    
// },(e)=>{
//     console.log('unable to save todo');
    
// })