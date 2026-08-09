require("dotenv").config();
const connectDB = require("./config/db");
const app = require("./app");






connectDB().catch((err)=>{
    console.log(err);
});
let PORT = process.env.PORT;
app.listen(PORT,()=>{
    console.log("server is running");
    
})

