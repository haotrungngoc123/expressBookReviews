const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
	const {username, password} = req.body;

	// Check if username and password are provided
	if (!username || !password) {
		return res
			.status(400)
			.json({message: "Username and password are required"});
	}

	// Check if username already exists
	if (users.find((user) => user.username === username)) {
		return res.status(400).json({message: "Username already exists"});
	}

	// Add new user
	users.push({username, password});
	return res.status(200).json({message: "User successfully registered"});
});

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
	try {
		const response = await axios.get("http://localhost:5000/");
		return res.status(200).json(response.data);
	} catch (error) {
		return res
			.status(500)
			.json({message: "Error fetching books", error: error.message});
	}
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
	const {isbn} = req.params;
	try {
		const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
		return res.status(200).json(response.data);
	} catch (error) {
		return res
			.status(404)
			.json({message: "Book not found", error: error.message});
	}
});

// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
	const {author} = req.params;
	try {
		const response = await axios.get(`http://localhost:5000/author/${author}`);
		return res.status(200).json(response.data);
	} catch (error) {
		return res
			.status(404)
			.json({message: "No books found for this author", error: error.message});
	}
});

// Get all books based on title
public_users.get("/title/:title", async function (req, res) {
	const {title} = req.params;
	try {
		const response = await axios.get(`http://localhost:5000/title/${title}`);
		return res.status(200).json(response.data);
	} catch (error) {
		return res
			.status(404)
			.json({message: "No books found with this title", error: error.message});
	}
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
	const {isbn} = req.params;

	if (books[isbn]) {
		return res.status(200).json(books[isbn].reviews);
	} else {
		return res.status(404).json({message: "Book not found"});
	}
});

module.exports.general = public_users;
