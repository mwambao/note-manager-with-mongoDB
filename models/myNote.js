// Import mongoose to define the structure of our data
import mongoose from 'mongoose';
import User from './User.js';

// Define a "schema" - this is like a blueprint that tells MongoDB
// what a note should look like (what fields it has and their rules)
const mynoteSchema = new mongoose.Schema(
    {
        // The 'text' field: must be a String, is required (can't be empty),
        // and trim removes extra whitespace from the beginning/end
        text: {
            type: String,
            required: true,
            trim: true
        },
        // The 'completed' field: must be a Boolean (true/false),
        // defaults to false if not provided
        completed: {
            type: Boolean,
            default: false
        },
        // The 'user' field: references the 'User' model (so each note belongs to a user)
        // It's required, meaning every note must have an associated user   
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true

        }
    },
    {
        // timestamps: true automatically adds 'createdAt' and 'updatedAt' fields
        timestamps: true
    }
);




// Create a model from the schema - this gives us methods like .find(), .create(), .findByIdAndUpdate()
// 'myNote' is the name MongoDB will use for the collection (it becomes 'mynotes' in the database)
const myNote = mongoose.model('myNote', mynoteSchema);

// Export the model so other files (like app.js) can use it
export default myNote;
