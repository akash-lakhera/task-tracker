
import {React,useState,useEffect} from 'react'
import { Chart as Chartjs,Tooltip,CategoryScale,LinearScale,PointElement,LineElement,Title,Legend } from 'chart.js'
import { Line } from 'react-chartjs-2'

function ChartBuilder(props) {
    
  Chartjs.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

  const [mapData,setMapData]=useState('')
  
    const chartData=()=>{
        const data={
          labels:mapData.map((element)=>{
                
          const k= new Date(Date.parse(element.date.substring(3,6)+element.date.substring(0,3)+element.date.substring(6) ))
      return  k.toLocaleString("en-GB",{ month: 'short', day:"numeric" })
          
          }),
          datasets:[
            {
              label:`${mapData[0].metrics[0].name}`,
              data:mapData.map((element)=>{
                return element.metrics[0].currentValue
              }),
              borderColor: '#185CEC',
              backgroundColor: '#edf8ff',
      
            }
          ]
        }

        return data
      }
      const options=(title)=>{
       // Function to create options for the charts
        return  {
          elements:{
            line:{
              borderWidth:2
            }
          },
          responsive:true,
          aspectRatio:2.8,
          maintainAspectRatio:false,
          plugins:{
            legend:{
              position:'bottom'
            },
            title:{
              display:true,
              text:title
            }
          }
        }
      }
      useEffect(()=>{
        //fetching data for the chart
        fetch(`/api/v1/previous/${props.task}/?nDays=7&date=${props.date}`).then((response)=>{
            let a = response.json();
            return a;
          }).then((dataJson) => {
            setMapData(dataJson)
          });

      },[props.task,props.rerender])
  return (
   <>
   {mapData?<Line  options={options()} data={chartData()}/>:''}
   </>
  )
}

export default ChartBuilder