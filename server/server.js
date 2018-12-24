var express = require('express');
var bodyParser = require('body-parser');
var {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {Users} = require('./models/user');

const port = process.env.PORT || 3000;
var app = express();
app.use(bodyParser.json());


app.post('/todos', (req, res) => {
    // console.log(req.body);
    var newTodo = new Todo({
        text: req.body.text
    });
    newTodo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/todos',(req,res) =>{
    Todo.find().then((todos) =>{
        res.send(todos);
    },(e) =>{
        res.status(400).send(e);
    });
});

app.get('/todos/:id',(req,res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)){
      return  res.status(404).send();
    }
    Todo.findById(id).then((todo) =>{
        if (!todo) {
      return  res.status(404).send();            
        }
        res.send({todo});
    }).catch((e) =>{
        res.status(400).send();
    });
});


app.delete('/todos/:id',(req,res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)){
      return  res.status(404).send();
    }
    Todo.findByIdAndRemove(id).then((todo) =>{
        if (!todo) {
      return  res.status(404).send();            
        }
        res.send({todo});
    }).catch((e) =>{
        res.status(400).send();
    });
});


app.listen(port,()=>{
    console.log(`starting at port number ${port}`);
    
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