# Note Manager with mongoDB

## Goal

Upgrade your Notes API so notes survive server restarts.

## Requirements

Build:

```
GET     /api/notes
GET     /api/notes/:id
POST    /api/notes
PUT     /api/notes/:id
DELETE  /api/notes/:id
```

Each note should support:

```
{
text:String,
completed:Boolean
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

