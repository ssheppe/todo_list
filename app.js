var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var swig = require('swig');
var bcrypt = require('bcrypt');
SALT_WORK_FACTOR = 10;

// var routes = require('./routes/index');
var users = require('./routes/users');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var app = express();

var session = require('express-session');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);

mongoose.connect('mongodb://localhost/test');
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', function (callback) {
  console.log("successfully connected");
});

app.use(session({
    secret: 'ec5a7c3e21436a8e76716710ce551356f9aa745e',
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

app.engine('html', swig.renderFile);

// app.use(passport.initialize());
// app.use(passport.session());


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
// app.use('/', routes);
// app.use('/users', users);

// catch 404 and forward to error handler

app.use(function(req, res, next){
  console.log(req.url);
  console.log(req.session.user);
  var isWhiteListedUrl = (req.url == '/' || req.url == '/login' || req.url == '/logout' || req.url == '/register'); 
  res.locals.user = req.session.user;
  if(!req.session.user && !isWhiteListedUrl){
    res.redirect('/login');
  } else {
    next();
  }
});


var taskSchema = mongoose.Schema({
  description: String,
  created_date: { type: Date, default: Date.now },
  updated_date: { type: Date, default: Date.now },
  completed: { type: Boolean, default: false },
  deleted: {type: Boolean, default: false},
  user_id: { type: String, required: true, index: true}
});

var userSchema = mongoose.Schema({
  name: {type: String, required: true},
  username: { type: String, unique : true, required : true, index: true},
  password: { type: String, required: true},
  created_date: { type: Date, default: Date.now },
  updated_date: { type: Date, default: Date.now },
  email: { type: String, unique : true, required : true, index: true }
});


//bcrypt 
// userSchema.pre('save', function(next) {                                                                                                                                        
//     if(this.password) {                                                                                                                                                                                                                                                                                            
//         this.password  = bcrypt.hashSync(this.password, SALT_WORK_FACTOR)                                                                                                                
//     }                                                                                                                                                                          
//     next()                                                                                                                                                                     
// })  

var Task = mongoose.model('Task', taskSchema);
var User = mongoose.model('User', userSchema);


/* GET home page. */
app.get('/', function(req, res, next) {
  // console.log('\n\n\n\n HEREREE \n\n\n')
  res.render('index', { title: 'My fancy task list'});
});

app.get('/register', function(req, res, next) {
  if(req.session.user){
    res.redirect('/tasks');  
  } else {
    res.render('register', { title: 'My fancy task list' });
  }
});

app.post('/register', function(req, res){
  var name = req.body.name;
  var username = req.body.username;
  var password = req.body.password;
  var confirm_password = req.body.confirm_password;
  var email = req.body.email;

  var user = new User({name: name, email: email, username: username, password: password});

  if(password == confirm_password){
    user.save(function(err){
      if(err){
        res.status(500).send('got error: ' + err.message);
      } else {
        //  res.send("success register");
            console.log(name);
          res.redirect('/login');
      }
    });
  } else {
        res.status(500).send('got error: password mismatch');
  }
});

app.get('/login', function(req, res, next) {
  if(req.session.user){
    res.redirect('/tasks');
  } else {
    res.render('login', { title: 'My fancy task list' });  
  }
});


app.post('/login', function(req, res){
  var user = req.body.username;
  var password = req.body.password;

  //bcrypt
  // password = bcrypt.hashSync(password, SALT_WORK_FACTOR);
  // console.log(password);
  User.findOne({username: user}, function(err, user){
    if(err){
        res.status(500).render('login', { title: 'My fancy task list', error: "world is ending" });
      } else if(!user){
        res.status(404).render('login', { title: 'My fancy task list', error: "user not found" });
      } else if(user.password != password){
        res.status(500).render('login', { title: 'My fancy task list', error: "invalid password or username" });
      } else{
        req.session.user = user;
        res.redirect('/tasks');
      }
    })
  });

app.get('/logout', function(req, res){
  req.session.destroy(function(err) {
    res.redirect('/login');
  })
});


app.get('/layout', function(req, res, next) {
  res.render('layout', { title: 'My fancy task list' });
});


app.post('/login', function(req, res){
  var username = req.body.username;
  var password = req.body.password;

  res.send("success");
})

app.get('/tasks', function(req, res, next) {
  Task.find({deleted: false, user_id: req.session.user && req.session.user._id}, function (err, taskList){
    if (err) return console.error(err);
    res.render('tasks', { title: 'My fancy task list', taskList: taskList });
  })
});

app.delete('/tasks/:id', function(req, res, next) {
  var id = req.params.id;
  Task.findById(id, function(err, task){
    if(err){
      res.send(500, "Failed to update id: " + id);
    } else if(task){
      task.deleted = true; 
      task.save(function(err){
        if(err){
          res.send(500, "Failed to update id: " + id);
        } else {
          res.send("successfully marked task as deleted " + id);
        }
      })
    } else {
      res.send(404, "Unable to locate task with id: " + id);
    }
  })
})

app.put('/tasks/:id', function(req, res, next) {
  var id = req.params.id;
  Task.findById(id, function(err, task){
    if(err){
      res.send(500, "Failed to update id: " + id);
    } else if(task){
      task.completed = !task.completed; 
      task.save(function(err){
        if(err){
          res.send(500, "Failed to update id: " + id);
        } else {
          res.send("successfully marked task as completed: " + id);
        }
      })
    } else {
      res.send(404, "Unable to locate task with id: " + id);
    }
  })
})

app.post('/tasks', function(req, res, next){
//  console.log("BODY", req.body);
  var task = new Task({description: req.body.task, user_id: req.session.user && req.session.user._id});
  task.save(function(err){
    res.redirect('/tasks');
  });
})



// app.post('/',
//   passport.authenticate('local', {
//     successRedirect: '/todolist',
//     failureRedirect: '/loginFailure'
//   })
// );

// app.get('/loginFailure', function(req, res, next) {
//   res.send('Failed to authenticate');
// });

// app.get('/todolist', function(req, res, next) {
//   res.send('Successfully authenticated');
// });

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new LocalStrategy(function(username, password, done) {
  process.nextTick(function() {
    taskSchema.findOne({
      'username': username, 
    }, function(err, user) {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false);
      }

      if (user.password != password) {
        return done(null, false);
      }

      return done(null, user);
    });
  });
}));

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  if(err){
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  } else {
    next();
  }
  
});
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


module.exports = app;
