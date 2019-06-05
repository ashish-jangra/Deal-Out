const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
	sender: String,
	msg: String
},{timestamps: true})

const Tasks = new Schema({
	task_list:{type: String, default: ""},
	task_name: {type: String, default: ""},
	task_description: {type: String, default: ""},
	task_due_date: {type: String, default: ""},
	task_due_time: {type: String, default: ""},
	task_status: {type: String, default: "incomplete"},
	//createdAt,updatedAt available bcoz of timestamps: true
},{timestamps: true});

const TaskList = new Schema({
	list_name: String,
	tasks: {type: [Tasks], default: []}
});

const StudentSchema = new Schema({
	username: String,
	password: String,
	first_name: String,
	last_name: String,
	roll_no: String,
	programme: String,
	year: String,
	section: String,
	tasks_lists: {type: [TaskList], default:[{list_name: "Assignments", tasks:[]}, {list_name: "Tasks", tasks:[]}]}
});

const Student = mongoose.model('student',StudentSchema);

module.exports = Student;