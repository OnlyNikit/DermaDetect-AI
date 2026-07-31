const express = require("express");
const app = express();

const authRoutes = require("./routes/auth.routes.js");
const userRoutes = require("./routes/user.routes.js");
const reportRoutes =require("./routes/report.routes.js");
const dashboardRoutes = require("./routes/dashboard.routes.js");
const pdfRoutes = require("./routes/pdf.routes.js");

app.use(express.json());
app.use(express.urlencoded({extended:true}));

// ! authentication routes

app.use("/api/auth",authRoutes);

//!  user Routes

app.use("/api/user",userRoutes);

// ! report routes

app.use("/api/report",reportRoutes);

// ! dashboard routes

app.use("/api/dashboard",dashboardRoutes);

//! pdf routes 

app.use("/api/pdf" ,pdfRoutes);




module.exports=app;