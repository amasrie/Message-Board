/**
	Class that applies all the logic about boards
	@class BoardController
*/
class BoardController{


	/**
		Class constructor that initilize the model
		@constructor
		@param {any} mongoose Instnace of mongoose
	*/
	constructor(mongoose){
		/**
			MongoDB's boards model representation
			@property {any} boardModel
		*/
		this.boardModel = require('../models/board')(mongoose);
	}

	/**
		Method that finds a board by name
		@method findBoardByName
		@param {any} res Endpoint response
		@param {string} name Name of the board to search
		@param {any} cb Callback function
	*/
	findBoardByName(res, name, cb){
		if(!name){
			res.status(412).send("Please include the name of the board to find");
		}else{
			this.boardModel.find({name: name}, (err, match) => {
				if(err){
					res.status(500).send("An error occured while trying to find a board");
				}else{
					cb(match);
				}
			});
		}
	}

	/**
		Method that creates a new board
		@method createBoard
		@param {any} res Endpoint response
		@param {string} name Name of the board to create
		@param {any} cb Callback function
	*/
	createBoard(res, name, cb){
		if(!name){
			res.status(412).send("Please include the name of the board to create");
		}else{
			let newBoard = new this.boardModel({
				name: name
			});
			newBoard.save(err => {
				if(err){
					res.status(500).send("An error occured while trying to create a board");
				}else{
					cb(newBoard);
				}
			});
		}
	}

}

module.exports = function(mongoose){
	return new BoardController(mongoose);
};