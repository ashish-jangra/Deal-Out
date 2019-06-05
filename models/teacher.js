const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
	sender: String,
	msg: String
},{timestamps: true})

const AssignmentSchema = new Schema({
	name: String,
	assigned_to: String,
	status: {type: String, default: "incomplete"},
	messages: [MessageSchema]
},{timestamps: true})


const SectionSchema = new Schema({
	name: String,
	year: String,
	programme: String
})

const TeacherSchema = new Schema({
	username: String,
	password: String,
	sections: [SectionSchema],
	department: String,
	first_name: String,
	last_name: String
});

const Teacher = mongoose.model('teacher',TeacherSchema);

module.exports = Teacher;