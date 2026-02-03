import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    username:{type:'string', required:true,unique:true},
    email:{type:'string', required:true,unique:true},
    password:{type:'string', required:true},
    profilePicture:{type:'string', default:''},
    bio:{type:'string', default:''},
    gender:{type:'string', enum:['male','female']},
    followers:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    following:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    posts:[{type:mongoose.Schema.Types.ObjectId,ref:'Post'}],
    bookmarks:[{type:mongoose.Schema.Types.ObjectId,ref:'Post'}]
} ,{timestamps:true});

 export const User = mongoose.model('User', userSchema);