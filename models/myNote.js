import mongoose from 'mongoose';

const mynoteSchema = new mongoose.Schema(
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

const myNote = mongoose.model('myNote',mynoteSchema);

export default myNote;