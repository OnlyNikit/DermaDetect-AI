  // const express = require("express");
  // const app = express();
  // require("dotenv").config();
  // const cookieParser = require("cookie-parser");
  // const cors = require("cors");
  // const path  = require("path");


  // const authRoutes = require("./routes/auth.routes.js");
  // const userRoutes = require("./routes/user.routes.js");
  // const reportRoutes = require("./routes/report.routes.js");
  // const dashboardRoutes = require("./routes/dashboard.routes.js");
  // const pdfRoutes = require("./routes/pdf.routes.js");
  // const uploadRoutes = require("./routes/upload.routes");
  // const assessmentRoutes =  require("./routes/assessment.routes.js")
  // app.use(
  //   cors({
  //     origin: process.env.FRONTEND_URL,
  //     credentials: true,
  //   }),
  // );

  // app.use(express.json({limit:"20mb"}));
  // app.use(express.urlencoded({ extended: true,limit:"20mb" }));
  // app.use(cookieParser());

  // // ! authentication routes

  // app.use("/api/auth", authRoutes);

  // //!  user Routes

  // app.use("/api/user", userRoutes);

  // //! upload system 
  // app.use("/uploads", express.static(path.join(__dirname,"../uploads")));
  // app.use("/api",uploadRoutes);

  // //!Assement route
  // app.use("/api/assessment",assessmentRoutes)

  // // ! report routes

  // app.use("/api/report", reportRoutes);

  // // ! dashboard routes

  // app.use("/api/dashboard", dashboardRoutes);

  // //! pdf routes

  // app.use("/api/pdf", pdfRoutes);

  // module.exports = app;





  // !-------------------------------------------------------------

  const express = require("express");
  const app = express();
  require("dotenv").config();
  const cookieParser = require("cookie-parser");
  const cors = require("cors");
  const path = require("path");

  const authRoutes = require("./routes/auth.routes.js");
  const userRoutes = require("./routes/user.routes.js");
  const reportRoutes = require("./routes/report.routes.js");
  const dashboardRoutes = require("./routes/dashboard.routes.js");
  const pdfRoutes = require("./routes/pdf.routes.js");
  const uploadRoutes = require("./routes/upload.routes");
  const assessmentRoutes = require("./routes/assessment.routes.js");
  const notificationRoutes = require("./routes/notifications.routes.js"); // NEW
  const phoneSessionRoute= require("./routes/phoneSession.routes.js")

  const allowedOrigins = [
    "https://derma-detect-ai-six.vercel.app",
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ extended: true, limit: "20mb" }));

  app.use(cookieParser());

  app.get("/", (req, res) => {
  res.json({
    message: "DermaDetect backend running"
  });
});

  // ! authentication routes
  app.use("/api/auth", authRoutes);

  //! user Routes
  app.use("/api/user", userRoutes);

  //! upload system
  // app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
  app.use("/api", uploadRoutes);

  //! Assessment route
  app.use("/api/assessment", assessmentRoutes);

  // ! report routes - plural, to match frontend's api.get("/reports")
  app.use("/api/reports", reportRoutes);

  // ! dashboard routes
  app.use("/api/dashboard", dashboardRoutes);

  //! pdf routes
  app.use("/api/pdf", pdfRoutes);

  // ! notification routes (NEW) - plural, to match frontend's api.get("/notifications")
  app.use("/api/notifications", notificationRoutes);

  //!  phone session routes
  app.use("/api",phoneSessionRoute);


  module.exports = app;