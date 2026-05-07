// Import the Express framework to create a web server
import express from 'express';
// Import dotenv to load environment variables from a .env file
import dotenv from 'dotenv';
// Import the function that connects our app to MongoDB
import { connectDB } from './config/db.js';
// Import the Note model (defines the shape of our data in the database)
import myNote from './models/myNote.js';

// Load variables from .env file into process.env (e.g., PORT, MONGO_URI)
dotenv.config()

// Create an Express application instance
const app = express();
// Set the port from .env or default to 3000
const PORT = process.env.PORT || 3000;

// Middleware: tells Express to parse incoming JSON request bodies
// Without this, req.body would be undefined
app.use(express.json());

// Call the function to connect to MongoDB
connectDB();

// Home route - shows a welcome message when someone visits the root URL
app.get('/', (req, res) => {
    res.send(`<h1>Welcome to note App that is served by MongoDB in the backend</h1>`);
});


// GET all notes - returns every note stored in the database
app.get('/api/notes', async (req, res) => {
    try {
        // .find() with no arguments returns ALL documents in the collection
        const notes = await myNote.find();
        // Send the notes array back to the client as JSON with a 200 (OK) status
        res.status(200).json(notes);
    }
    catch(error)
    {
        // If something goes wrong, send a 500 (server error) response
        res.status(500).json({error: 'Failed to fetch notes'});
    } 
});

// GET a single note by its ID from the URL
app.get('/api/notes/:id', async (req, res) => {
    try {
        // req.params.id grabs the :id value from the URL (e.g., /api/notes/abc123)
        const id = req.params.id;
        // Find one note in the database that matches this ID
        const note = await myNote.findById(id);
        // Send the found note back as JSON with a 200 (OK) status
        res.status(200).json(note);
    }
    catch(error) {
        // If the ID doesn't exist or something breaks, send an error
        res.status(500).json({error: 'Failed to fetch the note by id'});
    }
});

// POST - create a new note and save it to the database
app.post('/api/notes', async (req, res) => {
    try {
        // Validate: if no text was sent in the request body, reject with 400 (bad request)
        if (!req.body.text) {
            return res.status(400).json({error: 'Text is required'})
        }
        // Create a new note document in MongoDB with the provided data
        const note = await myNote.create({
            text: req.body.text,
            completed: req.body.completed || false
        });
        // Send back the created note with a 201 (created) status code
        res.status(201).json(note);
    }
    catch(error)
    {
        res.status(500).json({error: 'Failed to create note'});
    }
});

// PUT - update an existing note by its ID
app.put('/api/notes/:id', async (req, res) => {
    try {
        // Get the ID from the URL parameter
        const id = req.params.id;
        // Find the note by ID and update it with the new data from req.body
        // { new: true } tells Mongoose to return the updated version, not the old one
        const note = await myNote.findByIdAndUpdate(id, req.body, {new: true});
        // Send success message
        res.status(200).json({message: 'Note updated successfully'});
    } 
    catch(error) {
        res.status(500).json({error: 'Failed to update note'});
    }
});

// DELETE - remove a note from the database by its ID
app.delete('/api/notes/:id', async (req, res) => {
    try {
        // Get the ID from the URL parameter
        const id = req.params.id;
        // Find the note by ID and permanently delete it from the database
        const note = await myNote.findByIdAndDelete(id);
        // Send success message
        res.status(200).json({message: 'Note deleted successfully'});
    }
    catch (error) {
        res.status(500).json({error: 'Failed to delete the node'});
    }
});

// Start the server - it begins listening for incoming HTTP requests
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});
