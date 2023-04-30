import {React,useState} from 'react'
import { Link } from 'react-router-dom';
import "../App.css"
function Monthly() {
    const [state,setState]=useState('')
    const date=new Date();
    const month=  date.toLocaleString("EN-GB",{month:"long"});
  
    const totalDays=new Date(date.getFullYear(),date.getMonth()+1,0).getDate();
    let a=[]
    let random;
    for (let i=1;i<=totalDays;i++)
    {
        random=new Date(date.getFullYear(),date.getMonth(), i).toLocaleDateString("EN-GB")

        a[i]= <Link to={`/particularday/?date=${random}`}>
        <li className='monthly' key={i}><div className='monthly-element'><h2 className='monthly-element-name txt-clr-3 fs-head-1 fw-2'>{i}</h2></div></li>
        </Link>
    }

  return (
    <div className="monthly-container"><h1 className='monthly-container-heading txt-clr-4 fs-head-1'>{month}</h1>
    <ul className='monthly-elements-ul'>{a}</ul>
    </div>
    
    
  )
}

export default Monthly