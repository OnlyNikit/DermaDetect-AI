function upload (req,res){
    res.send("upload");
}

function analyze (req,res){
    res.send("analyze")
}

function history (req,res){
    res.send("history");
}

function report(req,res){
    res.send("report");
}

function deleteReport(req,res){
    res.send("deleted");
}

module.exports = {upload,analyze,history,report,deleteReport};