// daily query 2 levels deep
db.a.aggregate([
  { $match: { name: "akash" } },
  { $unwind: "$dates" },
  { $match: { "dates.date": "15" } },
  { $unwind: "$dates.tasks" },
  { $match: { "dates.tasks.name": "study" } },
  { $unwind: "$dates.tasks.tasks" },
  { $match: { "dates.tasks.tasks.name": "css" } },
  { $project: { "dates.tasks.tasks.tasks.tasks": 0 } },
  {
    $project: {
      date: "$dates.date",
      parent: "$dates.tasks.tasks.name",
      children: "$dates.tasks.tasks.tasks",
      _id: 0,
    },
  },
]);
//all dates 1 level deep
db.a.aggregate([
  { $match: { name: "akash" } },
  { $unwind: "$dates" },
  { $unwind: "$dates.tasks" },
  { $match: { "dates.tasks.name": "study" } },
  { $project: { "dates.tasks.tasks": 0 } },
  { $project: { date: "$dates.date", parent: "$dates.tasks.name", _id: 0 } },
]);

//update query
db.a.updateOne(
  { name: "viktor" }, 
  { $push: { "dates.$[d].tasks.$[t].tasks": "mandir" } },
  { arrayFilters: [{ "d.date": "50" }, { "t.name": "ligma" }] }
);
// 
var a=[];
var index=taskID.indexOf("+");
while(index>-1){
    a.push(taskID.substring(0,index));
    taskID=taskID.substring((index+1))
    var index=taskID.indexOf("+");
} 
a.push(taskID)
console.log(a);
console.log(a.length)
var aggr=[];
var match={ $match: { 'name': "elizabeth" } }
var unwind={ $unwind: "$dates" }
aggr.push(match)
aggr.push(unwind)
match={ $match: { "dates.date": "15" } }
aggr.push(match)
for(var i=0;i<a.length;i++)
{
    
    var unwindcreate=""
    var matchcreate=""
    for(var j=0;j<=i;j++)
    {
        unwindcreate+=".tasks"

    }
  
    matchcreate="dates"+unwindcreate+".name";
    var temp=unwindcreate
    unwindcreate="$dates"+unwindcreate
    unwind={ $unwind: unwindcreate }
    match={ $match: { [matchcreate]: a[i] } }
    aggr.push(unwind)
    aggr.push(match)
     
    

}
var projectcreate="dates"+temp+".tasks.tasks"
var project={$project:{[projectcreate]:0}}
aggr.push(project)
project={
    $project: {
      date: "$dates.date",
      parent: "$dates"+temp+".name",
      children: "$dates"+temp+".tasks",
      _id: 0,
    }, 
  }
aggr.push(project)
var data= await Tasks.aggregate(aggr)
data=JSON.stringify(data)
console.log(data)
console.log(aggr)
 //


 const task_identifier = "level";
 let arrayFilters = [];
 arrayFilters.push({ "d.date": "15" });
 let update = "dates.$[d]";
 let temp = "";
 let task_counter = 1;
 let extractedId = "";
 var taskID = req.url.substring(1);
 console.log(taskID);
 var a = [];
 var index = taskID.indexOf("+");
 while (index > -1) {
   extractedId = taskID.substring(0, index);
   extractedId=decodeURIComponent(extractedId) //extracted particular tasks by names from url
   taskID = taskID.substring(index + 1); //extract rest of the url
   index = taskID.indexOf("+");
   temp = task_identifier + task_counter;
   update = update + ".tasks.$[" + temp + "]";
   arrayFilters.push({ [temp + ".name"]: extractedId });
   task_counter++;
 }
 temp = task_identifier + task_counter;
 update = update + ".tasks.$[" + temp + "]";
 arrayFilters.push({ [temp + ".name"]: taskID });

 //add new date and tasks from "newDay".
 