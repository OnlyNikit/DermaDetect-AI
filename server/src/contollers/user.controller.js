
function profile(req,res){
    res.send("profile");
}

function profileUpdate(req,res){
    res.send("profileupdated");
}

function profileDelete(req,res){
    res.send("profile Deleted");
}

module.exports={profile,profileUpdate,profileDelete};