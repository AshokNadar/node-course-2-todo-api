const expect = require('expect');
const request = require('supertest');
var {ObjectID} = require('mongodb');


const {app} = require('./../server');
const {Todo} =require('./../models/todo');
const {Users} =require('./../models/user');
const {todos,populateTodos,users,populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todo',()=>{
    it('should create a new todo',(done)=>{
        var text ='test todo text';
        request(app)
        .post('/todos')
        .set('x-auth',users[0].tokens[0].token)
        .send({text})
        .expect(200)
        .expect((res)=>{
        expect(res.body.text).toBe(text)
        })
        .end((err,res) =>{
            if(err){
                return done(err)
            }
            Todo.find({text}).then((todos) =>{
            expect(todos.length).toBe(1);
                expect(todos[0].text).toBe(text);
                done();
            }).catch((e) => done(e));
        });

    });


it('should not create todo with invalid data ',(done)=>{
    request(app)
    .post('/todos')
    .set('x-auth',users[0].tokens[0].token)
    .send({})
    .expect(400)
    .end((err,res) =>{
        if(err){
            return done(err)
        }
        Todo.find().then((todos) => {
            expect(todos.length).toBe(2);
            done();
        }).catch((e) => done(e));
    }); 
});
});

describe('GET /todos',() =>{
    it('should get all the todos',(done) =>{
    request(app)
    .get('/todos')
    .set('x-auth',users[0].tokens[0].token)
    .expect(200)
    .expect((res) =>{
      expect(res.body.length).toBe(1);
      //expect(res.body.todos.length).toBe(1);
    })
    .end(done)
  });
});

describe('GET /todos/:id',()=>{
    it('should return todo doc',(done)=>{
        request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .set('x-auth',users[0].tokens[0].token)
        .expect(200)
        .expect((res)=>{
            expect(res.body.todo.text).toBe(todos[0].text);
        })
      
        .end(done)
    });

    it('should not return todo doc created by other user',(done)=>{
        request(app)
        .get(`/todos/${todos[1]._id.toHexString()}`)
        .set('x-auth',users[0].tokens[0].token)
        .expect(404)
        .end(done)
    });

    it('should return 404 object id not found',(done)=>{
        request(app)
        .get(`/todos/${new ObjectID().toHexString()}`)
        .set('x-auth',users[0].tokens[0].token)
        .expect(404)
        .end(done)
    })

    it('should return 404 non object id ',(done)=>{
        request(app)
        .get(`/todos/123abc`)
        .set('x-auth',users[0].tokens[0].token)
        .expect(404)
        .end(done)
    })


});
 
 
describe('DELETE todo/id ',()=>{
    it('should remove a todo',(done)=>{
        var hexId= todos[1]._id.toHexString();
        request(app)
        .delete(`/todos/${hexId}`)
        .set('x-auth',users[1].tokens[0].token)
        .expect(200)
        .expect((res)=>{
            expect(res.body.todo._id).toBe(hexId);
        })
        .end((err,res)=>{
            if(err){
                return done(err);
            }
            Todo.findById(hexId).then((todo) => {
                expect(todo).toNotExist();
                done();
            }).catch((e) => done(e));
        });
         
    });

    it('should remove a todo',(done)=>{
        var hexId= todos[0]._id.toHexString();
        request(app)
        .delete(`/todos/${hexId}`)
        .set('x-auth',users[1].tokens[0].token)
        .expect(404)
        .end((err,res)=>{
            if(err){
                return done(err);
            }
            Todo.findById(hexId).then((todo) => {
                expect(todo).toExist();
                done();
            }).catch((e) => done(e));
        });
        
    });


    it('should return 404 if todo not found ', (done) =>{
        var hexId = new ObjectID().toHexString();
        request(app)
        .delete(`/todos/${hexId}`)
        .set('x-auth',users[1].tokens[0].token)
        .expect(404)
        .end(done)
    });

    it('should return 404 non object id ',(done)=>{
        request(app)
        .delete(`/todos/123abc`)
        .set('x-auth',users[1].tokens[0].token)
        .expect(404)
        .end(done)
    })

});
describe('PATCH /todo:id',()=>{
    it('should update the todo ',(done)=>{
        var hexId= todos[0]._id.toHexString();
        text ="something to update"
        request(app)
    .patch(`/todos/${hexId}`)
    .set('x-auth',users[0].tokens[0].token)
    .send({
        completed:true,
        text
    })
    .expect(200)
    .expect((res)=>{
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA("number");
    })
    .end(done);
    });

    it('should not update the todo created by other user',(done)=>{
        var hexId= todos[0]._id.toHexString();
        text ="something to update"
        request(app)
    .patch(`/todos/${hexId}`)
    .set('x-auth',users[1].tokens[0].token)
    .send({
        completed:true,
        text
    })
    .expect(404)
    .end(done);
    });

    it('it should clear completedAt when todo is not completed ',(done)=>{
        var hexId= todos[1]._id.toHexString();
        text ="something to update !!!"
        request(app)
    .patch(`/todos/${hexId}`)
    .set('x-auth',users[1].tokens[0].token)
    .send({
        completed:false,
        completedAt:null,
        text
    })
    .expect(200)
    .expect((res)=>{
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
    //   expect(res.body.todo.completedAt).toNotExist();
    })
    .end(done);
    })
});


describe('GET users/me',()=>{
    it('should return user if auhenticated',(done)=>{
        request(app)
        .get('/users/me')
        .set('x-auth',users[0].tokens[0].token)
        .expect(200)
        .expect((res)=>{
            expect(res.body._id).toBe(users[0]._id.toHexString());
            expect(res.body.email).toBe(users[0].email);
        })
        .end(done);
    });

    it('should run 401 if user is not authenticated',(done)=>{
          request(app)
        .get('/users/me')
        .expect(401)
        .expect((res)=>{
            expect(res.body).toEqual({});
        })
        .end(done);
    });
});

describe('POST /users',()=>{
    it('should create a user',(done)=>{
        var email = 'abc@abc.com';
        var password = 'abc123!';
        request(app)
        .post('/users')
        .send({email,password})
        .expect(200)
        .expect((res)=>{
            expect(res.headers['x-auth']).toExist();
            expect(res.body._id).toExist();
            expect(res.body.email).toBe(email);
        })
        .end((err)=>{
            if(err){
                return done(err);
            }
            Users.findOne({email}).then((user)=>{
                expect(user).toExist();
                expect(user.password).toNotBe(password);
                done();
            }).catch((e)=>done(e));
        });
    });

    it('should return validation error',(done)=>{
        request(app)
        .post('/users')
        .send({email:'abc',password:'12'})
        .expect(400)
        .end(done);  
    });

    it('should not create a user if already exist',(done)=>{
        request(app)
        .post('/users')
        .send({email:users[0].email,password:'12'})
        .expect(400)
        .end(done); 
    })
});

describe('POST /users/login',()=>{
    it('should login user and verify token',(done)=>{
        request(app)
        .post('/users/login')
        .send({
            email:users[1].email,
            password:users[1].password
        })
        .expect(200)
        .expect((res)=>{
            expect(res.headers['x-auth']).toExist();

        })
.end((err,res)=>{
    if(err){
        return done(err);
    }
    Users.findById(users[1]._id).then((user)=>{
        expect(user.tokens[1]).toInclude({
            access:'auth',
            token:res.header['x-auth']
        });
        done();
    }).catch((e)=>done(e));
    });
  });

  it('should reject invalid login',(done)=>{
    request(app)
    .post('/users/login')
    .send({
        email:users[1].email,
        password:users[1].password +'invalid'
    })
    .expect(400)
    .expect((res)=>{
        expect(res.headers['x-auth']).toNotExist();

    })
.end((err,res)=>{
if(err){
    return done(err);
}
Users.findById(users[1]._id).then((user)=>{
    expect(user.tokens.length).toBe(1);
    done();

}).catch((e)=>done(e));
  });
  });
});

describe('DELETE /users/me/token',()=>{
    it('should remove auth token on logOut',(done)=>{
        request(app)
        .delete('/users/me/token')
        .set('x-auth',users[0].tokens[0].token)
        .expect(200)
    
    .end((err,res)=>{
    if(err){
        return done(err);
    }
    Users.findById(users[0]._id).then((user)=>{
        expect(user.tokens.length).toBe(0);
        done();
    
    }).catch((e)=>done(e));
      });
    });
    });
