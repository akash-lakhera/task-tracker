
const User=require('../models/user')
const createUser=async(req,res)=>{
    const task=await User.create(req.body)
    res.status(200).send(task);
}
module.exports={createUser}