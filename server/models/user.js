const mongoose=require('mongoose')
const user=new mongoose.Schema({
    id:String,name:String,dates:Array,newDays:Object,currentDate:String
})
module.exports=mongoose.model('Colonel',user)
