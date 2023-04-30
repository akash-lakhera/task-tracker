import { React, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  Chart as Chartjs,
  Tooltip,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "../App.css";
function PreviousData(props) {
  Chartjs.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );
  const [searchParams] = useSearchParams();
  const { task } = useParams();
  const [data, setData] = useState("");
  const [days, setDays] = useState(30);
  let labels = {},
    dataSets = {};

  if (Object.keys(data).length) {
    //Building data for the charts
    data.forEach((element) => {
      element.metrics.forEach((met) => {
        if (!labels[met.name]) {
          const k = new Date(
            Date.parse(
              element.date.substring(3, 6) +
                element.date.substring(0, 3) +
                element.date.substring(6)
            )
          );

          labels[met.name] = [
            k.toLocaleString("en-GB", { month: "short", day: "numeric" }),
          ];

          dataSets[met.name + "cur"] = [met.currentValue];
        } else {
          const k = new Date(
            Date.parse(
              element.date.substring(3, 6) +
                element.date.substring(0, 3) +
                element.date.substring(6)
            )
          );

          labels[met.name].push(
            k.toLocaleString("en-GB", { month: "short", day: "numeric" })
          );
          dataSets[met.name + "cur"].push(met.currentValue);
        }
      });
    });
  }

  const options = (title) => {
    // Function to create options for the charts
    return {
      responsive: true,
      pointRadius: 3,
      aspectRatio: 2.8,
      maintainAspectRatio: false,
      pointBackgroundColor: "rgba(107, 109, 112,0.6)",
      plugins: {
        legend: {
          position: "bottom",
        },
        title: {
          display: true,
          text: title,
        },
      },
    };
  };
  let opt;
  const lines = () => {
    if (Object.keys(labels).length) {
      let a = Object.keys(labels).map((metricLabel) => {
        //Building Charts using the prepared data
        const data = {
          labels: labels[metricLabel],
          datasets: [
            {
              label: `Completed ${metricLabel}`,
              data: dataSets[`${metricLabel}cur`],
              borderColor: "rgb(53, 162, 235)",
              backgroundColor: "rgba(53, 162, 235, 0.5)",
            },
          ],
        };
        opt = options(metricLabel);

        return (
          //Line Chart Component
          <div key={metricLabel} className="previous-data-linechart">
            <Line options={opt} data={data} />
          </div>
        );
      });
      return a;
    }
  };
  useEffect(() => {
    let fetchUrl = `/api/v1/previous/${task}/?nDays=${days}&date=${searchParams.get(
      "date"
    )}`;
    fetch(fetchUrl)
      .then((response) => {
        return response.json();
      })
      .then((dataJson) => {
        setData(dataJson);
      });
    return () => {};
  }, [days]);
  return (
    <>
      <h1 className="previousdata-header fs-head-1 fw-1 txt-clr-4">
        Past Data for {data ? data[0].parent : null}
      </h1>
      <div className="moreDaysContainer">
        <button
          className="button-1"
          style={{ marginLeft: "auto", display: "block" }}
          onClick={() => {
            setDays((prev) => {
              return prev + 30;
            });
          }}
        >
          Add 30 Days
        </button>
      </div>
      <div>{lines()}</div>
    </>
  );
}

export default PreviousData;
