// Import the Express framework to create a web server
import express from 'express';
// Import dotenv to load environment variables from a .env file
import dotenv from 'dotenv';
// Import the function that connects our app to MongoDB
import { connectDB } from './config/db.js';
// Import the Note model (defines the shape of our data in the database)
import myNote from './models/myNote.js';
// Import the 'protect' middleware — it checks if a user is logged in before allowing access
import { protect } from './middleware/authMiddleware.js';
// Import the User model (defines the shape of user data in the database)
import User from './models/User.js';
// Import jsonwebtoken — used to create tokens that prove a user is logged in
import jwt from 'jsonwebtoken';

// Load variables from .env file into process.env (e.g., PORT, MONGO_URI)
dotenv.config()

// Create an Express application instance — this is our web server
const app = express();
// Set the port from .env or default to 3000
const PORT = process.env.PORT || 3000;

// Middleware: tells Express to parse incoming JSON request bodies
// Without this, req.body would be undefined when clients send JSON data
app.use(express.json());

// Serve static files (like HTML, CSS, JS) from the "public" directory
// This lets clients access files like index.html, style.css, etc.      
app.use(express.static('public'));

// Call the function to connect to MongoDB
connectDB();

// ==================== ROUTES ====================

// Home route - shows a welcome message when someone visits the root URL "/"
app.get('/', (req, res) => {
    res.send(`<h1>Welcome to note App that is served by MongoDB in the backend</h1>`);
});

// ==================== USER REGISTRATION ====================

// When someone sends a POST request to "/api/users/register", run this function
// "async" allows us to use "await" to wait for database operations to finish
app.post('/api/users/register', async(req, res) => {
    // Destructure (pull out) name, email, and password from the request body
    // The client sends these in the JSON body of the request
    const { name, email, password } = req.body;

    // Search the database for a user with the same email
    // findOne() returns the first document that matches, or null if none found
    const existingUser = await User.findOne({email});
    // If we found a matching user, stop here and send an error response
    if(existingUser){
        // Status 400 means "Bad Request" - the client sent invalid data
        // "return" stops the function here so the code below doesn't run
        return res.status(400).json({message: 'User already exists'});
    }
    
    // No existing user found, so create a new user document in the database
    // User.create() saves the new user and returns the saved document
    const user = await User.create({name, email, password});

    // Create a JWT token containing the user's ID
    // jwt.sign() takes: payload (data to store), secret key, and options
    // process.env.JWT_SECRET is the secret key used to sign the token
    // {expiresIn: '1d'} means the token will be invalid after 1 day
    const token = jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn: '1d'});

    // Send back a success response (status 201 = "Created") with the user info and token
    res.status(201).json({
        id: user._id,       // The unique ID MongoDB assigned to this user
        name: user.name,   // The user's name
        email: user.email, // The user's email
        token              // The JWT token the client will use for future authenticated requests
    })
});

// ==================== USER LOGIN ====================

// When someone sends a POST request to "/api/users/login", run this function
app.post('/api/users/login', async (req, res) => {
    // Pull out email and password from the request body
    const { email, password } = req.body;

    // Search the database for a user with the provided email
    const user = await User.findOne({email});

    // If no user was found OR the password doesn't match the hashed one in the database
    // user.matchPassword() is a custom method defined in the User model that compares passwords
    if (!user|| !(await user.matchPassword(password))){
        // Status 401 means "Unauthorized" - the credentials are wrong
        return res.status(401).json({error: 'Invalid email or password'})
    }

    // Credentials are valid, so create a JWT token for this user (expires in 1 day)
    const token = jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn: '1d'});
    console.log(req.headers.authorization);

    // Send back a success response (status 200 = "OK") with user info and token
    res.status(200).json({ message: 'User has logged in successfully',
        id:user._id,       // The user's unique database ID
        name: user.name,   // The user's name
        email: user.email, // The user's email
        token              // The token the client stores to stay logged in
    })

});

// ==================== NOTES ROUTES (ALL PROTECTED) ====================
// "protect" middleware runs BEFORE the route handler
// It verifies the JWT token and attaches the user to req.user
// If the token is missing or invalid, it blocks access with a 401 error

// GET all notes - returns only notes belonging to the logged-in user
app.get('/api/notes', protect, async (req, res) => {
    try {
        // .find({ user: req.user._id }) queries MongoDB for notes where
        // the "user" field matches the logged-in user's ID
        // This ensures users only see their OWN notes, not everyone's
        const notes = await myNote.find({ user: req.user._id });
        // For debugging — logs the user's ID and its type to the terminal
        console.log('req.user._id:', req.user._id);
        console.log('type:', typeof req.user._id);
        // Send the notes array back to the client as JSON with a 200 (OK) status
        res.status(200).json(notes);
    }
    catch(error)
    {
        // If something goes wrong (e.g., database connection issue), send a 500 (server error)
        res.status(500).json({error: 'Failed to fetch notes'});
    } 
});

// GET a single note by its ID from the URL
app.get('/api/notes/:id', protect, async (req, res) => {
    try {
        // req.params.id grabs the :id value from the URL (e.g., /api/notes/abc123 → "abc123")
        const id = req.params.id;
        // findOne() with TWO conditions: the note must match the given ID
        // AND must belong to the logged-in user (prevents users from accessing others' notes)
        const note = await myNote.findOne({ _id: id, user: req.user._id });
        // If no note was found, send a 404 (Not Found) response
        if (!note) return res.status(404).json({ error: 'Note not found' });
        // Send the found note back as JSON
        res.status(200).json(note);
    }
    catch(error) {
        // If the ID format is invalid or something breaks, send an error
        res.status(500).json({error: 'Failed to fetch the note by id'});
    }
});

// POST - create a new note and save it to the database
app.post('/api/notes', protect, async (req, res) => {
    try {
        // Validate: if no text was sent in the request body, reject with 400 (bad request)
        if (!req.body.text) {
            return res.status(400).json({error: 'Text is required'})
        }
        // Create a new note document in MongoDB with the provided data
        // req.user._id links this note to the logged-in user (so we know who owns it)
        const note = await myNote.create({
            text: req.body.text,              // The note's text content from the request
            completed: req.body.completed,    // Optional: true/false, defaults to false in schema
            user: req.user._id               // The ID of the user creating this note
        });
        // Send back the created note with a 201 (Created) status code
        res.status(201).json(note);
    }
    catch(error)
    {
        res.status(500).json({error: 'Failed to create note'});
    }
});

// PUT - update an existing note by its ID
app.put('/api/notes/:id', protect, async (req, res) => {
    try {
        // Get the ID from the URL parameter (e.g., /api/notes/abc123 → "abc123")
        const id = req.params.id;
        // First, find the note and verify it belongs to the logged-in user
        // findOne() with two conditions: match the note ID AND the user's ID
        const note = await myNote.findOne({ _id: id, user: req.user._id });
        // If no note found, either it doesn't exist or it belongs to someone else
        if (!note) return res.status(404).json({ error: 'Note not found' });
        // Now safe to update — findByIdAndUpdate() updates the note with new data from req.body
        // { new: true } tells Mongoose to return the UPDATED version, not the old one
        const updatedNote = await myNote.findByIdAndUpdate(id, req.body, { new: true });
        // Send back the updated note with 200 (OK) status
        res.status(200).json({ message: 'Note updated successfully', note: updatedNote });
    } 
    catch(error) {
        res.status(500).json({error: 'Failed to update note'});
    }
});

// DELETE - remove a note from the database by its ID
app.delete('/api/notes/:id', protect, async (req, res) => {
    try {
        // Get the ID from the URL parameter
        const id = req.params.id;
        // First, find the note and verify it belongs to the logged-in user
        // This prevents users from deleting other people's notes
        const note = await myNote.findOne({ _id: id, user: req.user._id });
        // If no note found, either it doesn't exist or it belongs to someone else
        if (!note) return res.status(404).json({ error: 'Note not found' });
        // Now safe to delete — findByIdAndDelete() permanently removes it from the database
        await myNote.findByIdAndDelete(id);
        // Send success message with 200 (OK) status
        res.status(200).json({message: 'Note deleted successfully'});
    }
    catch (error) {
        res.status(500).json({error: 'Failed to delete the note'});
    }
});

// ==================== START SERVER ====================

// Start the server — it begins listening for incoming HTTP requests on the specified port
// The callback function runs once the server is ready, logging a confirmation message
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});
