import React from "react";
import { logout } from "./auth";
import firebase from "firebase/app";
import { Line } from "react-chartjs-2";
import { defaults } from "react-chartjs-2";
import $ from "jquery";
import "chartjs-plugin-annotation";

defaults.global.defaultFontStyle = "Bold";
defaults.global.defaultFontFamily = "Quicksand";
defaults.global.animation.duration = 200;

const db = firebase.firestore();
var options = {
  layout: {
    padding: {
      right: 25 //set that fits the best
    }
  },
  tooltips: {
    mode: "index",
    intersect: false,
    callbacks: {
      label: function(tooltipItems, data) {
        return "$" + tooltipItems.yLabel;
      }
    },
    displayColors: false
  },
  hover: {
    mode: "index",
    intersect: false
  },
  maintainAspectRatio: false,
  responsive: true,
  legend: {
    display: false
  },
  scales: {
    xAxes: [
      {
        display: false
      }
    ],
    fontStyle: "bold",
    yAxes: [
      {
        gridLines: {
          color: "#373a46"
        },
        fontStyle: "bold",

        ticks: {
          callback: function(value) {
            return "$" + value.toFixed(2);
          }
        }
      }
    ]
  },
  elements: {
    point: {
      radius: 0
    },
    line: {
      borderCapStyle: "round",
      borderJoinStyle: "round"
    }
  }
};

let chartData1 = [];
let labels = [];
let allSymbols = [];
let closePrice;
let stockData = {};
let keyData = [];
let keyDataLabel = [];

let twoYears = [];
let twoYearsLabels = [];

let oneYear = [];
let oneYearLabels = [];

let ytdChart = [];
let ytdLabels = [];

let oneMonth = [];
let oneMonthLabels = [];

let oneDay = [];
let oneDayLabels = [];
export default class stockPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: "",
      funds: "",
      accountValue: "",
      fundsLoader: "",
      changeColor: "",
      extendedColor: "",
      marketStatus: "",
      valid: "",
      latestPrice: ""
    };
    fetch(
      `https://cloud.iexapis.com/beta/stock/${
        this.props.symbol
      }/batch?token=pk_95c4a35c80274553987b93e74bb825d7&types=chart,quote&range=1d&changeFromClose=true`
    )
      .then(res => res.json())
      .then(result => {
        closePrice = result.quote.previousClose;
      });
    this.data1 = canvas => {
      const ctx = canvas.getContext("2d");
      const gradient = ctx.createLinearGradient(0, 0, 600, 10);
      gradient.addColorStop(0, "#7c83ff");
      gradient.addColorStop(1, "#7cf4ff");
      let gradientFill = ctx.createLinearGradient(0, 0, 0, 100);
      gradientFill.addColorStop(0, "rgba(124, 131, 255,.3)");
      gradientFill.addColorStop(0.2, "rgba(124, 244, 255,.15)");
      gradientFill.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;
      return {
        labels: labels,
        datasets: [
          {
            lineTension: 0.1,
            label: "",
            pointBorderWidth: 0,
            pointHoverRadius: 0,
            borderColor: gradient,
            backgroundColor: gradientFill,
            fill: true,
            borderWidth: 1,
            data: chartData1
          }
        ]
      };
    };
  }
  numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  routeChange(path) {
    this.props.history.push(path);
  }
  searchStocks(e) {
    document.getElementById("results").innerHTML = "";
    let b = 0;
    let filter = document.getElementById("searchBar").value.toUpperCase();
    if (e.key === "Enter") window.location = filter;
    if (filter.length === 0) {
      document.getElementById("results").innerHTML = "";
      document.getElementById("results").style.display = "none";
    } else {
      for (let i = 0; i < allSymbols.length; i++) {
        let splitSymbol = allSymbols[i].symbol.split("");
        let splitFilter = filter.split("");
        for (let a = 0; a < splitFilter.length; a++) {
          if (
            allSymbols[i].symbol.indexOf(filter) > -1 &&
            splitSymbol[a] === splitFilter[a]
          ) {
            if (a === 0) {
              document.getElementById("results").style.display = "flex";
              $("#results").append(
                `<li><a href=${allSymbols[i].symbol}><h4>${
                  allSymbols[i].symbol
                }</h4><h6>${allSymbols[i].name}</h6></a></li>`
              );
              b++;
            }
          }
        }
        if (b === 10) break;
      }
    }
  }
  getOneDayChart() {
    const anno = {
      annotations: [
        {
          borderDash: [2, 2],
          drawTime: "afterDatasetsDraw",
          type: "line",
          mode: "horizontal",
          scaleID: "y-axis-0",
          value: closePrice,
          borderColor: "#676976",
          borderWidth: 1
        }
      ]
    };
    labels = [];
    chartData1 = [];
    if (oneDay.length === 0) {
      const stockApi = `https://cloud.iexapis.com/beta/stock/${
        this.props.symbol
      }/batch?token=pk_95c4a35c80274553987b93e74bb825d7&types=chart,quote&range=1d&changeFromClose=true`;
      fetch(stockApi)
        .then(res => res.json())
        .then(result => {
          for (let i = 0; i < result.chart.length; i++) {
            if (result.chart[i].average !== null) {
              chartData1.push(result.chart[i].average.toFixed(2));
              labels.push(result.chart[i].label);
            }
          }
        })
        .then(() => {
          this.setState({
            loaded: true
          });
          chartData1.map(val => oneDay.push(val));
          labels.map(val => oneDayLabels.push(val));
        });
    } else {
      labels = oneDayLabels;
      chartData1 = oneDay;
      this.setState({
        loaded: true
      });
    }
    options.annotation = anno;
  }
  getYTDChart() {
    labels = [];
    chartData1 = [];
    if (ytdChart.length === 0) {
      const stockApi = `https://cloud.iexapis.com/beta/stock/${
        this.props.symbol
      }/batch?token=pk_95c4a35c80274553987b93e74bb825d7&types=chart,quote&range=ytd`;
      fetch(stockApi)
        .then(res => res.json())
        .then(result => {
          for (let i = 0; i < result.chart.length; i++) {
            if (result.chart[i].average !== null) {
              chartData1.push(result.chart[i].close.toFixed(2));
              labels.push(result.chart[i].label);
            }
          }
        })
        .then(() => {
          this.setState({
            loaded: true
          });
          chartData1.map(val => ytdChart.push(val));
          labels.map(val => ytdLabels.push(val));
        });
    } else {
      labels = ytdLabels;
      chartData1 = ytdChart;
      this.setState({
        loaded: true
      });
    }

    options.annotation = "";
  }
  getOneYearChart() {
    labels = [];
    chartData1 = [];
    if (oneYear.length === 0) {
      const stockApi = `https://cloud.iexapis.com/beta/stock/${
        this.props.symbol
      }/batch?token=pk_95c4a35c80274553987b93e74bb825d7&types=chart,quote&range=1y`;
      fetch(stockApi)
        .then(res => res.json())
        .then(result => {
          for (let i = 0; i < result.chart.length; i++) {
            if (result.chart[i].average !== null) {
              chartData1.push(result.chart[i].close.toFixed(2));
              labels.push(result.chart[i].label);
            }
          }
        })
        .then(() => {
          this.setState({
            loaded: true
          });
          chartData1.map(val => oneYear.push(val));
          labels.map(val => oneYearLabels.push(val));
        });
    } else {
      labels = oneYearLabels;
      chartData1 = oneYear;
      this.setState({
        loaded: true
      });
    }
    options.annotation = "";
  }
  getTwoYearChart() {
    labels = [];
    chartData1 = [];
    if (twoYears.length === 0) {
      const stockApi = `https://cloud.iexapis.com/beta/stock/${
        this.props.symbol
      }/batch?token=pk_95c4a35c80274553987b93e74bb825d7&types=chart,quote&range=2y`;
      fetch(stockApi)
        .then(res => res.json())
        .then(result => {
          for (let i = 0; i < result.chart.length; i++) {
            if (result.chart[i].average !== null) {
              chartData1.push(result.chart[i].close.toFixed(2));
              labels.push(result.chart[i].label);
            }
          }
        })
        .then(() => {
          this.setState({
            loaded: true
          });
          chartData1.map(val => twoYears.push(val));
          labels.map(val => twoYearsLabels.push(val));
        });
    } else {
      labels = twoYearsLabels;
      chartData1 = twoYears;
      this.setState({
        loaded: true
      });
    }
    options.annotation = "";
  }
  getOneMonthChart() {
    labels = [];
    chartData1 = [];
    if (oneMonth.length === 0) {
      const stockApi = `https://cloud.iexapis.com/beta/stock/${
        this.props.symbol
      }/batch?token=pk_95c4a35c80274553987b93e74bb825d7&types=chart,quote&range=1m`;
      fetch(stockApi)
        .then(res => res.json())
        .then(result => {
          for (let i = 0; i < result.chart.length; i++) {
            if (result.chart[i].average !== null) {
              chartData1.push(result.chart[i].close.toFixed(2));
              labels.push(result.chart[i].label);
            }
          }
        })
        .then(() => {
          this.setState({
            loaded: true
          });
          chartData1.map(val => oneMonth.push(val));
          labels.map(val => oneMonthLabels.push(val));
        });
    } else {
      labels = oneMonthLabels;
      chartData1 = oneMonth;
      this.setState({
        loaded: true
      });
    }
    options.annotation = "";
  }
  abbrNum(number, decPlaces) {
    decPlaces = Math.pow(10, decPlaces);
    var abbrev = ["k", "m", "b", "t"];
    for (var i = abbrev.length - 1; i >= 0; i--) {
      var size = Math.pow(10, (i + 1) * 3);
      if (size <= number) {
        number = Math.round((number * decPlaces) / size) / decPlaces;
        if (number === 1000 && i < abbrev.length - 1) {
          number = 1;
          i++;
        }
        number += abbrev[i];
        break;
      }
    }

    return number;
  }
  isInArray(arr, val) {
    return arr.indexOf(val) > -1;
  }
  changeFocus(option) {
    setTimeout(() => {
      if (option === 1) {
        document.getElementById("1d").classList.add("active");
        document.getElementById("1m").className = "";
        document.getElementById("ytd").className = "";

        document.getElementById("1y").className = "";

        document.getElementById("2y").className = "";
      }
      if (option === 2) {
        document.getElementById("1m").classList.add("active");
        document.getElementById("1d").className = "";
        document.getElementById("ytd").className = "";

        document.getElementById("1y").className = "";

        document.getElementById("2y").className = "";
      }
      if (option === 3) {
        document.getElementById("1y").classList.add("active");
        document.getElementById("1d").className = "";
        document.getElementById("ytd").className = "";

        document.getElementById("1m").className = "";

        document.getElementById("2y").className = "";
      }
      if (option === 4) {
        document.getElementById("2y").classList.add("active");
        document.getElementById("1d").className = "";
        document.getElementById("ytd").className = "";

        document.getElementById("1m").className = "";

        document.getElementById("1y").className = "";
      }
      if (option === 5) {
        document.getElementById("ytd").classList.add("active");
        document.getElementById("1d").className = "";
        document.getElementById("2y").className = "";

        document.getElementById("1m").className = "";

        document.getElementById("1y").className = "";
      }
    }, 200);
  }
  componentDidMount() {
    if (this.isInArray(this.props.symbol)) this.setState({ valid: true });
    else this.setState({ valid: false });
    fetch(
      "https://cloud.iexapis.com/stable/ref-data/symbols?token=pk_95c4a35c80274553987b93e74bb825d7"
    )
      .then(res => res.json())
      .then(result => {
        allSymbols = result.map(val => {
          return val;
        });
      });
    fetch(
      `https://cloud.iexapis.com/beta/stock/${
        this.props.symbol
      }/realtime-update?token=pk_95c4a35c80274553987b93e74bb825d7&last=3&changeFromClose=true`
    )
      .then(res => res.json())
      .then(result => {
        stockData.name = result.quote.companyName;
        stockData.previousClose = result.quote.previousClose;
        stockData.latestTime = result.quote.latestTime;
        stockData.extendedPrice = result.quote.extendedPrice;
        stockData.extendedChange = result.quote.extendedChange.toFixed(2);
        this.setState({
          latestPrice: result.quote.latestPrice.toFixed(2)
        });
        stockData.change = result.quote.change.toFixed(2);
        stockData.changePercent = (
          result.quote.changePercent / Math.pow(10, -2)
        ).toFixed(2);
        keyData[0] = this.abbrNum(result.quote.marketCap, 2);
        keyDataLabel[0] = "Market Cap ";
        keyData[1] = result.quote.peRatio;
        keyDataLabel[1] = "PE Ratio (TTM) ";

        keyData[2] = "$" + result.quote.week52High;
        keyDataLabel[2] = "52 week High";

        keyData[3] = "$" + result.quote.week52Low;
        keyDataLabel[3] = "52 Week Low ";

        keyData[4] =
          (result.quote.ytdChange / Math.pow(10, -2)).toFixed(2) + "%";
        keyDataLabel[4] = "YTD Change ";

        keyData[5] = this.numberWithCommas(result.quote.latestVolume);
        keyDataLabel[5] = "Volume ";
      })
      .then(() => {
        if (stockData.change > 0) {
          this.setState({
            changeColor: "#66F9DA"
          });
        } else {
          this.setState({
            changeColor: "#F45385"
          });
        }
        if (stockData.extendedChange > 0) {
          this.setState({
            extendedColor: "#66F9DA"
          });
        } else {
          this.setState({
            extendedColor: "#F45385"
          });
        }
      });
    document.title = "Trader24 - " + this.props.symbol;
    fetch("https://financialmodelingprep.com/api/v3/is-the-market-open")
      .then(res => res.json())
      .then(result => {
        if (result.isTheStockMarketOpen)
          document.getElementById("panel__status").style.color = "#5efad7";
        else document.getElementById("panel__status").style.color = "#eb5887";
        if (result.isTheStockMarketOpen) this.setState({ marketStatus: true });
        else this.setState({ marketStatus: false });
        document.getElementById(
          "panel__status"
        ).innerHTML = result.isTheStockMarketOpen
          ? "Market status: Open"
          : "Market status: Closed";
      });
    let user = firebase.auth().currentUser.uid;
    let docRef = db.collection("users").doc(user);

    docRef
      .get()
      .then(doc => {
        this.setState({
          funds: "$" + this.numberWithCommas(doc.data()["currentfunds"])
        });
        this.setState({
          fundsLoader: true
        });
      })
      .catch(function(error) {
        console.log("Error getting document:", error);
      });
    this.getYTDChart();
    if (this.state.marketStatus) {
      setInterval(() => {
        fetch(
          `https://cloud.iexapis.com/stable/stock/${
            this.props.symbol
          }/price?token=pk_95c4a35c80274553987b93e74bb825d7`
        )
          .then(res => res.json())
          .then(result => {
            this.setState({
              latestPrice: result.toFixed(2)
            });
          });
      }, 10000);
    }
  }
  render() {
    let user = firebase.auth().currentUser.displayName;
    return (
      <div className="stock">
        <div style={{ display: "flex", height: "100%" }}>
          <div className="leftbar">
            <svg
              className="topbar__logo"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <g>
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M3.897 17.86l3.91-3.91 2.829 2.828 4.571-4.57L17 14V9h-5l1.793 1.793-3.157 3.157-2.828-2.829-4.946 4.946A9.965 9.965 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10a9.987 9.987 0 0 1-8.103-4.14z" />
              </g>
            </svg>
            <ul className="leftbar__menu">
              <li onClick={() => this.routeChange("/dashboard")}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  version="1.1"
                  x="0px"
                  y="0px"
                  viewBox="0 0 24 30"
                  xmlSpace="preserve"
                >
                  <path d="M15.4,23.2H8.8c0,0-0.1,0-0.1,0c-0.4,0-0.8,0-1.2,0c0,0,0,0,0,0c-0.8,0-1.2,0-1.7-0.1c-1.8-0.4-3.3-1.9-3.7-3.7  C2,18.8,2,18.2,2,16.7v-4.4c0-1.4,0-2.4,0.1-3.2c0.1-0.9,0.2-1.5,0.5-2c0-0.1,0.1-0.2,0.1-0.3c0.3-0.5,0.8-1,1.5-1.4  C4.9,4.9,5.8,4.4,7,3.8l3.1-1.7c0.5-0.3,0.9-0.5,1.1-0.6c0.6-0.3,1-0.3,1.6,0c0.3,0.1,0.6,0.3,1.1,0.6l2.9,1.6  c1.2,0.7,2.2,1.2,2.9,1.7c0.8,0.5,1.2,1,1.5,1.6c0.3,0.6,0.5,1.2,0.6,2.1C22,9.9,22,11,22,12.4v4.3c0,1.5,0,2.1-0.1,2.7  c-0.4,1.8-1.9,3.3-3.7,3.7c-0.4,0.1-0.9,0.1-1.7,0.1c0,0-0.1,0-0.1,0c-0.1,0-0.4,0-0.8,0C15.5,23.2,15.4,23.2,15.4,23.2z M16.4,21.3  c0,0,0.1,0,0.1,0l0,0c0.7,0,1,0,1.2-0.1c1.1-0.3,2-1.1,2.2-2.2c0.1-0.3,0.1-0.9,0.1-2.2v-4.3c0-1.4,0-2.4-0.1-3.2  c-0.1-0.8-0.2-1.1-0.3-1.3c-0.1-0.2-0.3-0.5-1-0.9c-0.6-0.4-1.6-1-2.7-1.6L13,3.8c-0.5-0.3-0.7-0.4-1-0.5c0,0,0,0,0,0c0,0,0,0,0,0  c-0.2,0.1-0.5,0.3-1,0.5L8,5.5C6.8,6.2,6,6.6,5.4,7C4.8,7.4,4.6,7.7,4.5,7.9c0,0-0.1,0.1-0.1,0.2C4.3,8.3,4.1,8.6,4.1,9.3  C4,10,4,11,4,12.3v4.4c0,1.3,0,1.9,0.1,2.2c0.3,1.1,1.1,2,2.2,2.2c0.2,0.1,0.5,0.1,1.2,0.1c0.1,0,0.2,0,0.3,0v-6.7c0-0.6,0.4-1,1-1  h6.5c0.6,0,1,0.4,1,1V21.3z M9.8,15.5v5.7c2,0,3.5,0,4.5,0v-5.7H9.8z" />
                </svg>
              </li>
              <li>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  version="1.1"
                  x="0px"
                  y="0px"
                  viewBox="0 0 47 58.75"
                  xmlSpace="preserve"
                >
                  <path d="M46.241,8.663c-0.003-0.052-0.007-0.104-0.016-0.156c-0.008-0.048-0.02-0.095-0.031-0.142  c-0.013-0.047-0.026-0.092-0.043-0.138c-0.018-0.047-0.038-0.091-0.06-0.136c-0.021-0.042-0.043-0.083-0.067-0.125  c-0.026-0.043-0.056-0.083-0.086-0.124c-0.028-0.037-0.057-0.072-0.088-0.106c-0.038-0.041-0.078-0.078-0.12-0.114  c-0.021-0.018-0.037-0.04-0.06-0.057c-0.013-0.01-0.026-0.016-0.039-0.025c-0.044-0.032-0.091-0.06-0.139-0.087  c-0.041-0.023-0.08-0.047-0.122-0.066c-0.041-0.019-0.085-0.034-0.129-0.049c-0.051-0.018-0.102-0.036-0.153-0.047  c-0.038-0.009-0.078-0.014-0.117-0.02c-0.061-0.009-0.12-0.017-0.181-0.019c-0.014,0-0.027-0.004-0.041-0.004  c-0.025,0-0.049,0.006-0.073,0.007c-0.061,0.003-0.119,0.008-0.179,0.018c-0.041,0.007-0.081,0.017-0.121,0.027  c-0.054,0.014-0.105,0.029-0.157,0.048c-0.041,0.016-0.08,0.034-0.119,0.052c-0.048,0.023-0.093,0.047-0.138,0.075  c-0.04,0.024-0.077,0.051-0.113,0.079c-0.04,0.03-0.078,0.06-0.115,0.094c-0.038,0.036-0.073,0.074-0.107,0.113  c-0.02,0.022-0.042,0.04-0.061,0.063L32.512,22.034v-2.3c0-0.157-0.031-0.305-0.075-0.448c-0.007-0.021-0.013-0.042-0.021-0.063  c-0.062-0.171-0.154-0.325-0.27-0.46c-0.008-0.009-0.01-0.021-0.018-0.029c-0.009-0.01-0.02-0.016-0.028-0.025  c-0.039-0.042-0.082-0.078-0.126-0.115c-0.032-0.027-0.063-0.056-0.098-0.081c-0.043-0.03-0.089-0.055-0.135-0.081  c-0.039-0.022-0.077-0.045-0.118-0.064c-0.045-0.02-0.092-0.034-0.139-0.05c-0.046-0.015-0.092-0.032-0.139-0.043  c-0.043-0.01-0.087-0.014-0.132-0.02c-0.055-0.008-0.109-0.015-0.165-0.017c-0.014,0-0.025-0.004-0.038-0.004  c-0.029,0-0.058,0.007-0.087,0.009c-0.058,0.003-0.114,0.007-0.171,0.017c-0.043,0.008-0.084,0.019-0.126,0.03  c-0.053,0.014-0.104,0.029-0.155,0.048c-0.042,0.016-0.082,0.036-0.122,0.056c-0.047,0.023-0.093,0.046-0.137,0.074  c-0.042,0.027-0.081,0.058-0.121,0.088c-0.026,0.021-0.056,0.037-0.082,0.06L17.617,29.715v-1.82c0-0.012-0.003-0.022-0.003-0.034  c-0.001-0.056-0.009-0.11-0.017-0.165c-0.006-0.044-0.009-0.088-0.019-0.131c-0.011-0.047-0.028-0.092-0.043-0.139  c-0.016-0.048-0.03-0.096-0.05-0.142c-0.017-0.038-0.04-0.074-0.06-0.111c-0.028-0.051-0.056-0.101-0.089-0.147  c-0.006-0.009-0.01-0.02-0.017-0.028c-0.02-0.026-0.043-0.046-0.064-0.07c-0.036-0.042-0.071-0.083-0.112-0.121  c-0.035-0.033-0.072-0.062-0.11-0.091c-0.039-0.03-0.077-0.061-0.118-0.086c-0.042-0.027-0.085-0.049-0.129-0.07  c-0.043-0.021-0.085-0.043-0.13-0.061c-0.046-0.018-0.094-0.03-0.142-0.044c-0.045-0.013-0.091-0.025-0.138-0.033  c-0.054-0.01-0.107-0.013-0.162-0.017c-0.032-0.002-0.063-0.01-0.097-0.01c-0.012,0-0.022,0.003-0.034,0.004  c-0.055,0.001-0.11,0.009-0.165,0.017c-0.044,0.006-0.088,0.009-0.131,0.019c-0.047,0.011-0.093,0.028-0.14,0.043  c-0.047,0.016-0.095,0.03-0.14,0.05c-0.04,0.018-0.078,0.042-0.116,0.063c-0.048,0.026-0.096,0.053-0.141,0.084  c-0.01,0.007-0.021,0.012-0.03,0.019L1.353,37.048c-0.027,0.021-0.049,0.046-0.075,0.068c-0.04,0.034-0.08,0.068-0.116,0.106  c-0.034,0.036-0.063,0.074-0.092,0.112s-0.06,0.076-0.086,0.118c-0.026,0.041-0.047,0.084-0.069,0.127  c-0.022,0.044-0.043,0.087-0.061,0.133c-0.018,0.045-0.03,0.092-0.043,0.139c-0.013,0.047-0.026,0.093-0.034,0.141  c-0.009,0.053-0.013,0.106-0.016,0.16c-0.002,0.033-0.01,0.064-0.01,0.098c0,0.012,0.003,0.022,0.003,0.034  c0.001,0.056,0.009,0.11,0.017,0.165c0.006,0.044,0.009,0.088,0.019,0.131c0.011,0.047,0.028,0.092,0.043,0.139  c0.016,0.048,0.03,0.096,0.05,0.142c0.017,0.038,0.04,0.074,0.06,0.111c0.028,0.05,0.056,0.101,0.089,0.147  c0.006,0.009,0.01,0.02,0.017,0.028c0.014,0.02,0.033,0.032,0.048,0.051c0.049,0.06,0.101,0.115,0.159,0.167  c0.03,0.026,0.061,0.052,0.092,0.076c0.056,0.042,0.115,0.079,0.176,0.113c0.033,0.019,0.065,0.039,0.1,0.055  c0.07,0.032,0.145,0.057,0.221,0.078c0.028,0.008,0.054,0.02,0.082,0.025c0.104,0.023,0.212,0.037,0.323,0.037h42.5  c0.828,0,1.5-0.672,1.5-1.5V8.75C46.25,8.72,46.243,8.692,46.241,8.663z M14.692,33.518c0.007,0.022,0.013,0.044,0.021,0.066  c0.062,0.169,0.153,0.321,0.268,0.455c0.008,0.011,0.01,0.023,0.019,0.033c0.009,0.01,0.021,0.018,0.03,0.027  c0.044,0.046,0.093,0.087,0.142,0.128c0.03,0.024,0.058,0.052,0.089,0.073c0.058,0.04,0.12,0.072,0.183,0.104  c0.027,0.014,0.052,0.031,0.08,0.043c0.085,0.037,0.175,0.064,0.268,0.085c0.007,0.002,0.013,0.005,0.02,0.007  c0.099,0.021,0.201,0.031,0.306,0.031l0,0c0,0,0,0,0,0h0c0.171,0,0.333-0.035,0.486-0.088c0.019-0.007,0.038-0.011,0.057-0.018  c0.157-0.062,0.298-0.15,0.425-0.258c0.01-0.009,0.022-0.011,0.032-0.02l12.394-11.098v3.313c0,0.03,0.007,0.058,0.009,0.087  c0.003,0.053,0.007,0.105,0.016,0.157c0.008,0.048,0.02,0.094,0.031,0.14c0.013,0.047,0.026,0.094,0.043,0.14  c0.018,0.046,0.037,0.09,0.059,0.134c0.021,0.043,0.044,0.085,0.069,0.127s0.055,0.081,0.084,0.12  c0.028,0.038,0.058,0.074,0.09,0.109c0.037,0.04,0.076,0.076,0.117,0.111c0.021,0.019,0.039,0.041,0.062,0.059  c0.009,0.007,0.019,0.009,0.027,0.015c0.116,0.087,0.244,0.156,0.383,0.207c0.027,0.009,0.053,0.017,0.08,0.024  c0.137,0.041,0.278,0.069,0.428,0.07c0.001,0,0.001,0,0.002,0c0,0,0,0,0.001,0l0,0c0.109,0,0.216-0.014,0.318-0.036  c0.027-0.006,0.053-0.017,0.079-0.024c0.076-0.021,0.15-0.044,0.222-0.076c0.033-0.016,0.064-0.035,0.097-0.053  c0.062-0.033,0.12-0.069,0.176-0.11c0.032-0.023,0.062-0.05,0.091-0.075c0.056-0.048,0.105-0.1,0.153-0.155  c0.015-0.018,0.033-0.03,0.048-0.049L43.25,13.12v23.63H6.766l7.851-5.863v2.185C14.617,33.228,14.648,33.376,14.692,33.518z" />
                </svg>
              </li>
              <li onClick={() => this.routeChange("stocks")}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  version="1.1"
                  x="0px"
                  y="0px"
                  viewBox="0.5 24.5 24 30"
                  xmlSpace="preserve"
                >
                  <g>
                    <path d="M10.5,24.5c-5.523,0-10,4.478-10,10s4.478,10,10,10v-10h10C20.5,28.978,16.022,24.5,10.5,24.5z M8.5,34.5v7.747   c-3.447-0.891-6-4.026-6-7.747c0-4.411,3.589-8,8-8c3.721,0,6.856,2.554,7.747,6H10.5C9.396,32.5,8.5,33.396,8.5,34.5z" />
                    <path d="M12.5,36.5v10c5.522,0,10-4.478,10-10H12.5z" />
                  </g>
                </svg>
              </li>
            </ul>
            <h5 className="panel__status" id="panel__status">
              {" "}
            </h5>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="leftbar__log"
              onClick={() => logout()}
              viewBox="0 0 24 24"
            >
              <g>
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M4 18h2v2h12V4H6v2H4V3a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3zm2-7h7v2H6v3l-5-4 5-4v3z" />
              </g>
            </svg>
          </div>
          <div className="stockPage">
            <div className="topbar">
              <div className="topbar__searchbar" id="topbar__searchbar">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%"
                  }}
                >
                  <svg
                    enableBackground="new 0 0 250.313 250.313"
                    version="1.1"
                    viewBox="0 0 250.313 250.313"
                    xmlSpace="preserve"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="m244.19 214.6l-54.379-54.378c-0.289-0.289-0.628-0.491-0.93-0.76 10.7-16.231 16.945-35.66 16.945-56.554 0-56.837-46.075-102.91-102.91-102.91s-102.91 46.075-102.91 102.91c0 56.835 46.074 102.91 102.91 102.91 20.895 0 40.323-6.245 56.554-16.945 0.269 0.301 0.47 0.64 0.759 0.929l54.38 54.38c8.169 8.168 21.413 8.168 29.583 0 8.168-8.169 8.168-21.413 0-29.582zm-141.28-44.458c-37.134 0-67.236-30.102-67.236-67.235 0-37.134 30.103-67.236 67.236-67.236 37.132 0 67.235 30.103 67.235 67.236s-30.103 67.235-67.235 67.235z"
                      clipRule="evenodd"
                      fillRule="evenodd"
                    />
                  </svg>
                  <input
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    type="text"
                    id="searchBar"
                    onKeyUp={this.searchStocks}
                    placeholder="Search by symbol"
                    onFocus={() => {
                      if (document.getElementById("results").firstChild)
                        document.getElementById("results").style.display =
                          "flex";
                      document.getElementById(
                        "topbar__searchbar"
                      ).style.boxShadow = "0px 0px 30px 0px rgba(0,0,0,0.10)";
                      document.getElementById("results").style.boxShadow =
                        "0px 30px 30px 0px rgba(0,0,0,0.10)";
                    }}
                    onBlur={() => {
                      setTimeout(() => {
                        document.getElementById("results").style.display =
                          "none";
                      }, 400);
                      document.getElementById(
                        "topbar__searchbar"
                      ).style.boxShadow = "none";
                    }}
                    autoComplete="off"
                  />
                </div>
                <ul className="topbar__results" id="results" />
              </div>
              <div className="topbar__container">
                <div className="topbar__user">
                  {this.state.fundsLoader === true && (
                    <div className="topbar__power">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <g>
                          <path fill="none" d="M0 0h24v24H0z" />
                          <path d="M18 7h3a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h15v4zM4 9v10h16V9H4zm0-4v2h12V5H4zm11 8h3v2h-3v-2z" />
                        </g>
                      </svg>
                      <h3>{this.state.funds}</h3>
                    </div>
                  )}
                  <span className="leftbar__name"> &nbsp;{user}</span>
                </div>
              </div>
            </div>
            {this.state.loaded ? (
              <div className="stockPage__top">
                <div className="stock__chart">
                  <div className="stock__info">{stockData.companyName}</div>
                  <Line data={this.data1} options={options} />
                  <div className="stockPage__timers">
                    <h6
                      id="2y"
                      onClick={() => {
                        this.getTwoYearChart();
                        this.changeFocus(4);
                      }}
                    >
                      2Y
                    </h6>
                    <h6
                      id="1y"
                      onClick={() => {
                        this.getOneYearChart();
                        this.changeFocus(3);
                      }}
                    >
                      1Y
                    </h6>

                    <h6
                      id="ytd"
                      className="active"
                      onClick={() => {
                        this.classList = "active";
                        this.changeFocus(5);
                        this.getYTDChart();
                      }}
                    >
                      YTD
                    </h6>
                    <h6
                      id="1m"
                      onClick={function() {
                        this.changeFocus(2);
                        this.getOneMonthChart();
                      }.bind(this)}
                    >
                      1M
                    </h6>
                    <h6
                      id="1d"
                      onClick={() => {
                        this.changeFocus(1);
                        this.getOneDayChart();
                      }}
                    >
                      1D
                    </h6>
                  </div>
                </div>
                <div className="stockPage__trade">
                  <h4>{stockData.name}</h4>
                  <div className="stockPage__trade-top">
                    <h2>${this.state.latestPrice}</h2>
                    <h6 style={{ color: this.state.changeColor }}>
                      {stockData.change} ({stockData.changePercent}%)
                    </h6>
                  </div>
                  {!this.state.marketStatus && (
                    <h6>
                      Extended Hours:{" "}
                      <span style={{ color: this.state.extendedColor }}>
                        ${stockData.extendedPrice} ({stockData.extendedChange})
                      </span>
                    </h6>
                  )}
                  <h5>Buy {this.props.symbol}</h5>
                </div>
              </div>
            ) : (
              <ul className="loader">
                <li />
                <li />
                <li />
              </ul>
            )}
            <div className="stockPage__keyStats">
              <div className="data">
                <h3>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <g>
                      <path fill="none" d="M0 0h24v24H0z" />
                      <path d="M12 22C6.477 22 2 17.523 2 12c0-4.478 2.943-8.268 7-9.542v2.124A8.003 8.003 0 0 0 12 20a8.003 8.003 0 0 0 7.418-5h2.124c-1.274 4.057-5.064 7-9.542 7zm9.95-9H11V2.05c.329-.033.663-.05 1-.05 5.523 0 10 4.477 10 10 0 .337-.017.671-.05 1zM13 4.062V11h6.938A8.004 8.004 0 0 0 13 4.062z" />
                    </g>
                  </svg>{" "}
                  Key Informations
                </h3>
                <div className="stockPage__columns">
                  {keyData.map((val, index) => {
                    return (
                      <div className="data__info" key={index}>
                        <h5 className="data__label">{keyDataLabel[index]}</h5>
                        <h4>{val}</h4>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="news">
                <h3>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <g>
                      <path fill="none" d="M0 0h24v24H0z" />
                      <path d="M4.929 2.929l1.414 1.414A7.975 7.975 0 0 0 4 10c0 2.21.895 4.21 2.343 5.657L4.93 17.07A9.969 9.969 0 0 1 2 10a9.969 9.969 0 0 1 2.929-7.071zm14.142 0A9.969 9.969 0 0 1 22 10a9.969 9.969 0 0 1-2.929 7.071l-1.414-1.414A7.975 7.975 0 0 0 20 10c0-2.21-.895-4.21-2.343-5.657L19.07 2.93zM7.757 5.757l1.415 1.415A3.987 3.987 0 0 0 8 10c0 1.105.448 2.105 1.172 2.828l-1.415 1.415A5.981 5.981 0 0 1 6 10c0-1.657.672-3.157 1.757-4.243zm8.486 0A5.981 5.981 0 0 1 18 10a5.981 5.981 0 0 1-1.757 4.243l-1.415-1.415A3.987 3.987 0 0 0 16 10a3.987 3.987 0 0 0-1.172-2.828l1.415-1.415zM12 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm-1 2h2v8h-2v-8z" />
                    </g>
                  </svg>
                  Latest News
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
