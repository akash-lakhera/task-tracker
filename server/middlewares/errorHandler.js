const errorHandlerMid=(err,req,res,next)=>{
    console.log(err)
    return res.status(500).send({error:"an error occurred"})
}
module.exports=errorHandlerMid;