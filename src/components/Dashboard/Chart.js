import React from "react";
import { Line } from "react-chartjs-2";
import PropTypes from "prop-types";

import Loader from "../Elements/Loader";

var options = {
  maintainAspectRatio: false,
  responsive: true,
  tooltips: {enabled: false},
  hover: {mode: null},
  layout: {
    padding: {
      bottom: 15,
    },
  },
  legend: {
    display: false,
  },
  scales: {
    xAxes: [
      {
        display: false,
      },
    ],
    yAxes: [
      {
        display: false,
      },
    ],
  },
  elements: {
    point: {
      radius: 0,
    },
    line: {
      borderCapStyle: "round",
      borderJoinStyle: "round",
      tension: 1,
    },
  },
};

const Chart = ({
  loader,
  stockSymbol,
  stockChange,
  data,
  stockPrice,
  changesColor,
}) => (
  <div className="stockChart">
    {loader === "" && <Loader />}
    {loader === false && (
      <div className="errorMsg">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <g>
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z" />
          </g>
        </svg>
        <p>Couldn't load chart try again in few minutes</p>
      </div>
    )}
    {loader === true && (
      <div className="stockChart__chart">
        <Line data={data} options={options} />
      </div>
    )}
    {loader ? (
      <div className="stockChart__info">
        <h3 className="stockChart__name">{stockSymbol}</h3>
        <div className="stockChart__price-info">
          <h4 className="stockChart__change" style={{color: changesColor}}>
            {stockChange}%
          </h4>
          <h3 className="stockChart__price">${stockPrice}</h3>
        </div>
      </div>
    ) : (
      <div />
    )}
  </div>
);

Chart.propTypes = {
  loader: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  stockSymbol: PropTypes.string,
  stockPrice: PropTypes.string,
  stockChange: PropTypes.string,
  changesColor: PropTypes.string,
  options: PropTypes.object,
  data: PropTypes.func,
};

export default Chart;
