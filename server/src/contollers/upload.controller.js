const uploadImage   = (req, res)=>{
    if(!req.file){
        return res.status(400).json({
            success:false,
            message:"No image Uploaded"
        })
    }
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    console.log("image uploaded successfully" , req.file);
    return res.status(200).json({
        success:true,
        message:"Image uploded Successfully",
        filename:req.file.filename,
        imageUrl
    });
};
module.exports={uploadImage}; 