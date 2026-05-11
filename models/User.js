// Import mongoose library to interact with MongoDB database
import mongoose from 'mongoose';
// Import bcryptjs library to hash (encrypt) passwords
import bcryptjs from 'bcryptjs';

// Define the structure (schema) of a User document in MongoDB
const userSchema = new mongoose.Schema(
{
        // 'name' field: must be a string, is required, and whitespace is trimmed
        name: { 
            type: String,
            required: true,
            trim:true
        },
        // 'email' field: must be a string, required, must be unique (no duplicates),
        // automatically converted to lowercase, and whitespace is trimmed
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim:true
        },
        // 'password' field: must be a string, required, and at least 6 characters long
        password: {
            type: String,
            required: true,
            minlength: 6
        }
    },

{
         // Automatically adds 'createdAt' and 'updatedAt' fields to each document
         timestamps: true

}        
);

// Middleware that runs BEFORE saving a user to the database
userSchema.pre('save', async function() {
    // If the password hasn't been changed, skip hashing and move on
    if (!this.isModified('password')) return;
    // Hash the password with a salt of 10 rounds (makes it unreadable for security)
    this.password = await bcryptjs.hash(this.password, 10);
});

// Add a custom method to compare a plain-text password with the hashed one in the database
userSchema.methods.matchPassword = async function(enteredPassword) {
    // Returns true if the entered password matches the stored hashed password
    return bcryptjs.compare(enteredPassword, this.password);
};

// Create the 'User' model from the schema (this represents the 'users' collection in MongoDB)
const User = mongoose.model('User', userSchema);
// Export the User model so other files can use it
export default User;
