/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

let chaiHttp = require('chai-http');
let chai = require('chai');
let assert = chai.assert;
let server = require('../server');
let deleteThreadId, reportThreadId, postReplyThreadId, reportReplyId, deleteReplyId;
const FAKE_ID = "eeeeeeeeeeeeeeeeeeeeeeee";
const WRONG_PASS = "111";
const RIGHT_PASS = "123";

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {

        test('Create a thread with incomplete data', function(done) {
            chai.request(server)
                .post('/api/threads/test_board')
                .send({})
                .end(function(err, res){
                    assert.equal(res.status, 412);
                    assert.isNotNull(err);
                    done();
                });
        });

        test('Create a thread', function(done) {
            chai.request(server)
                .post('/api/threads/test_board')
                .send({delete_password: '123', text: 'my new board'})
                .end(function(err, res){
                    assert.equal(res.status, 200);
                    assert.isNull(err);
                    done();
                });
        });
      
    });
    
    suite('GET', function() {

        test('Obtain the last threads', function(done) {
            chai.request(server)
                .get('/api/threads/test_board')
                .end(function(err, res){
                    assert.equal(res.status, 200);
                    assert.isNull(err);
                    assert.isAtMost(res.body.length, 10);
                    assert.isAtMost(res.body[0].replies.length, 3);
                    assert.notProperty(res.body[0], "delete_password");
                    assert.notProperty(res.body[0], "reported");
                    assert.property(res.body[0], "_id");
                    assert.property(res.body[0], "replies");
                    assert.property(res.body[0], "created_on");
                    assert.property(res.body[0], "bumped_on");
                    assert.property(res.body[0], "board");
                    assert.property(res.body[0], "text");

                    deleteThreadId = res.body[5]._id;
                    reportThreadId = res.body[6]._id;
                    postReplyThreadId = res.body[1]._id;
                    reportReplyId = res.body[1].replies[0]._id;
                    deleteReplyId = res.body[1].replies[1]._id;
                    done();
                });
        });
      
    });
    
    suite('DELETE', function() {

        test('Wrong password', function(done) {
            chai.request(server)
                .delete('/api/threads/test_board')
                .send({thread_id: deleteThreadId, delete_password: WRONG_PASS})
                .end(function(err, res){
                    assert.isNull(err);
                    assert.equal(res.text, "incorrect password");
                    done();
                });
        });

        test('No thread ID', function(done) {
            chai.request(server)
                .delete('/api/threads/test_board')
                .send({delete_password: WRONG_PASS})
                .end(function(err, res){
                    assert.equal(res.status, 412);
                    assert.isNotNull(err);
                    done();
                });

        });

        test('Thread that does not exists or already deleted', function(done) {
            chai.request(server)
                .delete('/api/threads/test_board')
                .send({thread_id: FAKE_ID, delete_password: WRONG_PASS})
                .end(function(err, res){
                    assert.equal(res.status, 404);
                    assert.isNotNull(err);
                    done();
                });
        });

        test('Delete existing thread', function(done) {
            chai.request(server)
                .delete('/api/threads/test_board')
                .send({thread_id: deleteThreadId, delete_password: RIGHT_PASS})
                .end(function(err, res){
                    assert.equal(res.status, 200);
                    assert.isNull(err);
                    assert.equal(res.text, "success");
                    done();
                });
        });
      
    });
    
    suite('PUT', function() {

        test('Thread that does not exists', function(done) {
            chai.request(server)
                .put('/api/threads/test_board')
                .send({thread_id: FAKE_ID})
                .end(function(err, res){
                    assert.equal(res.status, 404);
                    assert.isNotNull(err);
                    done();
                });
        });

        test('No thread ID', function(done) {
            chai.request(server)
                .put('/api/threads/test_board')
                .send({})
                .end(function(err, res){
                    assert.equal(res.status, 412);
                    assert.isNotNull(err);
                    done();
                });
        });

        test('Report existing thread', function(done) {
            chai.request(server)
                .put('/api/threads/test_board')
                .send({thread_id: reportThreadId})
                .end(function(err, res){
                    assert.equal(res.status, 200);
                    assert.isNull(err);
                    assert.equal(res.text, "success");
                    done();
                });
        });

        test('Thread already reported', function(done) {
            chai.request(server)
                .put('/api/threads/test_board')
                .send({thread_id: reportThreadId})
                .end(function(err, res){
                    assert.equal(res.status, 200);
                    assert.equal(res.text, "success");
                    assert.isNull(err);
                    done();
                });
        });
      
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {

        test('Board that does not exists', function(done) {
            chai.request(server)
                .post('/api/replies/test_board_unexisting')
                .send({thread_id: postReplyThreadId, text: "this is a reply", delete_password: RIGHT_PASS})
                .end(function(err, res){
                    assert.equal(res.status, 412);
                    assert.isNotNull(err);
                    done();
                });
        });

        test('Thread that does not exists', function(done) {
            chai.request(server)
                .post('/api/replies/test_board')
                .send({thread_id: FAKE_ID, text: "this is a reply", delete_password: RIGHT_PASS})
                .end(function(err, res){
                    assert.equal(res.status, 404);
                    assert.isNotNull(err);
                    done();
                });
        });

        test('create a new reply with incomplete data', function(done) {
            chai.request(server)
                .post('/api/replies/test_board')
                .send({thread_id: postReplyThreadId})
                .end(function(err, res){
                    assert.equal(res.status, 412);
                    assert.isNotNull(err);
                    done();
                });
        });

        test('create a new reply correctly', function(done) {
            chai.request(server)
                .post('/api/replies/test_board')
                .send({thread_id: postReplyThreadId, text: "this is a reply", delete_password: RIGHT_PASS})
                .end(function(err, res){
                    assert.equal(res.status, 200);
                    assert.isNull(err);
                    done();
                });
        });
      
    });
    
    suite('GET', function() {

        test('Thread that does not exists', function(done) {
            chai.request(server)
                .get('/api/replies/test_board')
                .query({thread_id: FAKE_ID, reply_id: reportReplyId})
                .end(function(err, res){
                    assert.equal(res.status, 404);
                    assert.isNotNull(err);
                    done();
                });
        });

        test('Get thread information', function(done) {
            chai.request(server)
                .get('/api/replies/test_board')
                .query({thread_id: postReplyThreadId, reply_id: reportReplyId})
                .end(function(err, res){
                    assert.equal(res.status, 200);
                    assert.isNull(err);
                    assert.notProperty(res.body, "delete_password");
                    assert.notProperty(res.body, "reported");
                    assert.property(res.body, "_id");
                    assert.property(res.body, "created_on");
                    assert.property(res.body, "text");
                    done();
                });
        });
      
    });
    
    suite('PUT', function() {

        test('Missing fields', function(done) {
            chai.request(server)
                .put('/api/replies/test_board')
                .send({thread_id: postReplyThreadId})
                .end(function(err, res){
                    assert.equal(res.status, 412);
                    assert.isNotNull(err);
                    done();
                });
        });

        test('Thread that does not exists', function(done) {
            chai.request(server)
                .put('/api/replies/test_board')
                .send({thread_id: FAKE_ID, reply_id: reportReplyId})
                .end(function(err, res){
                    assert.equal(res.status, 404);
                    assert.isNotNull(err);
                    done();
                });
        });

        test('Reply that does not exists', function(done) {
            chai.request(server)
                .put('/api/replies/test_board')
                .send({thread_id: postReplyThreadId, reply_id: FAKE_ID})
                .end(function(err, res){
                    assert.equal(res.status, 404);
                    assert.isNotNull(err);
                    done();
                });
        });

        test('Report a reply', function(done) {
            chai.request(server)
                .put('/api/replies/test_board')
                .send({thread_id: postReplyThreadId, reply_id: reportReplyId})
                .end(function(err, res){
                    assert.equal(res.status, 200);
                    assert.isNull(err);
                    assert.equal(res.text, "success");
                    done();
                });
        });

        test('Report an already reported reply', function(done) {
            chai.request(server)
                .put('/api/replies/test_board')
                .send({thread_id: postReplyThreadId, reply_id: reportReplyId})
                .end(function(err, res){
                    assert.equal(res.status, 200);
                    assert.isNull(err);
                    assert.equal(res.text, "success");
                    done();
                });
        });
      
    });
    
    suite('DELETE', function() {

        test('Missing fields', function(done) {
            chai.request(server)
                .delete('/api/replies/test_board')
                .send({thread_id: postReplyThreadId})
                .end(function(err, res){
                    assert.equal(res.status, 412);
                    assert.isNotNull(err);
                    done();
                });

        });

        test('Thread that does not exists', function(done) {
            chai.request(server)
                .delete('/api/replies/test_board')
                .send({thread_id: FAKE_ID, reply_id: deleteReplyId, delete_password: RIGHT_PASS})
                .end(function(err, res){
                    assert.equal(res.status, 404);
                    assert.isNotNull(err);
                    done();
                });
        });

        test('Reply that does not exists', function(done) {
            chai.request(server)
                .delete('/api/replies/test_board')
                .send({thread_id: postReplyThreadId, reply_id: FAKE_ID, delete_password: RIGHT_PASS})
                .end(function(err, res){
                    assert.equal(res.status, 404);
                    assert.isNotNull(err);
                    done();
                });
        });

        test('Wrong password', function(done) {
            chai.request(server)
                .delete('/api/replies/test_board')
                .send({thread_id: postReplyThreadId, reply_id: deleteReplyId, delete_password: WRONG_PASS})
                .end(function(err, res){
                    assert.isNull(err);
                    assert.equal(res.text, "incorrect password");
                    done();
                });
        });

        test('Delete existing reply', function(done) {
            chai.request(server)
                .delete('/api/replies/test_board')
                .send({thread_id: postReplyThreadId, reply_id: deleteReplyId, delete_password: RIGHT_PASS})
                .end(function(err, res){
                    assert.equal(res.status, 200);
                    assert.isNull(err);
                    assert.equal(res.text, "success");
                    done();
                });
        });
      
    });
    
  });

});
