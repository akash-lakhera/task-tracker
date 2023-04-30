const{getPreviousTasks}=require('../controllers/tasks')
const router=require('express').Router();
router.route('/:task').get(getPreviousTasks)
module.exports=router;