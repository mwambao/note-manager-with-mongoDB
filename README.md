# Note Manager with mongoDB

## Goal

Upgrade your Notes API so notes survive server restarts i.e. use MongoDB as backend database.

Only logged in users can mamnage notes.

## Requirements

Build:

```
POST    /api/users/register
POST    /api/users/login
GET     /api/notes
GET     /api/notes/:id
POST    /api/notes
PUT     /api/notes/:id
DELETE  /api/notes/:id
```

Protected routes must require: 

````
Authorization: Bearer <token>
````
Bonus: Each user should only see their own notes.

Each note should support:

```
{
text:String,
completed:Boolean,
user.req.user._id
}
```

Add validation:

- `text` is required
- `completed` defaults to `false`

##Suggested Model###
```
import mongoose from 'mongoose';

const noteSchema = newm ongoose.Schema(
    {
        text: {
            type:String,
            required:true,
            trim:true
        },
        completed: {
            type:Boolean,
            default:false
        }
    },
    {
        timestamps:true
    }
);

const Note = mongoose.model('Note',noteSchema);

export default Note;
```

##Project Structure ##

```
notes-manager-with-mongodb/
├── app.js
├── config/
│   └── db.js
├── models/
│   └── myNote.js
├── .env
├── .gitignore
└── package.json
```

