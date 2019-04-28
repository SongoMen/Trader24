import React from "react";
import { Line } from "react-chartjs-2";
import firebase from 'firebase/app';
import { logout } from './auth'

var options = {
  maintainAspectRatio: false,
  responsive: true,
  tooltips: { enabled: false },
  hover: { mode: null },
  legend: {
    display: false
  },
  scales: {
    xAxes: [
      {
        display: false
      }
    ],
    yAxes: [
      {
        display: false
      }
    ]
  },
  elements: {
    point: {
      radius: 0
    },
    line: {
      borderCapStyle: "round",
      borderJoinStyle: "round",
      tension: 1
    }
  }
};
let price;
let chartData1 = [];
let chartData2 = [];
let stockSymbols = ["AAPL", "MSFT"]
let stockPrices = []
let stockChanges = []
let changesColors = []
let stockList = []
let stockListPrices = []
let stockListTickers = []
let stockListLogos = []

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loader1: "",
      loader2: "",
      loader3: ""
    }
    function labelGen(length) {
      let result = 0;
      for (let i = 1; i < length; i++) {
        result = result + "," + i;
      }
      return result.split(",");
    }
    this.data1 = canvas => {
      const ctx = canvas.getContext("2d");
      const gradient = ctx.createLinearGradient(0, 0, 600, 10);
      gradient.addColorStop(0, "#ff5e57");
      gradient.addColorStop(1, "#ffd32a");
      let gradientFill = ctx.createLinearGradient(0, 0, 0, 100);
      gradientFill.addColorStop(0, "rgba(255,94,87,0.3)");
      gradientFill.addColorStop(0.2, "rgba(255,211,42,.25)");
      gradientFill.addColorStop(1, "rgba(255, 255, 255, 0)");
      return {
        labels: labelGen(40),
        datasets: [
          {
            lineTension: 0.3,
            label: "",
            pointBorderWidth: 0,
            pointHoverRadius: 0,
            borderColor: gradient,
            backgroundColor: gradientFill,
            pointBackgroundColor: gradient,
            fill: true,
            borderWidth: 5,
            data: chartData1
          }
        ]
      };
    };
    this.data2 = canvas => {
      const ctx = canvas.getContext("2d");
      const gradient = ctx.createLinearGradient(0, 0, 600, 10);
      gradient.addColorStop(0, "#ff5e57");
      gradient.addColorStop(1, "#ffd32a");
      let gradientFill = ctx.createLinearGradient(0, 0, 0, 100);
      gradientFill.addColorStop(0, "rgba(255,94,87,0.3)");
      gradientFill.addColorStop(0.2, "rgba(255,211,42,.25)");
      gradientFill.addColorStop(1, "rgba(255, 255, 255, 0)");
      return {
        labels: labelGen(40),
        datasets: [
          {
            lineTension: 0.3,
            label: "",
            pointBorderWidth: 0,
            pointHoverRadius: 0,
            borderColor: gradient,
            backgroundColor: gradientFill,
            pointBackgroundColor: gradient,
            fill: true,
            borderWidth: 5,
            data: chartData2
          }
        ]
      };
    };
  }
  getStockInfo(symbol, dataChart, changeStash, priceStash, num) {
    const stockApi =
      `https://api-v2.intrinio.com/securities/${symbol}/prices/intraday?api_key=OjNmMmQyMjFlZmU5NDAzNWQ2ZWIyNmRhY2QxNzIzMjM2`

    const lastPrice =
      `https://api-v2.intrinio.com/securities/${symbol}/prices/realtime?api_key=OjNmMmQyMjFlZmU5NDAzNWQ2ZWIyNmRhY2QxNzIzMjM2`;
    const percentageChange =
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=OLMMOMZUFXFOAOTI`;
    let error
    fetch(percentageChange)
      .then(res => res.json())
      .then(result => {
        if ("Note" in result) {
          error = true
          console.log("percentage error" + num)
        } else if (error !== true) {
          let change = parseFloat(
            result["Global Quote"]["10. change percent"]
          ).toFixed(2);
          changeStash[num] = change
        }
      });
    fetch(lastPrice)
      .then(res => res.json())
      .then(result => {
        if ("Note" in result) {
          error = true
          console.log("price error" + num)
        }
        priceStash[num] = result.last_price
      });

    fetch(stockApi)
      .then(res => res.json())
      .then(result => {
        if ("Note" in result) {
          error = true
          console.log("chart error" + num)
        } else if (error !== true) {
          for (let i = 0; i < 40; i++) {
            price = parseFloat(result.intraday_prices[i].last_price)
            dataChart.push(price);
          }
        }
      });

  }
  getStocksList() {
    const stocks = "https://api-v2.intrinio.com/companies?api_key=OjNmMmQyMjFlZmU5NDAzNWQ2ZWIyNmRhY2QxNzIzMjM2"
    fetch(stocks)
      .then(res => res.json())
      .then(result => {
        for (let i = 0; i < 4; i++) {
          stockList[i] = result.companies[i].name
          stockListTickers[i] = result.companies[i].ticker
          const lastPrice = `https://api-v2.intrinio.com/securities/${stockListTickers[i]}/prices/realtime?api_key=OjNmMmQyMjFlZmU5NDAzNWQ2ZWIyNmRhY2QxNzIzMjM2`;
          const logo = `https://api-v2.intrinio.com/companies/${stockListTickers[i]}?api_key=OjNmMmQyMjFlZmU5NDAzNWQ2ZWIyNmRhY2QxNzIzMjM2`
          fetch(lastPrice)
            .then(res => res.json())
            .then(result => {
              if ("Note" in result) {
                console.log("error")
              }
              let lastPrice = parseFloat(
                result.last_price).toFixed(2);

              stockListPrices[i] = lastPrice
            });
          fetch(logo)
            .then(res => res.json())
            .then(result => {
              if ("Note" in result) {
                console.log("error")
              }
              stockListLogos[i] = "http://logo.clearbit.com/" + result.company_url
              setTimeout(() => {
                this.setState({
                  loader3: true
                })
              }, 1000);
            });
        }
      });
  }
  componentWillMount() {
    this.getStockInfo(stockSymbols[0], chartData1, stockChanges, stockPrices, 0)
    this.getStockInfo(stockSymbols[1], chartData2, stockChanges, stockPrices, 1)
    setTimeout(() => {
      if (stockChanges[0] !== undefined && stockPrices[0] !== undefined && chartData1.length >= 10) {
        this.setState({
          loader1: true
        })
      }
      else {
        this.setState({
          loader1: false
        })
      }
      if (stockChanges[1] !== undefined && stockPrices[1] !== undefined && chartData2.length >= 10) {
        this.setState({
          loader2: true
        })
      }
      else {
        this.setState({
          loader2: false
        })
      }
    }, 1000);
    this.getStocksList()
  }
  render() {
    for (let i = 0; i < stockSymbols.length; i++) {
      if (Math.sign(stockChanges[i]) === -1) {
        changesColors[i] = "#ff5e57"
      } else if (Math.sign(stockChanges[i]) === 1) {
        changesColors[i] = "green"
        stockChanges[i] = "+" + stockChanges[i]
        if (stockChanges[i].charAt(0) === "+" && stockChanges[i].charAt(1) === "+")
          stockChanges[i] = stockChanges[i].substr(1)
      }
      else {
        changesColors[i] = "#999eaf"
      }
    }
    let user = firebase.auth().currentUser.displayName;
    return (
      <div className="Dashboard">
        <div className="leftbar">
          <div className="leftbar__heading">
            <img className="leftbar__logo" src={require("../images/logo.png")} alt="logo"></img>
            <h2>STOC3R</h2>
          </div>
          <ul className="leftbar__menu">
            <li>
              <svg style={{ fill: "#ff5e57" }} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 24 30" xmlSpace="preserve"><path d="M15.4,23.2H8.8c0,0-0.1,0-0.1,0c-0.4,0-0.8,0-1.2,0c0,0,0,0,0,0c-0.8,0-1.2,0-1.7-0.1c-1.8-0.4-3.3-1.9-3.7-3.7  C2,18.8,2,18.2,2,16.7v-4.4c0-1.4,0-2.4,0.1-3.2c0.1-0.9,0.2-1.5,0.5-2c0-0.1,0.1-0.2,0.1-0.3c0.3-0.5,0.8-1,1.5-1.4  C4.9,4.9,5.8,4.4,7,3.8l3.1-1.7c0.5-0.3,0.9-0.5,1.1-0.6c0.6-0.3,1-0.3,1.6,0c0.3,0.1,0.6,0.3,1.1,0.6l2.9,1.6  c1.2,0.7,2.2,1.2,2.9,1.7c0.8,0.5,1.2,1,1.5,1.6c0.3,0.6,0.5,1.2,0.6,2.1C22,9.9,22,11,22,12.4v4.3c0,1.5,0,2.1-0.1,2.7  c-0.4,1.8-1.9,3.3-3.7,3.7c-0.4,0.1-0.9,0.1-1.7,0.1c0,0-0.1,0-0.1,0c-0.1,0-0.4,0-0.8,0C15.5,23.2,15.4,23.2,15.4,23.2z M16.4,21.3  c0,0,0.1,0,0.1,0l0,0c0.7,0,1,0,1.2-0.1c1.1-0.3,2-1.1,2.2-2.2c0.1-0.3,0.1-0.9,0.1-2.2v-4.3c0-1.4,0-2.4-0.1-3.2  c-0.1-0.8-0.2-1.1-0.3-1.3c-0.1-0.2-0.3-0.5-1-0.9c-0.6-0.4-1.6-1-2.7-1.6L13,3.8c-0.5-0.3-0.7-0.4-1-0.5c0,0,0,0,0,0c0,0,0,0,0,0  c-0.2,0.1-0.5,0.3-1,0.5L8,5.5C6.8,6.2,6,6.6,5.4,7C4.8,7.4,4.6,7.7,4.5,7.9c0,0-0.1,0.1-0.1,0.2C4.3,8.3,4.1,8.6,4.1,9.3  C4,10,4,11,4,12.3v4.4c0,1.3,0,1.9,0.1,2.2c0.3,1.1,1.1,2,2.2,2.2c0.2,0.1,0.5,0.1,1.2,0.1c0.1,0,0.2,0,0.3,0v-6.7c0-0.6,0.4-1,1-1  h6.5c0.6,0,1,0.4,1,1V21.3z M9.8,15.5v5.7c2,0,3.5,0,4.5,0v-5.7H9.8z" /></svg>
              <h4 style={{ color: "#5d1919" }}>Home</h4>
            </li>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 47 58.75" xmlSpace="preserve"><path d="M46.241,8.663c-0.003-0.052-0.007-0.104-0.016-0.156c-0.008-0.048-0.02-0.095-0.031-0.142  c-0.013-0.047-0.026-0.092-0.043-0.138c-0.018-0.047-0.038-0.091-0.06-0.136c-0.021-0.042-0.043-0.083-0.067-0.125  c-0.026-0.043-0.056-0.083-0.086-0.124c-0.028-0.037-0.057-0.072-0.088-0.106c-0.038-0.041-0.078-0.078-0.12-0.114  c-0.021-0.018-0.037-0.04-0.06-0.057c-0.013-0.01-0.026-0.016-0.039-0.025c-0.044-0.032-0.091-0.06-0.139-0.087  c-0.041-0.023-0.08-0.047-0.122-0.066c-0.041-0.019-0.085-0.034-0.129-0.049c-0.051-0.018-0.102-0.036-0.153-0.047  c-0.038-0.009-0.078-0.014-0.117-0.02c-0.061-0.009-0.12-0.017-0.181-0.019c-0.014,0-0.027-0.004-0.041-0.004  c-0.025,0-0.049,0.006-0.073,0.007c-0.061,0.003-0.119,0.008-0.179,0.018c-0.041,0.007-0.081,0.017-0.121,0.027  c-0.054,0.014-0.105,0.029-0.157,0.048c-0.041,0.016-0.08,0.034-0.119,0.052c-0.048,0.023-0.093,0.047-0.138,0.075  c-0.04,0.024-0.077,0.051-0.113,0.079c-0.04,0.03-0.078,0.06-0.115,0.094c-0.038,0.036-0.073,0.074-0.107,0.113  c-0.02,0.022-0.042,0.04-0.061,0.063L32.512,22.034v-2.3c0-0.157-0.031-0.305-0.075-0.448c-0.007-0.021-0.013-0.042-0.021-0.063  c-0.062-0.171-0.154-0.325-0.27-0.46c-0.008-0.009-0.01-0.021-0.018-0.029c-0.009-0.01-0.02-0.016-0.028-0.025  c-0.039-0.042-0.082-0.078-0.126-0.115c-0.032-0.027-0.063-0.056-0.098-0.081c-0.043-0.03-0.089-0.055-0.135-0.081  c-0.039-0.022-0.077-0.045-0.118-0.064c-0.045-0.02-0.092-0.034-0.139-0.05c-0.046-0.015-0.092-0.032-0.139-0.043  c-0.043-0.01-0.087-0.014-0.132-0.02c-0.055-0.008-0.109-0.015-0.165-0.017c-0.014,0-0.025-0.004-0.038-0.004  c-0.029,0-0.058,0.007-0.087,0.009c-0.058,0.003-0.114,0.007-0.171,0.017c-0.043,0.008-0.084,0.019-0.126,0.03  c-0.053,0.014-0.104,0.029-0.155,0.048c-0.042,0.016-0.082,0.036-0.122,0.056c-0.047,0.023-0.093,0.046-0.137,0.074  c-0.042,0.027-0.081,0.058-0.121,0.088c-0.026,0.021-0.056,0.037-0.082,0.06L17.617,29.715v-1.82c0-0.012-0.003-0.022-0.003-0.034  c-0.001-0.056-0.009-0.11-0.017-0.165c-0.006-0.044-0.009-0.088-0.019-0.131c-0.011-0.047-0.028-0.092-0.043-0.139  c-0.016-0.048-0.03-0.096-0.05-0.142c-0.017-0.038-0.04-0.074-0.06-0.111c-0.028-0.051-0.056-0.101-0.089-0.147  c-0.006-0.009-0.01-0.02-0.017-0.028c-0.02-0.026-0.043-0.046-0.064-0.07c-0.036-0.042-0.071-0.083-0.112-0.121  c-0.035-0.033-0.072-0.062-0.11-0.091c-0.039-0.03-0.077-0.061-0.118-0.086c-0.042-0.027-0.085-0.049-0.129-0.07  c-0.043-0.021-0.085-0.043-0.13-0.061c-0.046-0.018-0.094-0.03-0.142-0.044c-0.045-0.013-0.091-0.025-0.138-0.033  c-0.054-0.01-0.107-0.013-0.162-0.017c-0.032-0.002-0.063-0.01-0.097-0.01c-0.012,0-0.022,0.003-0.034,0.004  c-0.055,0.001-0.11,0.009-0.165,0.017c-0.044,0.006-0.088,0.009-0.131,0.019c-0.047,0.011-0.093,0.028-0.14,0.043  c-0.047,0.016-0.095,0.03-0.14,0.05c-0.04,0.018-0.078,0.042-0.116,0.063c-0.048,0.026-0.096,0.053-0.141,0.084  c-0.01,0.007-0.021,0.012-0.03,0.019L1.353,37.048c-0.027,0.021-0.049,0.046-0.075,0.068c-0.04,0.034-0.08,0.068-0.116,0.106  c-0.034,0.036-0.063,0.074-0.092,0.112s-0.06,0.076-0.086,0.118c-0.026,0.041-0.047,0.084-0.069,0.127  c-0.022,0.044-0.043,0.087-0.061,0.133c-0.018,0.045-0.03,0.092-0.043,0.139c-0.013,0.047-0.026,0.093-0.034,0.141  c-0.009,0.053-0.013,0.106-0.016,0.16c-0.002,0.033-0.01,0.064-0.01,0.098c0,0.012,0.003,0.022,0.003,0.034  c0.001,0.056,0.009,0.11,0.017,0.165c0.006,0.044,0.009,0.088,0.019,0.131c0.011,0.047,0.028,0.092,0.043,0.139  c0.016,0.048,0.03,0.096,0.05,0.142c0.017,0.038,0.04,0.074,0.06,0.111c0.028,0.05,0.056,0.101,0.089,0.147  c0.006,0.009,0.01,0.02,0.017,0.028c0.014,0.02,0.033,0.032,0.048,0.051c0.049,0.06,0.101,0.115,0.159,0.167  c0.03,0.026,0.061,0.052,0.092,0.076c0.056,0.042,0.115,0.079,0.176,0.113c0.033,0.019,0.065,0.039,0.1,0.055  c0.07,0.032,0.145,0.057,0.221,0.078c0.028,0.008,0.054,0.02,0.082,0.025c0.104,0.023,0.212,0.037,0.323,0.037h42.5  c0.828,0,1.5-0.672,1.5-1.5V8.75C46.25,8.72,46.243,8.692,46.241,8.663z M14.692,33.518c0.007,0.022,0.013,0.044,0.021,0.066  c0.062,0.169,0.153,0.321,0.268,0.455c0.008,0.011,0.01,0.023,0.019,0.033c0.009,0.01,0.021,0.018,0.03,0.027  c0.044,0.046,0.093,0.087,0.142,0.128c0.03,0.024,0.058,0.052,0.089,0.073c0.058,0.04,0.12,0.072,0.183,0.104  c0.027,0.014,0.052,0.031,0.08,0.043c0.085,0.037,0.175,0.064,0.268,0.085c0.007,0.002,0.013,0.005,0.02,0.007  c0.099,0.021,0.201,0.031,0.306,0.031l0,0c0,0,0,0,0,0h0c0.171,0,0.333-0.035,0.486-0.088c0.019-0.007,0.038-0.011,0.057-0.018  c0.157-0.062,0.298-0.15,0.425-0.258c0.01-0.009,0.022-0.011,0.032-0.02l12.394-11.098v3.313c0,0.03,0.007,0.058,0.009,0.087  c0.003,0.053,0.007,0.105,0.016,0.157c0.008,0.048,0.02,0.094,0.031,0.14c0.013,0.047,0.026,0.094,0.043,0.14  c0.018,0.046,0.037,0.09,0.059,0.134c0.021,0.043,0.044,0.085,0.069,0.127s0.055,0.081,0.084,0.12  c0.028,0.038,0.058,0.074,0.09,0.109c0.037,0.04,0.076,0.076,0.117,0.111c0.021,0.019,0.039,0.041,0.062,0.059  c0.009,0.007,0.019,0.009,0.027,0.015c0.116,0.087,0.244,0.156,0.383,0.207c0.027,0.009,0.053,0.017,0.08,0.024  c0.137,0.041,0.278,0.069,0.428,0.07c0.001,0,0.001,0,0.002,0c0,0,0,0,0.001,0l0,0c0.109,0,0.216-0.014,0.318-0.036  c0.027-0.006,0.053-0.017,0.079-0.024c0.076-0.021,0.15-0.044,0.222-0.076c0.033-0.016,0.064-0.035,0.097-0.053  c0.062-0.033,0.12-0.069,0.176-0.11c0.032-0.023,0.062-0.05,0.091-0.075c0.056-0.048,0.105-0.1,0.153-0.155  c0.015-0.018,0.033-0.03,0.048-0.049L43.25,13.12v23.63H6.766l7.851-5.863v2.185C14.617,33.228,14.648,33.376,14.692,33.518z" /></svg>
              <h4>Portfolio</h4>
            </li>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0.5 24.5 24 30" xmlSpace="preserve"><g><path d="M10.5,24.5c-5.523,0-10,4.478-10,10s4.478,10,10,10v-10h10C20.5,28.978,16.022,24.5,10.5,24.5z M8.5,34.5v7.747   c-3.447-0.891-6-4.026-6-7.747c0-4.411,3.589-8,8-8c3.721,0,6.856,2.554,7.747,6H10.5C9.396,32.5,8.5,33.396,8.5,34.5z" /><path d="M12.5,36.5v10c5.522,0,10-4.478,10-10H12.5z" /></g></svg>
              <h4>All Stocks</h4>
            </li>
          </ul>
          <div className="leftbar__user">
            Hi, <span className="leftbar__name">{user} !</span>
            <h4 onClick={() => logout()}>LOGOUT</h4>
          </div>
        </div>
        <div className="panel">
          <div className="panel__title">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 80" x="0px" y="0px"><g data-name="Layer 2"><g data-name="Layer 4"><path d="M24,64A24,24,0,0,1,11.44,19.55a2,2,0,0,1,2.71,2.82C13,24.08,10,29.35,10,33a6.93,6.93,0,0,0,7,7c3.48,0,7-2.16,7-7,0-1.89-1-3.57-2.06-5.53-3-5.38-6.83-12.07,6.58-26.82a2,2,0,0,1,3.33,2.11c-4.11,10,0,13.59,5.75,18.58C42.47,25.6,48,30.42,48,40A24,24,0,0,1,24,64ZM6.2,30.84A20,20,0,1,0,44,40c0-7.76-4.39-11.59-9-15.64-4.13-3.61-8.67-7.56-8.74-14.41-5.17,7.85-3,11.62-.81,15.56C26.69,27.74,28,30.06,28,33A10.64,10.64,0,0,1,17,44,10.88,10.88,0,0,1,6,33,12.59,12.59,0,0,1,6.2,30.84Z" /></g></g></svg>
            <h2>Most Popular</h2>
          </div>
          <div className="panel__top">
            <div className="stockChart">
              {this.state.loader1 === "" ? (
                <ul className="loader">
                  <li></li>
                  <li></li>
                  <li></li>
                </ul>
              ) : (
                  <div />
                )}
              {this.state.loader1 === false ? (
                <h5>Couldn't load chart try again in few minutes</h5>
              ) : (
                  <div />
                )}
              {this.state.loader1 === true ? (
                <div className="stockChart__chart">

                  <Line data={this.data1} options={options} />
                </div>
              ) : (
                  <div />
                )}
              {this.state.loader1 ? (
                <div className="stockChart__info">
                  <h3 className="stockChart__name">{stockSymbols[0]}</h3>
                  <div className="stockChart__price-info">
                    <h4 className="stockChart__change" style={{ color: changesColors[0] }}>{stockChanges[0]}%</h4>
                    <h3 className="stockChart__price">${stockPrices[0]}</h3>
                  </div>
                </div>
              ) : (
                  <div />
                )}
            </div>
            <div className="stockChart">
              {this.state.loader2 === "" ? (
                <ul className="loader">
                  <li></li>
                  <li></li>
                  <li></li>
                </ul>
              ) : (
                  <div />
                )}
              {this.state.loader2 === false ? (
                <h5>Couldn't load chart try again in few minutes</h5>
              ) : (
                  <div />
                )}
              {this.state.loader2 === true ? (
                <div className="stockChart__chart">
                  <Line data={this.data2} options={options} />
                </div>
              ) : (
                  <div />
                )}
              {this.state.loader2 ? (
                <div className="stockChart__info">
                  <h3 className="stockChart__name">{stockSymbols[1]}</h3>
                  <div className="stockChart__price-info">
                    <h4 className="stockChart__change" style={{ color: changesColors[1] }}>{stockChanges[1]}%</h4>
                    <h3 className="stockChart__price">${stockPrices[1]}</h3>
                  </div>
                </div>
              ) : (
                  <div />
                )}
            </div>
            <div className="panel__portfolio"></div>
          </div>
          <div className="panel__bottom">
            <div className="panel__stockList">
              <h3>More Stocks</h3>
              {this.state.loader3 ?
                <ul className="panel__list">
                  {stockList.map((value, index) => {
                    return <li key={index}><span><img alt={value} src={stockListLogos[index]}></img><h4>{value}</h4></span><h4>${stockListPrices[index]}</h4></li>
                  })}
                </ul>
                :
                <ul className="loader">
                  <li></li>
                  <li></li>
                  <li></li>
                </ul>
              }
            </div>
          </div>
        </div>
      </div >
    );
  }
}

export default Dashboard;
