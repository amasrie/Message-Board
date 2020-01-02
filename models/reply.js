/**
	This represents an answer to a thread.
	Note that thread_is is ommited because this is the thread subdocument
	@model replySchema
*/
module.exports = function(db){
	let replySchema = db.Schema({
		text: {
			type: String, 
			required: true
		},
		reported: {
			type: Boolean,
			default: false
		},
		delete_password: {
			type: String,
			required: true
		},
		created_on: {
			type: Date,
			default: Date.now
		}
	});
	return replySchema;
};