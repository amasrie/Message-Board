/**
	Class that applies all the logic about threads
	@class ThreadController
*/
class ThreadController{


	/**
		Class constructor that initilize the model
		@constructor
		@param {any} mongoose Instnace of mongoose
		@param {number} ObjectId Constant that represent the Object type in Mongo

	*/
	constructor(mongoose, ObjectId){
		/**
			MongoDB's thread model representation
			@property {any} threadModel
		*/
		this.threadModel = require('../models/thread')(mongoose, ObjectId);
	}

	/**
		Method that finds a thread by id
		@method findThread
		@param {any} res Endpoint response
		@param {string} id Id of the thread to search
		@param {boolean} full Indicates it the document must have every field
		@param {any} cb Callback function
	*/
	findThread(res, id, full, cb){
		if(!id){
			res.status(412).send("Please include the id of the thread to find");
		}else{
			let json = full ? {} : {reported: 0, delete_password: 0};
			this.threadModel.findById(id, json, (err, match) => {
				if(err){
					res.status(500).send("An error occured while trying to find a thread");
				}else if(!match){
					res.status(404).send("Thread not found");
				}else{
					cb(match);
				}
			});
		}
	}

	/**
		Method that gets a list of the most recent threads
		@method findRecentThreads
		@param {any} res Endpoint response
	*/
	findRecentThreads(res){
		//using unshift, is not necesary to sort
		//note that there's no story that requests to update the bumped_on field of replies
		let find = this.threadModel.find({}, 
			{
				replies: { 
					$slice: 3 
				}, 
				reported: 0, 
				delete_password: 0
			}).sort({bumped_on: -1}).limit(10);
		find.exec((err, match) => {
			if(err){
				res.status(500).send("An error occured while trying to find the most recent threads");
			}else{
				res.send(match);
			}
		});
	}

	/**
		Method that creates a new thread
		@method createThread
		@param {any} res Endpoint response
		@param {any} body JSON with the parameters to create the document
	*/
	createThread(res, body){
		let {board, text, delete_password, board_id} = body;
		if(!board || !board_id || ! text || !delete_password){
			res.status(412).send("Missing data needed to create the thread");
		}else{
			let newThread = new this.threadModel({
				board: board_id,
				text: text,
				delete_password: delete_password
			});
			newThread.save(err => {
				if(err){
					res.status(500).send("An error occured while trying to create a thread");
				}else{
					res.redirect("/b/" + board);
				}
			});
		}
	}

	/**
		Method that adds a new reply to the thread
		@method addReply
		@param {any} res Endpoint response
		@param {any} body JSON with the parameters need to create the reply
	*/
	addReply(res, body){
		let {text, delete_password, thread, board} = body;
		if(!text || !delete_password || !thread || !board){
			res.status(412).send("Missing data needed to create the reply");
		}else{
			//push the new document
			thread.replies.unshift({
				text: text,
				delete_password: delete_password
			});
			//update bumped_on date and save changes
			thread.bumped_on = (new Date()).toString();
			thread.save(err =>{
				if(err){
					res.status(500).send("An error occured while trying to add a reply to a thread");
				}else{
					res.redirect("/b/" + board + "/" + thread._id);
				}
			});
		}
	}

	/**
		Method that completely deletes a thread
		@method deleteThread
		@param {any} res Endpoint response
		@param {string} id Id of the thread to delete
	*/
	deleteThread(res, id){
		this.threadModel.findByIdAndRemove(id, err => {
			if(err){
				res.status(500).send("an error occured while trying to remove a thread");
			}else{
				res.send("success");
			}
		})
	}

	/**
		Method that verifies if input password matches with the thread's or reply's
		@method validatePassword
		@param {any} res Endpoint response
		@param {any} body JSON with the parameters to create the document
		@param {boolean} isReply Validates if the function is called to compare the passwrod of a reply or a thread
		@param {any} cb Callback function
	*/
	validatePassword(res, body, isReply, cb){
		let {thread_id, delete_password} = body;
		//find thread
		this.findThread(res, thread_id, true, thread => {
			let comparison = thread.delete_password;
			let statusSend = false;
			if(isReply){
				if(!body.reply_id){
					statusSend = true;
					res.status(412).send("It's not possible to delete a reply without their id");
				}else{
					let foundReply = thread.replies.id(body.reply_id);
					if(!foundReply){
						statusSend = true;
						res.status(404).send("Reply not found");
					}else{
						comparison = foundReply.delete_password;
					}
				}
			}
			//if already send, ignore
			if(!statusSend){
				if(comparison == delete_password){
					cb(thread);
				}else{
					res.send("incorrect password");
				}
			}
		});
	}

	/**
		Method that deletes a reply
		@method deleteReply
		@param {any} res Endpoint response
		@param {any} body JSON with the parameters to create the document
	*/
	deleteReply(res, body){
		let {reply_id, thread} = body;
		if(!reply_id || !thread){
			res.status(412).send("Missing data needed to delete the reply");
		}else{
			//get the subdocument
			let newReply = thread.replies.id(reply_id);
			if(!newReply){
				res.status(404).send("the requested reply was not found on the thread");
			}else{
				newReply.text = "[deleted]";
				thread.save(err => {
					if(err){
						res.status(500).send("An error occured while trying to delete a reply");
					}else{
						res.send("success");
					}
				});
			}
		}
	}

	/**
		Method that updates a thread as reported
		@method reportThread
		@param {any} res Endpoint response
		@param {string} thread_id Id of the thread to report
	*/
	reportThread(res, thread_id){
		if(!thread_id){
			res.status(412).send("Missing data needed to update the thread");
		}else{
			//get the thread update their reported status to true
			this.threadModel.findByIdAndUpdate(thread_id, {reported: true}, (err, newThread) => {
				if(err){
					res.status(500).send("An error occured while trying to report a thread");
				}else if(!newThread){
					res.status(404).send("The thread could not be reported");
				}else{
					res.send("success");
				}
			})
		}
	}

	/**
		Method that updates a reply as reported
		@method reportReply
		@param {any} res Endpoint response
		@param {string} thread_id Id of the thread that contains the reply
		@param {string} reply_id Id of the reply to report
	*/
	reportReply(res, thread_id, reply_id){
		if(!thread_id || !reply_id){
			res.status(412).send("Missing data needed to update the reply");
		}else{
			//get the thread with their id
			this.findThread(res, thread_id, false, thread =>{
				//get the reply
				let newReply = thread.replies.id(reply_id);
				if(!newReply){
					res.status(404).send("the requested reply was not found on the thread");
				}else{
					newReply.reported = true;
					thread.save(err => {
						if(err){
							res.status(500).send("An error occured while trying to report a reply");
						}else{
							res.send("success");
						}
					});
				}
			});
		}
	}

}

module.exports = function(mongoose, ObjectId){
	return new ThreadController(mongoose, ObjectId);
};