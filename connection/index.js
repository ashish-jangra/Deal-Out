const mongoose = require('mongoose');
const express = require('express');
const session = require('express-session');
const socket=require('socket.io');
const bodyparser = require('body-parser');
const cookieParser = require('cookie-parser');
const Student = require('../models/student');
const Teacher = require('../models/teacher');

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

const port = process.env.PORT || 4000;

const server = app.listen(port,function(err) {
	if(err)
		console.log("error setting up server");
	else
		console.log("setup server at port 4000");
});

// app.use(function(req,res){
// 	if(!req.session && req.cookies){
// 		req.clearCookies();
// 	}
// });

function studentSessAuthChecker(req,res,next){
	if(!req.session.user || req.session.user.type != "student")
		res.redirect('/');
	else
		next();
}

function teacherSessAuthChecker(req,res,next){
	if(!req.session.user || req.session.user.type != "teacher")
		res.redirect('/teacher-login');
	else
		next();
}

app.get('/teacher-login',function(req,res){
	res.sendFile(__dirname+'/public/teacher-login.html')
})

//app.use(sessAuthChecker);

app.get('/',function(req,res){
	if(req.session.user){
		if(req.session.user.type == "student"){
			console.log("student");
			res.redirect('/student/home');
		}
		else if(req.session.user.type == "teacher"){
			console.log("teacher");
			res.redirect('/teacher/home');
		}
	}
	else{
		console.log("let's begin");
		res.sendFile(__dirname+"/public/login.html");
	}
});

app.get('/update_account',studentSessAuthChecker,function(req,res){
	Student.findById(req.session.user.id).then(function(result){
		if(result){
			res.render('update_account',result);
		}
		else{
			res.redirect('/');
		}
	});
});

app.post('/update_account', studentSessAuthChecker,function(req,res){
	Student.findById(req.session.user.id).then(function(result){
		if(result){
			result.programme = req.body.programme;
			result.year = req.body.year;
			result.section = req.body.section;
			result.save(function(){
				console.log("successful update_account");
			});
		}
		else{
			console.log("can't update_account for",req.session.user.id);
		}
	});
	res.redirect('/student/home');
});

app.get('/student/home',function(req,res){
	if(!req.session.user){
		console.log("no session");
		res.redirect('/');
	}
	else if(req.session.user.type != "student"){
		res.redirect("/");
	}
	else{
		Student.findById(req.session.user.id).then(function(result){
			//console.log("result",result);
			if(result){
				res.render('student_home',{tasks_lists: result.tasks_lists, roll_no: result.roll_no, first_name: result.first_name, last_name: result.last_name, email: result.username});
			}
			else{
				console.log("invalid id",req.session.user.id);
				res.redirect("/");
			}
		})
	}
});

app.post('/student/login',function(req,res){
	console.log("login request");
	Student.findOne({username: req.body.username, password: req.body.password}).then(function(result){
		//console.log(result);
		if(result){
			//console.log(result);
			req.session.user = {type: "student", id: result._id};
			//console.log("task id: ",result.tasks_lists[0].tasks[0]._id);
			res.redirect('/student/home');
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
		section: req.body.section
	});
	//student.tasks_lists.push({list_name: "Tasks", tasks: []});
	//student.tasks_lists[0].tasks.push({task_name: "Task1"})
	student.save().then(function(){
		console.log("successfully signed up");
		req.session.user = {type: "student", id: student._id};
		res.redirect('/student/home');
	});
});

app.post('/teacher/signup',function(req,res){
	console.log("teacher signup request");
	Teacher.findOne({username: req.body.email}).then(function(result){
		if(result){
			console.log("Teacher already exists");
			res.redirect("/");
		}
		else{
			let teacher = new Teacher({
				username: req.body.email,
				password: req.body.password,
				first_name: req.body.first_name,
				last_name: req.body.last_name,
				department: req.body.department
			});
			teacher.save(function(){
				console.log("signed up teacher");
				req.session.user = {type: "teacher", id: teacher._id};
				res.redirect('/teacher/home');
			});
		}
	})
})

app.post('/teacher/login',function(req,res){
	Teacher.findOne({username: req.body.username, password: req.body.password}).then(function(result){
		if(result){
			req.session.user = {type: "teacher", id: result._id};
			res.redirect('/teacher/home');
		}
		else{
			console.log("invalid teacher login credentials");
			res.redirect('/teacher-login');
		}
	});
});

app.get('/teacher_avatar',function(req,res){
	res.sendFile(__dirname+"/public/teacher_avatar.jpg");
});

app.get('/teacher/home',teacherSessAuthChecker,function(req,res){
	Teacher.findById(req.session.user.id).then(function(result){
		if(result){
			res.render('teacher_home',{sections: result.sections, email: result.username, first_name: result.first_name, last_name: result.last_name});	
		}
		else{
			res.redirect('/');
		}
	});
});

app.get('/signup',function(req,res){
	console.log("hi",req.session.user);
	res.sendFile(__dirname+"/public/signup.html");
});

app.get('/teacher-signup',function(req,res){
	//console.log("hi",req.session.user);
	res.sendFile(__dirname+"/public/teacher_signup.html");
});

app.get('/logout',function(req,res){
	console.log("logout ",req.session.user.username);
	req.session.destroy();
	res.redirect('/');
});

app.get('/student/img_avatar.png',function(req,res){
	res.sendFile(__dirname+'/public/img_avatar.png');
});

app.get('/getlist',function(req,res){
	if(req.session){
		if(req.session.user.type == "teacher"){
			//console.log("got a request from teacher");
			Student.find({programme: req.query.programme, year: req.query.year, section: req.query.section}).then(function(result){
				//console.log("query done",result);
				responseArray = [];
				for(i=0;i<result.length;i++){
					item = {roll_no: result[i].roll_no, first_name: result[i].first_name, last_name: result[i].last_name};
					responseArray.push(item);
				}
				//console.log("sending response",responseArray);
				res.send(responseArray);
			});
		}
		else
			res.send("invalid user type")
	}
	else
		res.send("invalid session");
});

app.get("/add_section",function(req,res){
	if(req.session){
		if(req.session.user.type == "teacher"){
			Teacher.findById(req.session.user.id).then(function(result){
				console.log(req.session.user.id);
				let new_section = {
					programme: req.query.programme,
					year: req.query.year,
					name: req.query.section
				};
				console.log("add section request",new_section);
				result.sections = [new_section, ...result.sections];
				result.save(function(){
					console.log("added section",result.sections[0]);
					res.send("added section");
				});
			});
		}
		else{
			res.send("invalid user type")
		}
	}
	else{
		res.send("invalid section");
	}
});

app.get("/add_task_list",function(req,res){
	if(req.session.user){
		console.log("add task request from student");
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
						console.log("add quick task",req.query.task_name);
						let new_quick_task = {
							task_name: req.query.task_name,
							list_name: req.query.list_name,
							task_description: "",
							task_due_date: "",
							task_due_time: "",
						}
						result.tasks_lists[i].tasks = [new_quick_task, ...result.tasks_lists[i].tasks]
						result.save(function(){
							console.log("added a quick-task",result.tasks_lists[i].tasks);
							res.send(String(result.tasks_lists[i].tasks[0]._id));
						});
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
	console.log("change_task_status",req.query);
	if(req.session.user){
		Student.findById(req.session.user.id).then(function(result){
			if(result){
				//console.log("valid user");
				for(i=0;i<result.tasks_lists.length;i++){
					if(result.tasks_lists[i].list_name == req.query.list_name){
						//console.log("found correct tasks-list");
						for(j=0;j<result.tasks_lists[i].tasks.length;j++){
							//console.log("compare",req.query.task_name,result.tasks_lists[i].tasks[j]._id);
							if(result.tasks_lists[i].tasks[j]._id == req.query.task_name){
								//console.log("found exact match");
								result.tasks_lists[i].tasks[j].task_status = req.query.new_status;
								result.save(function(){
									console.log("changed status of task");
									res.send("changed status of task");
								});
								break;
							}
						}
						break;
					}
				}
				if(i == result.tasks_lists.length)
					res.send("no such task list");
			}
			else
				res.send("invalid user id");
		});
	}
	else
		res.send("invalid session");
});

app.get('/update_task',function(req,res){
	if(req.session){
		console.log(req.query.task_name);
		if(req.session.user){
			Student.findById(req.session.user.id).then(function(result){
				if(result){
					for(i=0;i<result.tasks_lists.length;i++){
						if(result.tasks_lists[i].list_name == req.query.task_list){
							//console.log("found correct updation list");
							for(j=0;j<result.tasks_lists[i].tasks.length;j++){
								//console.log("matching",req.query.task_id,"==",result.tasks_lists[i].tasks[j]._id)
								if(result.tasks_lists[i].tasks[j]._id == req.query.task_id){
									//console.log("found task to update");
									console.log("query",req.query);
									result.tasks_lists[i].tasks[j].task_name=req.query.task_name;
									result.tasks_lists[i].tasks[j].task_description=req.query.task_description;
									result.tasks_lists[i].tasks[j].task_due_date=req.query.task_due_date;
									result.tasks_lists[i].tasks[j].task_due_time=req.query.task_due_time;
									result.save(function(){
										console.log("updated task",result.tasks_lists[i].tasks[j]);
										res.send("updated task");
									})
									break;
								}
							}
							break;
						}
					}
					if(i==result.tasks_lists.length)
						res.send("can't find such a task");
				}
				else{
					res.send("invalid user id");
				}
			});
		}
		else
			res.send("No valid user");
	}
	else
		res.send("No session");
})

app.get('/add_task',function(req,res){
	if(req.session){
		if(req.session.user.type == 'student'){
			//console.log("user type student");
			Student.findById(req.session.user.id).then(function(result){
				if(result){
					for(i=0;i<result.tasks_lists.length;i++){
						if(result.tasks_lists[i].list_name == req.query.task_list){
							new_task = {task_name:req.query.task_name, task_list:req.query.task_list, task_description:req.query.task_description, task_due_date: req.query.task_due_date, task_due_time: req.query.task_due_time };
							result.tasks_lists[i].tasks = [new_task, ...result.tasks_lists[i].tasks]
							result.save(function(){
								res.send(result.tasks_lists[i].tasks[0]._id);
							});
							break;
						}
					}
					if(i==result.tasks_lists.length)
						res.send("invalid task list");
				}
				else
					res.send("No valid user");
			});
		}
		else
			res.send("invalid user type")
	}
	else
		res.send("No valid session");
});

const server_socket = socket(server);
connections = {};

server_socket.on('connection',function(client_socket){
	console.log('made socket connection with id',client_socket.id);
	client_socket.on('test',function(data){
		console.log("test from",client_socket.id);
		connections[data.roll_no] = client_socket.id;
		//console.log("list of all connections",server_socket.sockets.clients());
	});
	client_socket.on('assign_task',function(data){
		console.log("add_assignment to",data.roll_no);
		Student.findOne({roll_no: data.roll_no}).then(function(result){
			console.log("student name",result.first_name);
			for(i=0;i<result.tasks_lists.length;i++){
				console.log("checking Assignments list",result.tasks_lists[i].list_name);
				if(result.tasks_lists[i].list_name == "Assignments"){
					new_assignment = {
						task_list: "Assignments",
						task_name: data.task_name,
						task_description: data.task_description,
						task_due_date: data.task_due_date,
						task_due_time: data.task_due_time
					};
					console.log("safe check");
					result.tasks_lists[i].tasks = [new_assignment, ...result.tasks_lists[i].tasks];
					result.save(function(){
						data.id = JSON.stringify(result.tasks_lists[i].tasks[0]._id);
						server_socket.to(`${connections[data.roll_no]}`).emit('add_assignment',data);
					});
					break;
				}
			}
		});
	})
});