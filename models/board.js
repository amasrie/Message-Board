/**
	This represents a new board that will be filled with threads
	@model boardSchema
*/

module.exports = function(db){
	let boardSchema = db.Schema({
		name: {
			type: String, 
			required: true,
			unique: true
		}
	});
	return db.model('board_message', boardSchema);
};