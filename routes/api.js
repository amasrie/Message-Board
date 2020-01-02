/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

let expect = require('chai').expect;
let ObjectId = require('mongodb').ObjectID;
let mongoose = require("mongoose");
let Schema = mongoose.Schema;

const CONNECTION_STRING = process.env.DB; 

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

module.exports = function (app) {

	//create mongo connection
	mongoose.connect(process.env.DB,
	  { useNewUrlParser: true, useUnifiedTopology: true }
	);

	//import controllers
	let boardController = require('../controllers/boardController')(mongoose);
	let threadController = require('../controllers/threadController')(mongoose, ObjectId);
  
	app.route('/api/threads/:board')
		.post((req, res) => {
			let board = req.params.board;
			req.body.board = board;
			//check if board exists
			boardController.findBoardByName(res, board, (match) =>{
				if(!match || match.length == 0){
					//create a new board
					boardController.createBoard(res, board, newBoard => {
						//create a new thread
						req.body.board_id = newBoard._id;
						threadController.createThread(res, req.body);
					})

				}else{
					//use the already created board and create a thread
					req.body.board_id = match[0]._id;
					threadController.createThread(res, req.body);
				}
			})
		})
		.get((req, res) => {
			threadController.findRecentThreads(res);
		})
		.delete((req, res) => {
			threadController.validatePassword(res, req.body, false, _ => {
				threadController.deleteThread(res, req.body.thread_id);
			});
		})
		.put((req, res) => {
			threadController.reportThread(res, req.body.thread_id);
		});
    
	app.route('/api/replies/:board')
		.post((req, res) => {
			let board = req.params.board;
			//check if board exists
			boardController.findBoardByName(res, board, (match) =>{
				if(!match || match.length == 0){
					res.status(412).send("Can't reply to a board that doesn't exists");
				}else{
					req.body.board = match[0].name;
					let threadId = req.body.thread_id;
					//check if thread exists
					threadController.findThread(res, threadId, false, thread => {
						//create reply
						req.body.thread = thread;
						threadController.addReply(res, req.body);
					})
				}
			});
		})
		.get((req, res) => {
			let threadId = req.query.thread_id;
			threadController.findThread(res, threadId, false, thread => {
				res.send(thread);
			});
		})
		.delete((req, res) => {
			threadController.validatePassword(res, req.body, true, thread => {
				req.body.thread = thread;
				threadController.deleteReply(res, req.body);
			});
		})
		.put((req, res) => {
			threadController.reportReply(res, req.body.thread_id, req.body.reply_id);
		});

};
