const mongoose = require('mongoose');
const express = require('express');
const session = require('express-session');
const socket=require('socket.io');
const bodyparser = require('body-parser');
const cookieParser = require('cookie-parser');
const Student = require('../models/student');

mongoose.Promise=global.Promise;
mongoose.connect('mongodb://localhost/test',{useNewUrlParser:true});
mongoose.connection.once('open',function(){
	console.log("established connection with database");
}).on('error',function(err){
	console.log("Error connecting to database");
});

const app = express();
app.set('view engine','ejs');
app.use(express.static('public'));
app.use(bodyparser.urlencoded({extended:false}));
app.use(cookieParser());
app.use(session({
    key: 'user_sid',
    secret: 'askjhsdkajfbajbldasjbsaf',
    resave: false,
    saveUninitialized: true
}));

const server = app.listen(4000,function(err) {
	if(err)
		console.log("error setting up server");
	else
		console.log("setup server at port 4000");
});

const sessAuthChecker = function(req,res,next){
	console.log('inside sessAuthChecker',req.session.user);
	if(req.session.user){
		next();
	}
	else{
		res.redirect('/');
	}
}

app.get('/',function(req,res){
	res.sendFile(__dirname+"/public/login.html");
});

app.post('/student/login',function(req,res){
	console.log("login request");
	Student.findOne({username: req.body.username, password: req.body.password}).then(function(result){
		//console.log(result);
		if(result){
			//console.log(result);
			req.session.user = {type: "student", id: result._id};
			res.render('home',{tasks_lists: result.tasks_lists, id: result._id});
		}
		else
			res.redirect('/');
	});
});

app.post('/student/signup',function(req,res){
	console.log("signup request");
	let student = new Student({
		username: req.body.email,
		password: req.body.password,
		first_name: req.body.first_name,
		last_name: req.body.last_name,
		roll_no: req.body.roll_no,
		tasks_lists: []
	});
	student.tasks_lists.push({list_name: "tasks-list", tasks: []});
	student.tasks_lists[0].tasks.push({task_name: "Task1"})
	student.save().then(function(){
		console.log("successfully signed up");
		res.render('home',{tasks_lists: student.tasks_lists, id: student._id})
	});
});

app.get('/signup',sessAuthChecker,function(req,res){
	console.log("hi",req.session.user);
	res.sendFile(__dirname+"/public/signup.html");
});

app.get('/logout',function(req,res){
	req.session.destroy();
	res.redirect('/');
});

app.get('/img_avatar.png',function(req,res){
	res.sendFile(__dirname+'/public/img_avatar.png');
});

app.get("/add_task_list",function(req,res){
	if(req.session.user){
		Student.findById(req.session.user.id).then(function(result){
			if(result){
				result.tasks_lists.push({list_name: req.query.list_name, tasks: []});
				result.save(function(){
					console.log("added tasks list for ",result.username);
				});	
				res.send("added new task list");
			}
			res.send(null);
		});
	}
	else
		res.send(null);
});

app.get('/add_quick_task',function(req,res){
	if(!req.session.user)
		res.send(null);
	else{
		Student.findById(req.session.user.id).then(function(result){
			if(!result)
				res.send(null);
			else{
				for(i=0;i<result.tasks_lists.length;i++){
					if(result.tasks_lists[i].list_name == req.query.list_name){
						result.tasks_lists[i].tasks = [{task_name: req.query.task_name}, ...result.tasks_lists[i].tasks]
						result.save(function(){
							console.log("added a quick-task");
						});
						res.send(String(result.tasks_lists[i].tasks[0]._id));
						break;
					}
				}
				if(i == result.tasks_lists.length)
					res.send("can't add task");
			}
		});
	}
});

app.get('/change_task_status',function(req,res){
	console.log(req.query);
	if(req.session.user){
		Student.findById(req.session.user.id).then(function(result){
			if(result){
				console.log("valid user");
				for(i=0;i<result.tasks_lists.length;i++){
					if(result.tasks_lists[i].list_name == req.query.list_name){
						console.log("found correct tasks-list");
						for(j=0;j<result.tasks_lists[i].tasks.length;j++){
							if(result.tasks_lists[i].tasks[j]._id == req.query.task_name){
								console.log("found exact match");
								result.tasks_lists[i].tasks[j].task_status = req.query.new_status;
								result.save(function(){
									console.log("changed status of task");
									res.send("changed status of task");
								});
							}
							break;
						}
						break;
					}
				}
				if(i == result.tasks_lists.length)
					res.send(null);
			}
			else
				res.send(null);
		});
	}
	else
		res.send(null);
});

const server_socket = socket(server);

server_socket.on('connection',function(client_socket){
	console.log('made socket connection with id',client_socket.id);
	client_socket.on('test',function(data){
		console.log("okayyy listening to you stupid")
	})
});