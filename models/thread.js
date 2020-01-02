/**
	This represents a new thread on a board
	@model threadSchema
*/

module.exports = function(db, ObjectId){
	let replies = require('./reply')(db);
	let threadSchema = db.Schema({
		board: {
			type: ObjectId,
			ref: 'board_message',
			required: true
		},
		text: {
			type: String, 
			required: true
		},
		delete_password: {
			type: String,
			required: true
		},
		created_on: {
			type: Date,
			default: Date.now
		},
		bumped_on: {
			type: Date,
			default: Date.now
		},
		reported: {
			type: Boolean,
			default: false
		},
		replies: [replies]
	});
	return db.model('thread_message', threadSchema);
};