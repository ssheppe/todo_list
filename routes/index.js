var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test');
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', function (callback) {
	console.log("successfully connected");
});


var taskSchema = mongoose.Schema({
	description: String,
	created_date: { type: Date, default: Date.now },
	updated_date: { type: Date, default: Date.now },
	completed: { type: Boolean, default: false }
});

var Task = mongoose.model('Task', taskSchema);




/* GET home page. */
router.get('/', function(req, res, next) {
	Task.find({}, function (err, taskList){
		if (err) return console.error(err);
		console.log(taskList);
		res.render('index', { title: 'My fancy task list', taskList: taskList });
	})
  

});

router.post('/', function(req, res, next){
	console.log("BODY", req.body);
	var task = new Task({description: req.body.task});
	task.save(function(err){
		Task.find({}, function (err, taskList){
			res.render('index', { title: 'My fancy task list', taskList: taskList});
		});
	});
	
	
})

module.exports = router;
