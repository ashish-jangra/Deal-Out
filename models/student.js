const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Tasks = new Schema({
	task_name: String,
	task_description: String,
	task_due_date: Date
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
	tasks_lists: {type: [TaskList]},
});

const Student = mongoose.model('student',StudentSchema);

module.exports = Student;