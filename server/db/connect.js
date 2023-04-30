const mongoose=require('mongoose');


const connectDB=(url)=>{
   try {
      return  mongoose.connect(url,{ useNewUrlParser: true , useUnifiedTopology: true });
   } catch (error) {
      console.log("error in connecDB"+error)
   }
   
}
module.exports=connectDB