const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
	// Check if username exists in users array
	return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
	// Check if username and password match
	return users.some(
		(user) => user.username === username && user.password === password
	);
};

//only registered users can login
regd_users.post("/login", (req, res) => {
	const {username, password} = req.body;

	if (!username || !password) {
		return res
			.status(404)
			.json({message: "Error logging in. Username and password are required."});
	}

	if (!isValid(username)) {
		return res.status(404).json({message: "Error logging in. User not found."});
	}

	if (!authenticatedUser(username, password)) {
		return res
			.status(404)
			.json({message: "Error logging in. Invalid credentials."});
	}

	// Create JWT token
	const token = jwt.sign({username: username}, "your-secret-key", {
		expiresIn: "1h",
	});

	// Store token in session
	req.session.authorization = {accessToken: token};

	return res
		.status(200)
		.json({message: "User successfully logged in", token: token});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
	const {isbn} = req.params;
	const {review} = req.query;
	const {authorization} = req.headers;

	if (!authorization || !authorization.startsWith("Bearer ")) {
		return res.status(401).json({message: "No token provided"});
	}

	// Extract the token
	const token = authorization.split(" ")[1];

	try {
		// Verify the token
		const decoded = jwt.verify(token, "your-secret-key");
		const {username} = decoded;

		// Check if book exists
		if (!books[isbn]) {
			return res.status(404).json({message: "Book not found"});
		}

		// Check if review is provided
		if (!review) {
			return res.status(400).json({message: "Review is required"});
		}

		// Add or modify review
		books[isbn].reviews[username] = review;

		return res.status(200).json({
			message: "Review added/modified successfully",
			reviews: books[isbn].reviews,
		});
	} catch (err) {
		return res.status(401).json({message: "Invalid token"});
	}
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
	const {isbn} = req.params;
	const {authorization} = req.headers;

	if (!authorization || !authorization.startsWith("Bearer ")) {
		return res.status(401).json({message: "No token provided"});
	}

	// Extract the token
	const token = authorization.split(" ")[1];

	try {
		// Verify the token
		const decoded = jwt.verify(token, "your-secret-key");
		const {username} = decoded;

		// Check if book exists
		if (!books[isbn]) {
			return res.status(404).json({message: "Book not found"});
		}

		// Check if user has a review for this book
		if (!books[isbn].reviews[username]) {
			return res.status(404).json({message: "No review found for this book"});
		}

		// Delete the user's review
		delete books[isbn].reviews[username];

		return res.status(200).json({
			message: "Review deleted successfully",
			reviews: books[isbn].reviews,
		});
	} catch (err) {
		return res.status(401).json({message: "Invalid token"});
	}
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
