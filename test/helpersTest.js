const { assert } = require('chai');

const { getUserByID, getUserByEmail, userIdFromEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    longURL: "http://www.lighthouselabs.ca",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    longURL: "http://www.google.com",
    password: "dishwasher-funk"
  }
};

describe('userIdFromEmail', function() {
  it('should return user id', function() {
    const user = userIdFromEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID);
  });
});

describe('getUserByID', function() {
  it('should return user id', function() {
    const user = getUserByID("userRandomID", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });
});


describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });
  it('should not return a user with invalid email', function() {
    const user = getUserByEmail("user1@example.com", testUsers);
    assert.equal(user, false);
  });
});