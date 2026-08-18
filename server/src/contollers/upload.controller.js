const uploadImage = (req, res) => {
  console.log("UPLOAD HIT");
  console.log("FILE:", req.file);
  console.log("BODY:", req.body);
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No image Uploaded",
    });
  }
  // const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  const imageUrl = req.file.path; // Cloudinary ka URL yahan already aa jaata hai

  console.log("image uploaded successfully", req.file);
  return res.status(200).json({
    success: true,
    message: "Image uploded Successfully",
    filename: req.file.filename,
    imageUrl,
  });
};
module.exports = { uploadImage };
