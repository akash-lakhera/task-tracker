const { db } = require("../models/user");

Tasks = require("../models/user");
wrapper = require("../middlewares/trycatch");
// get all Primary tasks
const newDateSetter = async (req) => {
  const temp = new Date(Date.now()).toLocaleDateString("en-GB");//current date is added to the session
  if (req.session.passport.user.date !== temp) {
    req.session.passport.user.date = temp;
    let tempday = new Date().toLocaleDateString(undefined, {
      weekday: "short",
    });
    req.session.passport.user.day = tempday;
    // Add current day tasks if they do not exist
    await Tasks.findOneAndUpdate({ id: req.user.id }, [
      {
        $set: {
          dates: {
            $concatArrays: [
              "$dates",
              {
                $cond: {
                  if: { $eq: ["$currentDate", temp] },
                  then: [],
                  else: [
                    {
                      date: temp,
                      tasks: "$newDays." + req.session.passport.user.day,
                    },
                  ],
                },
              },
            ],
          },
          currentDate: temp,
        },
      },
    ]);
  }
};

const getAllTasks = wrapper(async (req, res, next) => {// get primary tasks
  let date;
  await newDateSetter(req);
  date = req.query.date || req.session.passport.user.date;
  var data = await Tasks.aggregate([
    { $match: { id: req.user.id } },
    { $unwind: "$dates" },
    { $match: { "dates.date": date } },

    { $project: { "dates.tasks.tasks": 0 } },
    {
      $project: {
        date: "$dates.date",
        children: "$dates.tasks",
        _id: 0,
      },
    },
  ]);
  data = data[0];

  if (data) {
    if (typeof data.children == "undefined") data.children = [];
  }
  data = JSON.stringify(data);
  res.status(200).send(data);
});

//create a primary task
const createMainTask = wrapper(async (req, res, next) => { 
  const { name, metric, days } = req.body;
  if (days[new Date().getDay()]) {
    var data = await Tasks.updateOne(
      { id: req.user.id },
      {
        $push: {
          "dates.$[d].tasks": {
            name: name,
            metrics: [{ name: metric, requiredValue: 0, currentValue: 0 }],
            completed: false,
            days: days,
          },
        },
      },
      { arrayFilters: [{ "d.date": req.session.passport.user.date }] }
    );
  }

  let newDays = {};
  days.forEach((element) => {
    if (element) {
      newDays["newDays." + element] = {
        name: name,
        metrics: [{ name: metric, requiredValue: 0, currentValue: 0 }],
        completed: false,
        days: days,
      };
    }
  });

  data = await Tasks.updateOne(
    { id: req.user.id },
    {
      $push: newDays,
    }
  );

  res.status(200).send();
});
//update a task
const updateTask = wrapper(async (req, res, next) => {
  const {
    summary,
    addMetric,
    deleteMetric,
    currentValue,
    requiredValue,
    completed,
  } = req.body;
  const task_identifier = "level";
  let arrayFilters = [];
  arrayFilters.push({ "d.date": req.session.passport.user.date });
  let update = "dates.$[d]";
  let temp = "";
  let task_counter = 1;
  let extractedId = "";
  var taskID = req.url.substring(1);

  var a = [];
  let nextDayArrayFilters = [];
  let nextDayUpdate = "";
  var index = taskID.indexOf("+");
  while (index > -1) {
    extractedId = taskID.substring(0, index);
    extractedId = decodeURIComponent(extractedId); //extracted particular tasks by names from url
    taskID = taskID.substring(index + 1); //extract rest of the url
    index = taskID.indexOf("+");
    temp = task_identifier + task_counter;
    update = update + ".tasks.$[" + temp + "]";
    nextDayUpdate = nextDayUpdate + ".$[" + temp + "]" + ".tasks";
    arrayFilters.push({ [temp + ".name"]: extractedId });
    nextDayArrayFilters.push({ [temp + ".name"]: extractedId });
    task_counter++;
  }
  taskID = decodeURIComponent(taskID);
  temp = task_identifier + task_counter;
  update = update + ".tasks.$[" + temp + "]";
  arrayFilters.push({ [temp + ".name"]: taskID });
  nextDayUpdate = nextDayUpdate + ".$[" + temp + "]";
  nextDayArrayFilters.push({ [temp + ".name"]: taskID });
  var setobject = {};
  var action;
  var actionObject;
  if (summary) {
    action = update + ".summary";
    actionObject = {
      $set: {
        [action]: summary,
      },
    };
  } else if (completed) {
    // set/unset task as completed

    action = update + ".completed";
    actionObject = {
      $set: {
        [action]: completed.value,
      },
    };
  } else {
    // add a metric
    if (addMetric) {
      action = update + ".metrics";
      actionObject = {
        $push: {
          [action]: {
            name: addMetric.newMetricValue,
            currentValue: 0,
          },
        },
      };
      var nextDaysActionObject = { ["$push"]: {} };
      var nextDaysAction;
      addMetric.days.forEach((element) => {
        if (element) {
          nextDaysAction = "newDays." + element + nextDayUpdate + ".metrics";
          nextDaysActionObject["$push"][nextDaysAction] = {
            name: addMetric.newMetricValue,
            currentValue: 0,
          };
        }
      });
    } else if (deleteMetric) {
      action = update + ".metrics.$[met]";
      arrayFilters.push({ "met.name": deleteMetric.name });
      actionObject = {
        $pull: {
          [action]: {
            name: deleteMetric.name,
          },
        },
      };
    } else {
      action = update + ".metrics.$[met]";
      if (currentValue) {
        arrayFilters.push({ "met.name": currentValue.name });
        actionObject = {
          $set: {
            [action + ".currentValue"]: currentValue.value,
          },
        };
      } else {
        arrayFilters.push({ "met.name": requiredValue.name });
        actionObject = {
          $set: {
            [action + ".requiredValue"]: requiredValue.value,
          },
        };
      }
    }
  }
  let data = await Tasks.updateOne({ id: req.user.id }, actionObject, {
    arrayFilters: arrayFilters,
  });
  await Tasks.updateOne({ id: req.user.id }, nextDaysActionObject, {
    arrayFilters: nextDayArrayFilters,
  });

  res.status(200).send("updated");
});
//delete any task works for both primary and inner
const deleteTask = wrapper(async (req, res, next) => {
  const task_identifier = "level";
  let arrayFilters = [];
  let anotherArrayFilters = [];
  arrayFilters.push({ "d.date": req.session.passport.user.date });
  let pull = "dates.$[d]";
  let anotherpull = "";
  let temp = "";
  let task_counter = 1;
  let extractedId = "";
  var taskID = req.url.substring(1);

  var a = [];
  var index = taskID.indexOf("+");
  while (index > -1) {
    extractedId = taskID.substring(0, index); //extracted particular tasks by names from url
    extractedId = decodeURIComponent(extractedId);
    taskID = taskID.substring(index + 1); //extract rest of the url

    index = taskID.indexOf("+");
    temp = task_identifier + task_counter;
    pull = pull + ".tasks.$[" + temp + "]";
    anotherpull = anotherpull + ".$[" + temp + "]" + ".tasks";
    arrayFilters.push({ [temp + ".name"]: extractedId });
    anotherArrayFilters.push({ [temp + ".name"]: extractedId });
    task_counter++;
  }
  taskID = decodeURIComponent(taskID);

  pull = pull + ".tasks";
  anotherpull = "newDays." + req.session.passport.user.day + anotherpull;

  let data = {};

  data.one = await Tasks.updateOne(
    { id: req.user.id },
    { $pull: { [pull]: { name: taskID } } },
    { arrayFilters: arrayFilters }
  );
  data.two = await Tasks.updateOne(
    { id: req.user.id },
    { $pull: { [anotherpull]: { name: taskID } } },
    { arrayFilters: anotherArrayFilters }
  );

  res.status(200).send("Here is your task:");
});
//create inner
const createInnerTask = wrapper(async (req, res, next) => {
  let taskID = req.url.substring(1);
  taskID = decodeURIComponent(taskID);
  let { name, metric, days } = req.body;

  const task_identifier = "level";
  let arrayFilters = [];
  let nextDayArrayFilters = [];
  let nextDayUpdate = "";
  arrayFilters.push({ "d.date": req.session.passport.user.date });
  let update = "dates.$[d]";
  let temp = "";
  let task_counter = 1;
  let extractedId = "";

  var index = taskID.indexOf("+");
  while (index > -1) {
    extractedId = taskID.substring(0, index); //extracted particular tasks by names from url
    taskID = taskID.substring(index + 1); //extract rest of the url
    index = taskID.indexOf("+");
    temp = task_identifier + task_counter;
    update = update + ".tasks.$[" + temp + "]";
    nextDayUpdate = nextDayUpdate + ".$[" + temp + "]" + ".tasks";
    arrayFilters.push({ [temp + ".name"]: extractedId });
    nextDayArrayFilters.push({ [temp + ".name"]: extractedId });
    task_counter++;
  }
  temp = task_identifier + task_counter;
  update = update + ".tasks.$[" + temp + "].tasks";
  arrayFilters.push({ [temp + ".name"]: taskID });
  nextDayUpdate = nextDayUpdate + ".$[" + temp + "].tasks";
  nextDayArrayFilters.push({ [temp + ".name"]: taskID });
  let data = {};

  if (days[new Date().getDay()]) {
    data.one = await Tasks.updateOne(
      { id: req.user.id },
      {
        $push: {
          [update]: {
            name: name,
            metrics: [{ name: metric, requiredValue: 0, currentValue: 0 }],
            completed: false,
            days: days,
          },
        },
      },
      { arrayFilters: arrayFilters }
    );
  }
  let newDays = {};
  days.forEach((element) => {
    if (element) {
      newDays["newDays." + element + nextDayUpdate] = {
        name: name,
        metrics: [{ name: metric, requiredValue: 0, currentValue: 0 }],
        completed: false,
        days: days,
      };
    }
  });
  data.two = await Tasks.updateOne(
    { id: req.user.id },
    {
      $push: newDays,
    },
    { arrayFilters: nextDayArrayFilters }
  );

  res.status(200).send("LiGmA");
});
//get inner
const getInnerTask = wrapper(async (req, res, next) => {
  await newDateSetter(req);
  let date = [
    { "dates.date": req.query.date || req.session.passport.user.date },
  ];
  var taskID = req.params.task;

  taskID = decodeURIComponent(taskID);
  var a = [];
  var index = taskID.indexOf("+");
  while (index > -1) {
    a.push(taskID.substring(0, index));
    taskID = taskID.substring(index + 1);
    var index = taskID.indexOf("+");
  }
  a.push(taskID);
  var aggr = [];
  var match = { $match: { id: req.user.id } };
  var unwind = { $unwind: "$dates" };
  aggr.push(match);
  aggr.push(unwind);
  match = { $match: { $or: date } };
  aggr.push(match);
  for (var i = 0; i < a.length; i++) {
    var unwindcreate = "";
    var matchcreate = "";
    for (var j = 0; j <= i; j++) {
      unwindcreate += ".tasks";
    }

    matchcreate = "dates" + unwindcreate + ".name";
    var temp = unwindcreate;
    unwindcreate = "$dates" + unwindcreate;
    unwind = { $unwind: unwindcreate };
    match = { $match: { [matchcreate]: a[i] } };
    aggr.push(unwind);
    aggr.push(match);
  }
  var projectcreate = "dates" + temp + ".tasks.tasks";
  var project = { $project: { [projectcreate]: 0 } };
  aggr.push(project);
  project = {
    $project: {
      date: "$dates.date",
      parent: "$dates" + temp + ".name",
      children: "$dates" + temp + ".tasks",
      metrics: "$dates" + temp + ".metrics",
      days: "$dates" + temp + ".days",
      completed: "$dates" + temp + ".completed",
      random: "$dates" + temp + ".metrics.currentValue",
      _id: 0,
    },
  };
  aggr.push(project);
  var data = await Tasks.aggregate(aggr);

  data = data[0];
  data = JSON.stringify(data);
  res.status(200).send(data);
});
//get previous instances of a task
const getPreviousTasks = wrapper(async (req, res, next) => {
  const nDays = req.query.nDays;
  const lastdate = req.query.date;
  let chosenTime;
  if (lastdate) {
    let deez = `${lastdate.substring(3, 5)}/${lastdate.substring(
      0,
      2
    )}/${lastdate.substring(6)}`;
    chosenTime = Date.parse(deez);
  }

  let dates = [];
  let date = new Date();
  let time = chosenTime || date.getTime();
  for (let j = 0; j < nDays; j++) {
    dates.push({
      "dates.date": new Date(time - 1000 * 60 * 60 * 24 * j).toLocaleDateString(
        "EN-GB"
      ),
    });
  }


  var taskID = req.params.task;
  taskID = decodeURIComponent(taskID);
  var a = [];
  var index = taskID.indexOf("+");
  while (index > -1) {
    a.push(taskID.substring(0, index));
    taskID = taskID.substring(index + 1);
    var index = taskID.indexOf("+");
  }
  a.push(taskID);
  var aggr = [];
  var match = { $match: { id: req.user.id } };
  var unwind = { $unwind: "$dates" };
  aggr.push(match);
  aggr.push(unwind);
  match = { $match: { $or: dates } };
  aggr.push(match);
  for (var i = 0; i < a.length; i++) {
    var unwindcreate = "";
    var matchcreate = "";
    for (var j = 0; j <= i; j++) {
      unwindcreate += ".tasks";
    }

    matchcreate = "dates" + unwindcreate + ".name";
    var temp = unwindcreate;
    unwindcreate = "$dates" + unwindcreate;
    unwind = { $unwind: unwindcreate };
    match = { $match: { [matchcreate]: a[i] } };
    aggr.push(unwind);
    aggr.push(match);
  }
  var projectcreate = "dates" + temp + ".tasks.tasks";
  var project = { $project: { [projectcreate]: 0 } };
  aggr.push(project);
  project = {
    $project: {
      date: "$dates.date",
      parent: "$dates" + temp + ".name",
      children: "$dates" + temp + ".tasks",
      metrics: "$dates" + temp + ".metrics",
      days: "$dates" + temp + ".days",
      random: "$dates" + temp + ".metrics.currentValue`",
      _id: 0,
    },
  };
  aggr.push(project);
  var data = await Tasks.aggregate(aggr);

  data = JSON.stringify(data);
  res.status(200).send(data);
});
const getting = async (dates) => {};
module.exports = {
  getAllTasks,
  createMainTask,
  createInnerTask,
  getInnerTask,
  updateTask,
  deleteTask,
  getPreviousTasks,
};
