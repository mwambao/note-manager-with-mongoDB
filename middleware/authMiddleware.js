// Import jsonwebtoken to verify the token sent by the client
import jwt from 'jsonwebtoken';
// Import the User model to look up user info in the database
import User from '../models/User.js';

// This middleware function checks if a user is logged in before allowing access to a route
// "next" is a function that passes control to the next middleware or route handler
export const protect = async ( req, res, next) => {
    // Declare a variable to hold the token
    let token;

    // Check if the request has an "Authorization" header that starts with "Bearer"
    // Example header: "Bearer eyJhbGciOiJIUzI1NiIs..."
    if ( req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // Split the header by space and grab the token part (index 1)
        // "Bearer abc123" becomes ["Bearer", "abc123"], so [1] gives us "abc123"
        token = req.headers.authorization.split(' ')[1];
    }

    // If no token was found, the user is not logged in — block access
    if (!token) {
        return res.status(401).json({message: 'Not authorized, no token'});
    }

    try {
        // Verify the token using our secret key — this decodes the data stored inside it
        // If the token is invalid or expired, this will throw an error
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Find the user in the database using the ID from the token
        // .select('-password') excludes the password field from the result for security
        req.user = await User.findById(decoded.id).select('-password');
        // Token is valid and user is found — allow the request to continue to the next handler
        next();

    }

    catch(error) {
        // If token verification fails (invalid or expired), block access
        res.status(401).json({message: 'Not authorized, token failed'} );

    }

};