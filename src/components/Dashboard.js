import React from "react";
import { Line } from "react-chartjs-2";
import firebase from 'firebase/app';
import 'firebase/firestore';
import { logout } from './auth'

const db = firebase.firestore();

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

let chartData1 = [];
let chartData2 = [];

let stockSymbols = []
let stockPrices = []
let stockChanges = []
let changesColors = []

let stockList = []
let stockListPrices = []
let stockListTickers = []
let stockListChange = []
let stockListChangeColors = []

let portfolioStocks = []
let portfolioShares = []
let portfolioValue = []
let portfolioDifference = []
let portfolioColor = []

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loader1: "",
      loader2: "",
      loader3: "",
      funds: "",
      accountValue: ""
    }
    this.componentWillMount = this.componentWillMount.bind(this);
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
      gradient.addColorStop(0, "#7c83ff");
      gradient.addColorStop(1, "#7cf4ff");
      let gradientFill = ctx.createLinearGradient(0, 0, 0, 100);
      gradientFill.addColorStop(0, "rgba(124, 131, 255,.3)");
      gradientFill.addColorStop(0.2, "rgba(124, 244, 255,.15)");
      gradientFill.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.shadowColor = 'rgba(124, 244, 255,.3)';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;
      return {
        labels: labelGen(chartData1.length),
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
            borderWidth: 2,
            data: chartData1
          }
        ]
      };
    };
    this.data2 = canvas => {
      const ctx = canvas.getContext("2d");
      const gradient = ctx.createLinearGradient(0, 0, 600, 10);
      gradient.addColorStop(0, "#7c83ff");
      gradient.addColorStop(1, "#7cf4ff");
      let gradientFill = ctx.createLinearGradient(0, 0, 0, 100);
      gradientFill.addColorStop(0, "rgba(124, 131, 255,.3)");
      gradientFill.addColorStop(0.2, "rgba(124, 244, 255,.15)");
      gradientFill.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.shadowColor = 'rgba(124, 244, 255,.3)';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;
      return {
        labels: labelGen(chartData2.length),
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
            borderWidth: 2,
            data: chartData2
          }
        ]
      };
    };
  }
  getStockInfo(symbol, dataChart, changeStash, priceStash, num) {
    const stockApi =
      `https://cloud.iexapis.com/stable/stock/${symbol}/intraday-prices?token=pk_c4db94f67a0b42a1884238b690ab06db`
    const lastPrice =
      `https://cloud.iexapis.com/stable/stock/${symbol}/price?token=pk_c4db94f67a0b42a1884238b690ab06db`;
    const percentageChange =
      `https://cloud.iexapis.com/stable/stock/${symbol}/quote?displayPercent=true&token=pk_c4db94f67a0b42a1884238b690ab06db`;
    let error
    fetch(percentageChange)
      .then(res => res.json())
      .then(result => {
        let change = parseFloat(result.changePercent).toFixed(2);
        changeStash[num] = change
      });
    fetch(lastPrice)
      .then(res => res.json())
      .then(result => {
        if (!error) {
          priceStash[num] = result.toFixed(2)
        }
      });

    fetch(stockApi)
      .then(res => res.json())
      .then(result => {
        if (!error) {
          for (let i = 0; i < result.length - 1; i++) {
            if (result[i].average !== null) dataChart.push(parseFloat(result[i].average));
          }
        }
      });

  }
  getStocksList() {
    const stocks = "https://cloud.iexapis.com/stable/stock/market/list/mostactive?token=pk_c4db94f67a0b42a1884238b690ab06db"
    fetch(stocks)
      .then(res => res.json())
      .then(result => {
        for (let i = 0; i < 9; i++) {

            stockList[i] = result[i].companyName

          const percentageChange =
            `https://cloud.iexapis.com/stable/stock/${result[i].symbol}/quote?displayPercent=true&token=pk_c4db94f67a0b42a1884238b690ab06db`;
          stockListPrices[i] = result[i].latestPrice
          stockListTickers[i] = result[i].symbol
          fetch(percentageChange)
            .then(res => res.json())
            .then(result => {
              stockListChange[i] = parseFloat(result.changePercent).toFixed(2);
              if (Math.sign(stockListChange[i]) === -1) {
                stockListChangeColors[i] = "#f45485"
              } else if (Math.sign(stockListChange[i]) === 1) {
                stockListChangeColors[i] = "#66f9da"
                stockListChange[i] = "+" + stockListChange[i]
                if (stockListChange[i].charAt(0) === "+" && stockListChange[i].charAt(1) === "+")
                  stockListChange[i] = stockListChange[i].substr(1)
              }
              else {
                stockListChangeColors[i] = "#999eaf"
              }
              stockListChange[i] = stockListChange[i] + "%"
              this.setState({
                loader3: true
              })
            });
        }
      });
  }
  routeChange(path) {
    this.props.history.push(path);
  }
  relDiff(a, b) {
    return 100 * Math.abs((a - b) / ((a + b) / 2));
  }
  numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  getAccountInfo() {
    function add(accumulator, a) {
      return accumulator + a;
    }
    portfolioStocks = []
    portfolioDifference = []

    let user = firebase.auth().currentUser.displayName;
    let docRef = db.collection("users").doc(user);
    let i = 0
    firebase.firestore().collection('users').doc(user).collection("stocks").get().then(snapshot => {
      snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
        portfolioStocks.push(doc.id)
        portfolioShares.push(this.numberWithCommas(doc.data().shares))
        portfolioValue.push(doc.data().value)
        portfolioDifference.push(this.relDiff(doc.data().value, doc.data().moneyPaid).toFixed(2))
        if (doc.data().value > doc.data().moneyPaid) {
          portfolioDifference[i] = "+" + portfolioDifference[i]
          portfolioColor.push("#5ce569")
        }
        else {
          portfolioDifference[i] = "-" + portfolioDifference[i]
          portfolioColor.push("#ff5e57")
        }
        i++;
      });
    });

    docRef.get().then(doc => {
      this.setState({
        funds: "$" + this.numberWithCommas(doc.data()["currentfunds"])
      })
      this.setState({
        accountValue: "$" + this.numberWithCommas(parseFloat(doc.data()["currentfunds"]) + parseFloat(portfolioValue.reduce(add, 0)))
      })
    }).catch(function (error) {
      console.log("Error getting document:", error);
    });
  }
  componentWillMount() {
    const gainers = "https://cloud.iexapis.com/stable/stock/market/list/gainers?token=pk_c4db94f67a0b42a1884238b690ab06db"
    fetch(gainers)
      .then(res => res.json())
      .then(result => {
        for (let i = 0; i < 2; i++) {
          stockSymbols.push(result[i].symbol)
        }
        this.getStockInfo(stockSymbols[0], chartData1, stockChanges, stockPrices, 0)
        this.getStockInfo(stockSymbols[1], chartData2, stockChanges, stockPrices, 1)
      });

    chartData1 = []
    chartData2 = []
    document.title = "Trader24 - Dashboard"
    // GET CHARTS

    // CHECK CHARTS
    setTimeout(() => {
      if (stockChanges[0] !== undefined && stockPrices[0] !== undefined && chartData1.length >= 2) {
        this.setState({
          loader1: true
        })
      }
      else {
        this.setState({
          loader1: false
        })
      }
      if (stockChanges[1] !== undefined && stockPrices[1] !== undefined && chartData2.length >= 2) {
        this.setState({
          loader2: true
        })
      }
      else {
        this.setState({
          loader2: false
        })
      }
      // STOCK LIST
      this.getStocksList()

      //READ PORTFOLIO
      this.getAccountInfo()
    }, 1700);
    fetch("https://financialmodelingprep.com/api/v3/is-the-market-open")
      .then(res => res.json())
      .then(result => {
        if (result.isTheStockMarketOpen) document.getElementById("panel__status").style.color = "#5efad7"
        else document.getElementById("panel__status").style.color = "#eb5887"
        document.getElementById("panel__status").innerHTML = result.isTheStockMarketOpen ? "Market status: Open" : "Market status: Closed"
      })
    //setTimeout(() => {
    //console.clear()
    //}, 2500);
  }
  render() {
    let user = firebase.auth().currentUser.displayName;
    for (let i = 0; i < stockSymbols.length; i++) {
      if (Math.sign(stockChanges[i]) === -1) {
        changesColors[i] = "#f45485"
      } else if (Math.sign(stockChanges[i]) === 1) {
        changesColors[i] = "#66f9da"
        stockChanges[i] = "+" + stockChanges[i]
        if (stockChanges[i].charAt(0) === "+" && stockChanges[i].charAt(1) === "+")
          stockChanges[i] = stockChanges[i].substr(1)
      }
      else {
        changesColors[i] = "#999eaf"
      }
    }
    return (
      <div className="Dashboard">
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <div className="topbar">
            <div className="topbar__heading">
              <img className="topbar__logo" src={require("../images/logo.png")} alt="logo"></img>
              <h2>Dashboard</h2>
            </div>
            <div className="topbar__user">
              <h3>{this.state.funds}</h3>
              Hi, <span className="leftbar__name"> &nbsp;{user} !</span><svg onClick={() => logout()} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 30" x="0px" y="0px"><title>LOG OUT</title><g data-name="LOG OUT"><path d="M13,21a1,1,0,0,1-1,1H3a1,1,0,0,1-1-1V3A1,1,0,0,1,3,2h9a1,1,0,0,1,0,2H4V20h8A1,1,0,0,1,13,21Zm8.92-9.38a1,1,0,0,0-.22-.32h0l-4-4a1,1,0,0,0-1.41,1.41L18.59,11H7a1,1,0,0,0,0,2H18.59l-2.29,2.29a1,1,0,1,0,1.41,1.41l4-4h0a1,1,0,0,0,.22-1.09Z" /></g></svg></div>
          </div>
          <div style={{ display: 'flex', height: '100%' }}>
            <div className="leftbar">
              <ul className="leftbar__menu">
                <li>
                  <svg style={{ fill: "#5eb5f8" }} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 24 30" xmlSpace="preserve"><path d="M15.4,23.2H8.8c0,0-0.1,0-0.1,0c-0.4,0-0.8,0-1.2,0c0,0,0,0,0,0c-0.8,0-1.2,0-1.7-0.1c-1.8-0.4-3.3-1.9-3.7-3.7  C2,18.8,2,18.2,2,16.7v-4.4c0-1.4,0-2.4,0.1-3.2c0.1-0.9,0.2-1.5,0.5-2c0-0.1,0.1-0.2,0.1-0.3c0.3-0.5,0.8-1,1.5-1.4  C4.9,4.9,5.8,4.4,7,3.8l3.1-1.7c0.5-0.3,0.9-0.5,1.1-0.6c0.6-0.3,1-0.3,1.6,0c0.3,0.1,0.6,0.3,1.1,0.6l2.9,1.6  c1.2,0.7,2.2,1.2,2.9,1.7c0.8,0.5,1.2,1,1.5,1.6c0.3,0.6,0.5,1.2,0.6,2.1C22,9.9,22,11,22,12.4v4.3c0,1.5,0,2.1-0.1,2.7  c-0.4,1.8-1.9,3.3-3.7,3.7c-0.4,0.1-0.9,0.1-1.7,0.1c0,0-0.1,0-0.1,0c-0.1,0-0.4,0-0.8,0C15.5,23.2,15.4,23.2,15.4,23.2z M16.4,21.3  c0,0,0.1,0,0.1,0l0,0c0.7,0,1,0,1.2-0.1c1.1-0.3,2-1.1,2.2-2.2c0.1-0.3,0.1-0.9,0.1-2.2v-4.3c0-1.4,0-2.4-0.1-3.2  c-0.1-0.8-0.2-1.1-0.3-1.3c-0.1-0.2-0.3-0.5-1-0.9c-0.6-0.4-1.6-1-2.7-1.6L13,3.8c-0.5-0.3-0.7-0.4-1-0.5c0,0,0,0,0,0c0,0,0,0,0,0  c-0.2,0.1-0.5,0.3-1,0.5L8,5.5C6.8,6.2,6,6.6,5.4,7C4.8,7.4,4.6,7.7,4.5,7.9c0,0-0.1,0.1-0.1,0.2C4.3,8.3,4.1,8.6,4.1,9.3  C4,10,4,11,4,12.3v4.4c0,1.3,0,1.9,0.1,2.2c0.3,1.1,1.1,2,2.2,2.2c0.2,0.1,0.5,0.1,1.2,0.1c0.1,0,0.2,0,0.3,0v-6.7c0-0.6,0.4-1,1-1  h6.5c0.6,0,1,0.4,1,1V21.3z M9.8,15.5v5.7c2,0,3.5,0,4.5,0v-5.7H9.8z" /></svg>
                </li>
                <li>
                  <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 47 58.75" xmlSpace="preserve"><path d="M46.241,8.663c-0.003-0.052-0.007-0.104-0.016-0.156c-0.008-0.048-0.02-0.095-0.031-0.142  c-0.013-0.047-0.026-0.092-0.043-0.138c-0.018-0.047-0.038-0.091-0.06-0.136c-0.021-0.042-0.043-0.083-0.067-0.125  c-0.026-0.043-0.056-0.083-0.086-0.124c-0.028-0.037-0.057-0.072-0.088-0.106c-0.038-0.041-0.078-0.078-0.12-0.114  c-0.021-0.018-0.037-0.04-0.06-0.057c-0.013-0.01-0.026-0.016-0.039-0.025c-0.044-0.032-0.091-0.06-0.139-0.087  c-0.041-0.023-0.08-0.047-0.122-0.066c-0.041-0.019-0.085-0.034-0.129-0.049c-0.051-0.018-0.102-0.036-0.153-0.047  c-0.038-0.009-0.078-0.014-0.117-0.02c-0.061-0.009-0.12-0.017-0.181-0.019c-0.014,0-0.027-0.004-0.041-0.004  c-0.025,0-0.049,0.006-0.073,0.007c-0.061,0.003-0.119,0.008-0.179,0.018c-0.041,0.007-0.081,0.017-0.121,0.027  c-0.054,0.014-0.105,0.029-0.157,0.048c-0.041,0.016-0.08,0.034-0.119,0.052c-0.048,0.023-0.093,0.047-0.138,0.075  c-0.04,0.024-0.077,0.051-0.113,0.079c-0.04,0.03-0.078,0.06-0.115,0.094c-0.038,0.036-0.073,0.074-0.107,0.113  c-0.02,0.022-0.042,0.04-0.061,0.063L32.512,22.034v-2.3c0-0.157-0.031-0.305-0.075-0.448c-0.007-0.021-0.013-0.042-0.021-0.063  c-0.062-0.171-0.154-0.325-0.27-0.46c-0.008-0.009-0.01-0.021-0.018-0.029c-0.009-0.01-0.02-0.016-0.028-0.025  c-0.039-0.042-0.082-0.078-0.126-0.115c-0.032-0.027-0.063-0.056-0.098-0.081c-0.043-0.03-0.089-0.055-0.135-0.081  c-0.039-0.022-0.077-0.045-0.118-0.064c-0.045-0.02-0.092-0.034-0.139-0.05c-0.046-0.015-0.092-0.032-0.139-0.043  c-0.043-0.01-0.087-0.014-0.132-0.02c-0.055-0.008-0.109-0.015-0.165-0.017c-0.014,0-0.025-0.004-0.038-0.004  c-0.029,0-0.058,0.007-0.087,0.009c-0.058,0.003-0.114,0.007-0.171,0.017c-0.043,0.008-0.084,0.019-0.126,0.03  c-0.053,0.014-0.104,0.029-0.155,0.048c-0.042,0.016-0.082,0.036-0.122,0.056c-0.047,0.023-0.093,0.046-0.137,0.074  c-0.042,0.027-0.081,0.058-0.121,0.088c-0.026,0.021-0.056,0.037-0.082,0.06L17.617,29.715v-1.82c0-0.012-0.003-0.022-0.003-0.034  c-0.001-0.056-0.009-0.11-0.017-0.165c-0.006-0.044-0.009-0.088-0.019-0.131c-0.011-0.047-0.028-0.092-0.043-0.139  c-0.016-0.048-0.03-0.096-0.05-0.142c-0.017-0.038-0.04-0.074-0.06-0.111c-0.028-0.051-0.056-0.101-0.089-0.147  c-0.006-0.009-0.01-0.02-0.017-0.028c-0.02-0.026-0.043-0.046-0.064-0.07c-0.036-0.042-0.071-0.083-0.112-0.121  c-0.035-0.033-0.072-0.062-0.11-0.091c-0.039-0.03-0.077-0.061-0.118-0.086c-0.042-0.027-0.085-0.049-0.129-0.07  c-0.043-0.021-0.085-0.043-0.13-0.061c-0.046-0.018-0.094-0.03-0.142-0.044c-0.045-0.013-0.091-0.025-0.138-0.033  c-0.054-0.01-0.107-0.013-0.162-0.017c-0.032-0.002-0.063-0.01-0.097-0.01c-0.012,0-0.022,0.003-0.034,0.004  c-0.055,0.001-0.11,0.009-0.165,0.017c-0.044,0.006-0.088,0.009-0.131,0.019c-0.047,0.011-0.093,0.028-0.14,0.043  c-0.047,0.016-0.095,0.03-0.14,0.05c-0.04,0.018-0.078,0.042-0.116,0.063c-0.048,0.026-0.096,0.053-0.141,0.084  c-0.01,0.007-0.021,0.012-0.03,0.019L1.353,37.048c-0.027,0.021-0.049,0.046-0.075,0.068c-0.04,0.034-0.08,0.068-0.116,0.106  c-0.034,0.036-0.063,0.074-0.092,0.112s-0.06,0.076-0.086,0.118c-0.026,0.041-0.047,0.084-0.069,0.127  c-0.022,0.044-0.043,0.087-0.061,0.133c-0.018,0.045-0.03,0.092-0.043,0.139c-0.013,0.047-0.026,0.093-0.034,0.141  c-0.009,0.053-0.013,0.106-0.016,0.16c-0.002,0.033-0.01,0.064-0.01,0.098c0,0.012,0.003,0.022,0.003,0.034  c0.001,0.056,0.009,0.11,0.017,0.165c0.006,0.044,0.009,0.088,0.019,0.131c0.011,0.047,0.028,0.092,0.043,0.139  c0.016,0.048,0.03,0.096,0.05,0.142c0.017,0.038,0.04,0.074,0.06,0.111c0.028,0.05,0.056,0.101,0.089,0.147  c0.006,0.009,0.01,0.02,0.017,0.028c0.014,0.02,0.033,0.032,0.048,0.051c0.049,0.06,0.101,0.115,0.159,0.167  c0.03,0.026,0.061,0.052,0.092,0.076c0.056,0.042,0.115,0.079,0.176,0.113c0.033,0.019,0.065,0.039,0.1,0.055  c0.07,0.032,0.145,0.057,0.221,0.078c0.028,0.008,0.054,0.02,0.082,0.025c0.104,0.023,0.212,0.037,0.323,0.037h42.5  c0.828,0,1.5-0.672,1.5-1.5V8.75C46.25,8.72,46.243,8.692,46.241,8.663z M14.692,33.518c0.007,0.022,0.013,0.044,0.021,0.066  c0.062,0.169,0.153,0.321,0.268,0.455c0.008,0.011,0.01,0.023,0.019,0.033c0.009,0.01,0.021,0.018,0.03,0.027  c0.044,0.046,0.093,0.087,0.142,0.128c0.03,0.024,0.058,0.052,0.089,0.073c0.058,0.04,0.12,0.072,0.183,0.104  c0.027,0.014,0.052,0.031,0.08,0.043c0.085,0.037,0.175,0.064,0.268,0.085c0.007,0.002,0.013,0.005,0.02,0.007  c0.099,0.021,0.201,0.031,0.306,0.031l0,0c0,0,0,0,0,0h0c0.171,0,0.333-0.035,0.486-0.088c0.019-0.007,0.038-0.011,0.057-0.018  c0.157-0.062,0.298-0.15,0.425-0.258c0.01-0.009,0.022-0.011,0.032-0.02l12.394-11.098v3.313c0,0.03,0.007,0.058,0.009,0.087  c0.003,0.053,0.007,0.105,0.016,0.157c0.008,0.048,0.02,0.094,0.031,0.14c0.013,0.047,0.026,0.094,0.043,0.14  c0.018,0.046,0.037,0.09,0.059,0.134c0.021,0.043,0.044,0.085,0.069,0.127s0.055,0.081,0.084,0.12  c0.028,0.038,0.058,0.074,0.09,0.109c0.037,0.04,0.076,0.076,0.117,0.111c0.021,0.019,0.039,0.041,0.062,0.059  c0.009,0.007,0.019,0.009,0.027,0.015c0.116,0.087,0.244,0.156,0.383,0.207c0.027,0.009,0.053,0.017,0.08,0.024  c0.137,0.041,0.278,0.069,0.428,0.07c0.001,0,0.001,0,0.002,0c0,0,0,0,0.001,0l0,0c0.109,0,0.216-0.014,0.318-0.036  c0.027-0.006,0.053-0.017,0.079-0.024c0.076-0.021,0.15-0.044,0.222-0.076c0.033-0.016,0.064-0.035,0.097-0.053  c0.062-0.033,0.12-0.069,0.176-0.11c0.032-0.023,0.062-0.05,0.091-0.075c0.056-0.048,0.105-0.1,0.153-0.155  c0.015-0.018,0.033-0.03,0.048-0.049L43.25,13.12v23.63H6.766l7.851-5.863v2.185C14.617,33.228,14.648,33.376,14.692,33.518z" /></svg>
                </li>
                <li onClick={() => this.routeChange("stocks")}>
                  <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0.5 24.5 24 30" xmlSpace="preserve"><g><path d="M10.5,24.5c-5.523,0-10,4.478-10,10s4.478,10,10,10v-10h10C20.5,28.978,16.022,24.5,10.5,24.5z M8.5,34.5v7.747   c-3.447-0.891-6-4.026-6-7.747c0-4.411,3.589-8,8-8c3.721,0,6.856,2.554,7.747,6H10.5C9.396,32.5,8.5,33.396,8.5,34.5z" /><path d="M12.5,36.5v10c5.522,0,10-4.478,10-10H12.5z" /></g></svg>
                </li>
              </ul>
              <h5 className="panel__status" id="panel__status">$nbsp;</h5>
            </div>
            <div className="panel">
              <div className="panel__container" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="panel__top">
                  <div className="panel__title">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                    <svg className="panel__popular" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" xmlSpace="preserve" version="1.1" viewBox="0 0 411 261.25" x="0px" y="0px" fillRule="evenodd" clipRule="evenodd"><defs></defs><g><path d="M314 0c-29,0 -29,44 0,44l23 0 -113 112 -92 -92c-9,-8 -22,-8 -31,0l-94 95c-21,20 10,51 30,31l79 -79 92 92c9,8 23,8 31,0l128 -129 0 23c0,29 44,29 44,0l0 -75c0,-12 -10,-22 -22,-22l-75 0z"/></g></svg>
                      <h2>Gainers</h2>
                    </div>
                  </div>
                  <div className="panel__topCharts" style={{ display: 'flex', alignItems: 'center' }}>
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
                        <div className="stockChart__chart" onClick={() => this.routeChange(stockSymbols[0])}>
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
                        <div onClick={() => this.routeChange(stockSymbols[1])} className="stockChart__chart">
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
                    </div>          </div>
                </div>
                <div className="panel__portfolio-section">
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                    <svg className="panel__portfolio-title" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 200 250" enableBackground="new 0 0 200 200" xmlSpace="preserve"><g><g><path d="M156.811,54.528H43.159L0,97.64l96.874,96.875l3.119,3.117l3.117-3.117L200,97.64L156.811,54.528z     M99.992,187.565l-8.136-8.134L10.082,97.64l36.02-35.99h107.763l36.056,35.99l-81.793,81.792L99.992,187.565z" /><g><path d="M63.434,94.079l28.423,85.353l5.017,15.083l3.119,3.117l3.117-3.117l5.018-15.083l28.409-85.353H63.434z      M99.992,181.331l-26.684-80.13h53.351L99.992,181.331z" /><polygon points="74.664,101.198 5.041,101.198 5.041,94.076 62.083,94.076 41.576,59.925 47.684,56.259    " /><polygon points="67.956,103.86 41.576,59.925 47.684,56.259 68.791,91.413 97.21,55.868 102.771,60.316    " /><polygon points="132.02,103.86 97.21,60.316 102.771,55.868 131.185,91.413 152.288,56.259 158.396,59.925    " /><polygon points="194.96,101.198 125.312,101.198 152.288,56.259 158.396,59.925 137.893,94.076 194.96,94.076         " /></g></g><g><rect x="96.439" y="2.368" width="7.123" height="23.74" /><rect x="120.786" y="7.211" transform="matrix(0.9238 0.3828 -0.3828 0.9238 16.7729 -46.1416)" width="7.124" height="23.742" /><rect x="141.429" y="21.002" transform="matrix(0.7071 0.7071 -0.7071 0.7071 65.7174 -92.8988)" width="7.121" height="23.742" /><rect x="63.779" y="15.52" transform="matrix(0.3827 0.9239 -0.9239 0.3827 64.3313 -58.112)" width="23.742" height="7.124" /><rect x="43.139" y="29.312" transform="matrix(0.707 0.7072 -0.7072 0.707 39.3628 -29.2704)" width="23.74" height="7.121" /></g></g></svg>              <h2>Portfolio</h2>
                  </div>
                  <div className="panel__portfolio">
                    <ul className="panel__portfolio-list">
                      {portfolioStocks.map((value, index) => {
                        return <li key={index}><h5>{value}</h5><h5>{portfolioShares[index]}</h5><h5 style={{ color: portfolioColor[index] }}>{portfolioDifference[index]}%</h5><h5>${this.numberWithCommas(portfolioValue[index])}</h5></li>
                      })}
                    </ul>
                    <div className="panel__value"><h5>ACCOUNT VALUE</h5><h5>{this.state.accountValue}</h5></div>
                  </div>
                </div>
              </div>
              <div className="panel__bottom-title">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 80" x="0px" y="0px"><g data-name="Layer 2"><g data-name="Layer 4"><path d="M24,64A24,24,0,0,1,11.44,19.55a2,2,0,0,1,2.71,2.82C13,24.08,10,29.35,10,33a6.93,6.93,0,0,0,7,7c3.48,0,7-2.16,7-7,0-1.89-1-3.57-2.06-5.53-3-5.38-6.83-12.07,6.58-26.82a2,2,0,0,1,3.33,2.11c-4.11,10,0,13.59,5.75,18.58C42.47,25.6,48,30.42,48,40A24,24,0,0,1,24,64ZM6.2,30.84A20,20,0,1,0,44,40c0-7.76-4.39-11.59-9-15.64-4.13-3.61-8.67-7.56-8.74-14.41-5.17,7.85-3,11.62-.81,15.56C26.69,27.74,28,30.06,28,33A10.64,10.64,0,0,1,17,44,10.88,10.88,0,0,1,6,33,12.59,12.59,0,0,1,6.2,30.84Z" /></g></g></svg>
                  <h3>Most Active</h3>
                  </div>
              <div className="panel__bottom">
                <div className="panel__stockList">
                  {this.state.loader3 ?
                    <ul className="panel__list">
                      {stockList.map((value, index) => {
                        if (index < 3) return <li onClick={() => this.routeChange(stockListTickers[index])} key={index}><span className="panel__fullname">
                          <h4>{stockListTickers[index]}</h4><h6 className="panel__name">{value}</h6></span><div className="panel__list-change"><h4> {stockListPrices[index]}</h4><h5 style=
                            {{ color: stockListChangeColors[index], margin: '10px 0 0 0', textShadow: '0px 0px 7px ' + stockListChangeColors[index] }}>{stockListChange[index]}</h5></div></li>
                        else return ""
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
                <div className="panel__stockList">
                  {this.state.loader3 ?
                    <ul className="panel__list">
                      {stockList.map((value, index) => {
                        if (index >= 3 && index < 6) return <li onClick={() => this.routeChange(stockListTickers[index])} key={index}><span className="panel__fullname">
                        <h4>{stockListTickers[index]}</h4><h6 className="panel__name">{value}</h6></span><div className="panel__list-change"><h4> {stockListPrices[index]}</h4><h5 style=
                          {{ color: stockListChangeColors[index], margin: '10px 0 0 0', textShadow: '0px 0px 7px ' + stockListChangeColors[index] }}>{stockListChange[index]}</h5></div></li>
                      else return ""
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
                <div className="panel__stockList">
                  {this.state.loader3 ?
                    <ul className="panel__list">
                      {stockList.map((value, index) => {
                        if (index >= 6) return <li onClick={() => this.routeChange(stockListTickers[index])} key={index}><span className="panel__fullname">
                        <h4>{stockListTickers[index]}</h4><h6 className="panel__name">{value}</h6></span><div className="panel__list-change"><h4> {stockListPrices[index]}</h4><h5 style=
                          {{ color: stockListChangeColors[index], margin: '10px 0 0 0', textShadow: '0px 0px 7px ' + stockListChangeColors[index] }}>{stockListChange[index]}</h5></div></li>
                      else return ""
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
          </div>
        </div>
      </div >
    );
  }
}

export default Dashboard;
