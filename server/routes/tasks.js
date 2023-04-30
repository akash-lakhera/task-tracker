const{getAllTasks,createMainTask,createInnerTask,getInnerTask,deleteTask,updateTask}=require('../controllers/tasks')
const router=require('express').Router();
router.route('/').get(getAllTasks).post(createMainTask)
router.route('/:task').post(createInnerTask).get(getInnerTask).delete(deleteTask).put(updateTask)
module.exports=router;