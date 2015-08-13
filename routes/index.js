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
	completed: { type: Boolean, default: false },
	deleted: {type: Boolean, default: false}
});

var Task = mongoose.model('Task', taskSchema);




/* GET home page. */
router.get('/', function(req, res, next) {
	Task.find({deleted: false}, function (err, taskList){
		if (err) return console.error(err);
		console.log(taskList);
		res.render('index', { title: 'My fancy task list', taskList: taskList });
	})
});

router.delete('/task/:id', function(req, res, next) {
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

router.put('/task/:id', function(req, res, next) {
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
