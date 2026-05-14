// Import mongoose to define the structure of our data
import mongoose from 'mongoose';

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
        // As mongoose resolved this reference at runtime ny looking up its internal model registry, there is no need to 'import User from './User.js';'
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
// Take NOTE that mongoDB will do the following to the model name (Expected behaviour):
//      1. Lowercase the model name to 'mynote'. 
//      2. Then, pluralize the model name from to 'mynotes'. 
// If I wanted to override this behavior i would have used a 3rd override as argument 
// //i.e. mongoose.model('User', userSchema, 'my_custom_collection');

const myNote = mongoose.model('myNote', mynoteSchema);

// Export the model so other files (like app.js) can use it
export default myNote;
