const MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('unable to connect mongodb server');
    }
    console.log(' connected to  mongodb server');

    db.collection('users').findOneAndUpdate({ name: 'Ashok' },
        {
            $set: {
                name: 'andrew'
            }, $inc: {
                age: 1
            }
        }, {
            returnOriginal: false
        }).then((results) => {
        console.log(results);



        //db.close();
        });
    });