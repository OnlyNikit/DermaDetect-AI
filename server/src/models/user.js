const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique:true,
    },
    password: {
      type: String,
      required: true,
    },
    gender:{
      type:String,
      required:true,
      enum:["Male","Female","Other","prefer_not_to_say"]
    },
    age:{
      type:Number,
      required:true,
      min:0,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User",UserSchema);


module.exports = User;