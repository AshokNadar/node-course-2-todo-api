const MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017/TodoApp',(err,db)=> {
    if(err) {
        return console.log('unable to connect mongodb server');
    }
     console.log(' connected to  mongodb server');
//  db.collection('users').deleteMany({name:'xyz'}).then((results) =>{
//      console.log(results);
     
db.collection('users').findOneAndDelete({name:'Ashok'}).then((results) =>{
    console.log(results);
    
 })
  
    //db.close();
});