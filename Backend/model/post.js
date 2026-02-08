const mongoose=require("mongoose");

const postSchema=new mongoose.Schema({
    text:{
        type:String
    },
    image:{
        type:String
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    likes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        }
    ],
    comments:[
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            text:{
                type: String,
                required: true
            },
            createdAt: {
            type: Date,
            default: Date.now
            }
        }
    ]
},{timestamps:true})

module.exports=mongoose.model("Post",postSchema);
