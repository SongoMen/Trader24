import React from "react";
import { logout } from "./auth";
import firebase from "firebase/app";
import { Line } from "react-chartjs-2";
import { defaults } from 'react-chartjs-2'
import $ from "jquery";

defaults.global.defaultFontStyle = 'Bold'
defaults.global.defaultFontFamily = 'Quicksand'

const db = firebase.firestore();
var options = {
  tooltips: {
    mode: 'index',
    intersect: false,
    callbacks: {
      title: function() {},
      label: function (tooltipItems, data) {
        return '$' + tooltipItems.yLabel
      }
    },
    displayColors: false,
  },
  hover: {
    mode: 'index',
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
    yAxes: [{
      gridLines: {
        color: '#373a46'
      },
      fontStyle: "bold",

      ticks: {
        callback: function (value) {
          return '$' + value.toFixed(2);
        }
      }
    }]
  },
  elements: {
    point: {
      radius: 0
    },
    line: {
      borderCapStyle: "round",
      borderJoinStyle: "round",
      tension: 50
    }
  }
};

let chartData1 = [];
let chartLength = 0;

let allSymbols = [];

(() => {
  fetch("https://cloud.iexapis.com/stable/ref-data/symbols?token=pk_95c4a35c80274553987b93e74bb825d7")
    .then(res => res.json())
    .then(result => {
      allSymbols = result.map((val) => {
        return val
      })
    })
})()

export default class stockPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: "",
      funds: "",
      accountValue: "",
      lastPrice: "",
      fundsLoader:""
    };
    this.data1 = canvas => {
      function labelGen(length) {
        let result = "";
        let b = 0;
        for (let i = length; i >= 1; i--) {
          b++
          result = result + b + ","
        }
        return result.split(",");
      }
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
        labels: labelGen(chartLength),
        datasets: [
          {
            lineTension: 0.1,
            label: "",
            pointBorderWidth: 0,
            pointHoverRadius: 0,
            borderColor: gradient,
            backgroundColor: gradientFill,
            fill: true,
            borderWidth: 2,
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
  getChart() {
    const stockApi = `https://cloud.iexapis.com/stable/stock/${
      this.props.symbol
      }/intraday-prices?token=pk_95c4a35c80274553987b93e74bb825d7`;
    fetch(stockApi)
      .then(res => res.json())
      .then(result => {
        for (let i = 0; i < result.length; i++) {
          if (result[i].average !== null) {
            chartData1.push(parseFloat(result[i].average).toFixed(2));
            chartLength++
          }
        }
      })
      .then(() => {
        setTimeout(() => {
          this.setState({
            loaded: true
          });
        }, 2000);
      });
  }
  searchStocks(e) {
    document.getElementById("results").innerHTML = ""
    let b = 0
    let filter = document.getElementById("searchBar").value.toUpperCase()
    if (e.key === "Enter") window.location = filter
    if (filter.length === 0) {
      document.getElementById("results").innerHTML = ""
      document.getElementById("results").style.display = "none"
    }
    else {
      for (let i = 0; i < allSymbols.length; i++) {
        let splitSymbol = allSymbols[i].symbol.split("")
        let splitFilter = filter.split("")
        for (let a = 0; a < splitFilter.length; a++) {
          if (allSymbols[i].symbol.indexOf(filter) > -1 && splitSymbol[a] === splitFilter[a]) {
            if (a === 0) {
              document.getElementById("results").style.display = "flex"
              $("#results").append(`<li><a href=${allSymbols[i].symbol}><h4>${allSymbols[i].symbol}</h4><h6>${allSymbols[i].name}</h6></a></li>`)
              b++
            }
          }
        }
        if (b === 10) break
      }
    }
  }
  componentDidMount() {
    document.title = "Trader24 - " + this.props.symbol
    fetch("https://financialmodelingprep.com/api/v3/is-the-market-open")
      .then(res => res.json())
      .then(result => {
        if (result.isTheStockMarketOpen)
          document.getElementById("panel__status").style.color = "#5efad7";
        else document.getElementById("panel__status").style.color = "#eb5887";
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
        })
      })
      .catch(function (error) {
        console.log("Error getting document:", error);
      });
    this.getChart();
  }
  render() {
      const lastPrice =
        `https://cloud.iexapis.com/stable/stock/${this.props.symbol}/price?token=pk_95c4a35c80274553987b93e74bb825d7`;
      fetch(lastPrice)
        .then(res => res.json())
        .then(result => {
          this.setState({
            lastPrice: result.toFixed(2)
          })
        });
    const { symbol } = this.props;
    let user = firebase.auth().currentUser.displayName;
    return (
      <div className="stock">
        <div style={{ display: "flex", height: "100%" }}>
        <div className="leftbar">
              <img
                className="topbar__logo"
                src={require("../images/logo.png")}
                alt="logo"
              />
              <ul className="leftbar__menu">
                <li onClick={() => this.routeChange("dashboard")}>
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
                className="leftbar__log"
                onClick={() => logout()}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 30"
                x="0px"
                y="0px"
              >
                <title>Log Out</title>
                <g data-name="Log Out">
                  <path d="M13,21a1,1,0,0,1-1,1H3a1,1,0,0,1-1-1V3A1,1,0,0,1,3,2h9a1,1,0,0,1,0,2H4V20h8A1,1,0,0,1,13,21Zm8.92-9.38a1,1,0,0,0-.22-.32h0l-4-4a1,1,0,0,0-1.41,1.41L18.59,11H7a1,1,0,0,0,0,2H18.59l-2.29,2.29a1,1,0,1,0,1.41,1.41l4-4h0a1,1,0,0,0,.22-1.09Z" />
                </g>
              </svg>
            </div>
          {symbol}
          <div className="stockPage">
          <div className="topbar">
                <div className="topbar__searchbar" id="topbar__searchbar">
                  <div style={{display: "flex", alignItems: "center",width:"100%"}}>
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
                        ).style.boxShadow = "0px 0px 30px 0px rgba(0,0,0,0.17)";
                        document.getElementById("results").style.boxShadow =
                          "0px 0px 30px 0px rgba(0,0,0,0.17)";
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
                          version="1.1"
                          id="Layer_1"
                          x="0px"
                          y="0px"
                          viewBox="0 0 512 512"
                        >
                          <g>
                            <g>
                              <g>
                                <path
                                  d="M498.409,175.706L336.283,13.582c-8.752-8.751-20.423-13.571-32.865-13.571c-12.441,0-24.113,4.818-32.865,13.569
				L13.571,270.563C4.82,279.315,0,290.985,0,303.427c0,12.442,4.82,24.114,13.571,32.864l19.992,19.992
				c0.002,0.001,0.003,0.003,0.005,0.005c0.002,0.002,0.004,0.004,0.006,0.006l134.36,134.36H149.33
				c-5.89,0-10.666,4.775-10.666,10.666c0,5.89,4.776,10.666,10.666,10.666h59.189c0.014,0,0.027,0.001,0.041,0.001
				s0.027-0.001,0.041-0.001l154.053,0.002c5.89,0,10.666-4.776,10.666-10.666c0-5.891-4.776-10.666-10.666-10.666l-113.464-0.002
				L498.41,241.434C516.53,223.312,516.53,193.826,498.409,175.706z M483.325,226.35L226.341,483.334
				c-4.713,4.712-11.013,7.31-17.742,7.32h-0.081c-6.727-0.011-13.025-2.608-17.736-7.32L56.195,348.746L302.99,101.949
				c4.165-4.165,4.165-10.919,0-15.084c-4.166-4.165-10.918-4.165-15.085,0.001L41.11,333.663l-12.456-12.456
				c-4.721-4.721-7.321-11.035-7.321-17.779c0-6.744,2.6-13.059,7.322-17.781L285.637,28.665c4.722-4.721,11.037-7.321,17.781-7.321
				c6.744,0,13.059,2.6,17.781,7.322l57.703,57.702l-246.798,246.8c-4.165,4.164-4.165,10.918,0,15.085
				c2.083,2.082,4.813,3.123,7.542,3.123c2.729,0,5.459-1.042,7.542-3.124l246.798-246.799l89.339,89.336
				C493.128,200.593,493.127,216.546,483.325,226.35z"
                                />
                                <path
                                  d="M262.801,308.064c-4.165-4.165-10.917-4.164-15.085,0l-83.934,83.933c-4.165,4.165-4.165,10.918,0,15.085
				c2.083,2.083,4.813,3.124,7.542,3.124c2.729,0,5.459-1.042,7.542-3.124l83.934-83.933
				C266.966,318.982,266.966,312.229,262.801,308.064z"
                                />
                                <path
                                  d="M228.375,387.741l-34.425,34.425c-4.165,4.165-4.165,10.919,0,15.085c2.083,2.082,4.813,3.124,7.542,3.124
				c2.731,0,5.459-1.042,7.542-3.124l34.425-34.425c4.165-4.165,4.165-10.919,0-15.085
				C239.294,383.575,232.543,383.575,228.375,387.741z"
                                />
                                <path
                                  d="M260.054,356.065l-4.525,4.524c-4.166,4.165-4.166,10.918-0.001,15.085c2.082,2.083,4.813,3.125,7.542,3.125
				c2.729,0,5.459-1.042,7.541-3.125l4.525-4.524c4.166-4.165,4.166-10.918,0.001-15.084
				C270.974,351.901,264.219,351.9,260.054,356.065z"
                                />
                                <path
                                  d="M407.073,163.793c-2-2-4.713-3.124-7.542-3.124c-2.829,0-5.541,1.124-7.542,3.124l-45.255,45.254
				c-2,2.001-3.124,4.713-3.124,7.542s1.124,5.542,3.124,7.542l30.17,30.167c2.083,2.083,4.813,3.124,7.542,3.124
				c2.731,0,5.459-1.042,7.542-3.124l45.253-45.252c4.165-4.165,4.165-10.919,0-15.084L407.073,163.793z M384.445,231.673
				l-15.085-15.084l30.17-30.169l15.084,15.085L384.445,231.673z"
                                />
                                <path
                                  d="M320.339,80.186c2.731,0,5.461-1.042,7.543-3.126l4.525-4.527c4.164-4.166,4.163-10.92-0.003-15.084
				c-4.165-4.164-10.92-4.163-15.084,0.003l-4.525,4.527c-4.164,4.166-4.163,10.92,0.003,15.084
				C314.881,79.146,317.609,80.186,320.339,80.186z"
                                />
                                <path
                                  d="M107.215,358.057l-4.525,4.525c-4.165,4.164-4.165,10.918,0,15.085c2.083,2.082,4.813,3.123,7.542,3.123
				s5.459-1.041,7.542-3.123l4.525-4.525c4.165-4.166,4.165-10.92,0-15.085C118.133,353.891,111.381,353.891,107.215,358.057z"
                                />
                              </g>
                            </g>
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
                  <Line data={this.data1} options={options} />
                </div>
                <div className="stockPage__trade">
                  <h5>Market Price:</h5>
                  <h1>${this.state.lastPrice}</h1>
                  <h5>Buy {this.props.symbol}</h5>
                </div>
              </div>
            ) : (
                <div />
              )}
            <div className="stockPage__keyStats">
            </div>
          </div>

        </div>
      </div>
    );
  }
}
