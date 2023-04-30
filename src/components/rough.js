<div className="info-child">
<label >Completed : 
  <input type="checkbox" />
</label>
</div>



<label htmlFor="ms">just a label<input type="text" id="ms" onClick={()=>{console.log("well ")}} />
      </label>

<div className="info-child-edit-button">
<button>Edit</button>
</div>




db.collection.updateOne(
  {},
  { $set: { "myArray.tasks.$[element].value": 69 } },
  { arrayFilters: [ { "element.name":"study" } ]}
)

db.a.insertOne(
  { elements:[{name:"study",id:1},{name:"study",id:2},{name:"study",id:3},{name:"study",id:4},{name:"study",id:5},{name:"study",id:6},{name:"study"}] }
)

db.a.aggregate([{ $unwind: "$elements" },
{ $match: { "elements.name": "study" }},{$project:{elements:1}},{ $limit: 4 }
]);



db.accounts.aggregate([
  { "$match": {
    "email" : "john.doe@acme.com",
    "groups": {
      "$elemMatch": { 
        "name": "group1",
        "contacts.localId": { "$in": [ "c1","c3", null ] }
      }
    }
  }},
  { "$addFields": {
    "groups": {
      "$filter": {
        "input": {
          "$map": {
            "input": "$groups",
            "as": "g",
            "in": {
              "name": "$$g.name",
              "contacts": {
                "$filter": {
                  "input": "$$g.contacts",
                  "as": "c",
                  "cond": {
                    "$or": [
                      { "$eq": [ "$$c.localId", "c1" ] },
                      { "$eq": [ "$$c.localId", "c3" ] }
                    ]
                  } 
                }
              }
            }
          }
        },
        "as": "g",
        "cond": {
          "$and": [
            { "$eq": [ "$$g.name", "group1" ] },
            { "$gt": [ { "$size": "$$g.contacts" }, 0 ] }
          ]
        }
      }
    }
  }}
])


<div className="info-child-header">Daily Target</div>

<div className="info-child">
              <input
                className="info-child-input"
                type="number"
                placeholder="Enter Daily Target"
                value={element.requiredValue}
                id={element.name + "-required"}
                onChange={metricChangeHandler}
                onBlur={saveMetricHandler}
              />
              <label htmlFor={element.name + "-required"}>{element.name}</label>
            </div>




            // req chart
            {
              label:`Required ${metricLabel}`,
              data:dataSets[`${metricLabel}req`],
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
      
            },
            dataSets[met.name+"req"]=[met.requiredValue]
            dataSets[met.name+"req"].push(met.requiredValue)


<Link className='signin' to="/login">Sign In</Link>
