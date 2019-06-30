import React from "react";
import {Line} from "react-chartjs-2";
import firebase from "firebase/app";
import "firebase/firestore";
import {logout} from "./auth";
import $ from "jquery";

const db = firebase.firestore();

var options = {
  maintainAspectRatio: false,
  responsive: true,
  /*tooltips: {
    mode: 'index',
    intersect: false,
    backgroundColor: '#373a46',
    bodyFontSize: 15,
    callbacks: {
      label: function (tooltipItems, data) {
        return '$' + tooltipItems.yLabel
      },
      title: function() {},
    },
    displayColors: false,
  },*/
  tooltips: {enabled: false},
  hover: {mode: null},
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

let allSymbols = [];

let toCheckSymbols = [];
let stockSymbols = [];
let stockPrices = [];
let stockChanges = [];
let changesColors = [];

let stockList = [];
let stockListPrices = [];
let stockListTickers = [];
let stockListChange = [];
let stockListChangeColors = [];

let tempStocksSymbols = [];
let tempStockName = [];
let tempStockPrice = [];

let portfolioStocks = [];
let portfolioShares = [];
let portfolioValue = [];
let portfolioDifference = [];
let portfolioColor = [];

(() => {
  fetch(
    "https://cloud.iexapis.com/stable/ref-data/symbols?token=pk_7a3afe7fd31b450693dc69be9b7622d6"
  )
    .then((res) => res.json())
    .then((result) => {
      allSymbols = result.map((val) => {
        return val;
      });
    });
})();

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loader1: "",
      loader2: "",
      loader3: "",
      portfolioLoader: "",
      funds: "",
      accountValue: "",
      fundsLoader: ""
    };
    this.componentDidMount = this.componentDidMount.bind(this);
    this.getAccountInfo = this.getAccountInfo.bind(this);
    function labelGen(length) {
      let result = 0;
      for (let i = 1; i < length; i++) {
        result = result + "," + i;
      }
      return result.split(",");
    }
    this.data1 = (canvas) => {
      const ctx = canvas.getContext("2d");
      const gradient = ctx.createLinearGradient(0, 0, 600, 10);
      gradient.addColorStop(0, "#7c83ff");
      gradient.addColorStop(1, "#7cf4ff");
      let gradientFill = ctx.createLinearGradient(0, 0, 0, 100);
      gradientFill.addColorStop(0, "rgba(124, 131, 255,.3)");
      gradientFill.addColorStop(0.2, "rgba(124, 244, 255,.15)");
      gradientFill.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.shadowColor = "rgba(124, 244, 255,.3)";
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
    this.data2 = (canvas) => {
      const ctx = canvas.getContext("2d");
      const gradient = ctx.createLinearGradient(0, 0, 600, 10);
      gradient.addColorStop(0, "#7c83ff");
      gradient.addColorStop(1, "#7cf4ff");
      let gradientFill = ctx.createLinearGradient(0, 0, 0, 100);
      gradientFill.addColorStop(0, "rgba(124, 131, 255,.3)");
      gradientFill.addColorStop(0.2, "rgba(124, 244, 255,.15)");
      gradientFill.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.shadowColor = "rgba(124, 244, 255,.3)";
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
    const stockApi = `https://cloud.iexapis.com/stable/stock/${symbol}/intraday-prices?token=pk_7a3afe7fd31b450693dc69be9b7622d6`;
    const lastPrice = `https://cloud.iexapis.com/stable/stock/${symbol}/price?token=pk_7a3afe7fd31b450693dc69be9b7622d6`;
    const percentageChange = `https://cloud.iexapis.com/stable/stock/${symbol}/quote?displayPercent=true&token=pk_7a3afe7fd31b450693dc69be9b7622d6`;
    let error;
    fetch(percentageChange)
      .then((res) => res.json())
      .then((result) => {
        let change = parseFloat(result.changePercent).toFixed(2);
        changeStash[num] = change;
      });
    fetch(lastPrice)
      .then((res) => res.json())
      .then((result) => {
        if (!error) {
          priceStash[num] = result.toFixed(2);
        }
      });

    fetch(stockApi)
      .then((res) => res.json())
      .then((result) => {
        for (let i = 0; i < result.length - 1; i++) {
          if (result[i].average !== null)
            dataChart.push(parseFloat(result[i].average).toFixed(2));
        }
      });
  }
  getStocksList() {
    const stocks =
      "https://cloud.iexapis.com/stable/stock/market/list/mostactive?token=pk_7a3afe7fd31b450693dc69be9b7622d6";
    fetch(stocks)
      .then((res) => res.json())
      .then((result) => {
        const gainers =
          "https://cloud.iexapis.com/stable/stock/market/list/gainers?token=pk_7a3afe7fd31b450693dc69be9b7622d6";
        let counter = 0;
        fetch(gainers)
          .then((res) => res.json())
          .then((result) => {
            for (let i = 0; i < result.length; i++) {
              tempStocksSymbols.push(result[i].symbol);
              tempStockName.push(result[i].companyName);
              tempStockPrice.push("$" + result[i].latestPrice.toFixed(2));
            }
          })
          .then(() => {
            for (let i = 0; i < 9; i++) {
              if (this.isInArray(stockSymbols, result[i].symbol.toString())) {
                stockList[i] = tempStockName[counter];
                stockListPrices[i] = tempStockPrice[counter];
                stockListTickers[i] = tempStocksSymbols[counter];
                counter++;
              } else {
                stockList[i] = result[i].companyName;
                stockListPrices[i] = "$" + result[i].latestPrice.toFixed(2);
                stockListTickers[i] = result[i].symbol;
              }
            }
          });
      })
      .then(() => {
        setTimeout(() => {
          console.log(stockListTickers);
          for (let i = 0; i < 9; i++) {
            const percentageChange = `https://cloud.iexapis.com/stable/stock/${
              stockListTickers[i]
            }/quote?displayPercent=true&token=pk_7a3afe7fd31b450693dc69be9b7622d6`;
            fetch(percentageChange)
              .then((res) => res.json())
              .then((result) => {
                stockListChange[i] = parseFloat(result.changePercent).toFixed(
                  2
                );
                if (Math.sign(stockListChange[i]) === -1) {
                  stockListChangeColors[i] = "rgb(244,84,133";
                } else if (Math.sign(stockListChange[i]) === 1) {
                  stockListChangeColors[i] = "rgb(102,249,218";
                  stockListChange[i] = "+" + stockListChange[i];
                  if (
                    stockListChange[i].charAt(0) === "+" &&
                    stockListChange[i].charAt(1) === "+"
                  )
                    stockListChange[i] = stockListChange[i].substr(1);
                } else {
                  stockListChangeColors[i] = "rgb(153,158,175";
                }
                stockListChange[i] = stockListChange[i] + "%";
              });
          }
        }, 2500);
      })
      .then(() => {
        setTimeout(() => {
          this.setState({
            loader3: true
          });
        }, 3500);
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
    function add(a, b) {
      return a + b;
    }
    portfolioStocks = [];
    portfolioDifference = [];
    let user = firebase.auth().currentUser.uid;
    let docRef = db.collection("users").doc(user);
    firebase
      .firestore()
      .collection("users")
      .doc(user)
      .collection("stocks")
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          console.log(doc.id, "=>", doc.data());
          portfolioStocks.push(doc.id);
          portfolioShares.push(this.numberWithCommas(doc.data().shares));
        });
      })
      .catch((error) => {
        console.log("Error getting document:", error);
        this.setState({
          portfolioLoader: false
        });
      });
    firebase
      .firestore()
      .collection("users")
      .doc(user)
      .collection("stocks")
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          (async () => {
            for (let i = 0; i < portfolioStocks.length; i++) {
              const lastPrice = `https://cloud.iexapis.com/stable/stock/${
                portfolioStocks[i]
              }/price?token=pk_7a3afe7fd31b450693dc69be9b7622d6`;
              await new Promise((resolve) =>
                fetch(lastPrice)
                  .then((res) => res.json())
                  .then((result) => {
                    portfolioValue.push(doc.data().shares * result);
                  })
                  .then(() => {
                    portfolioDifference[i] = this.relDiff(
                      portfolioValue[i],
                      parseFloat(doc.data().moneyPaid)
                    ).toFixed(2);
                    if (portfolioValue[i] > doc.data().moneyPaid) {
                      portfolioDifference[i] = "+" + portfolioDifference[i];
                      portfolioColor.push("#66F9DA");
                    } else if (portfolioValue[i] === doc.data().moneyPaid)
                      portfolioColor.push("#999EAF");
                    else {
                      portfolioDifference[i] = "-" + portfolioDifference[i];
                      portfolioColor.push("#F45385");
                    }
                  })
                  .then(() => {
                    docRef
                      .get()
                      .then((doc) => {
                        this.setState({
                          funds:
                            "$" +
                            this.numberWithCommas(doc.data()["currentfunds"])
                        });
                        this.setState({
                          accountValue:
                            "$" +
                            this.numberWithCommas(
                              parseFloat(doc.data()["currentfunds"]) +
                                parseFloat(portfolioValue.reduce(add, 0))
                            )
                        });
                        this.setState({
                          fundsLoader: true
                        });
                        resolve();
                      })
                      .catch((error) => {
                        console.log("Error getting document:", error);
                        this.setState({
                          portfolioLoader: false
                        });
                      });
                  })
              );
            }
            setTimeout(() => {
              if (
                portfolioStocks.length === portfolioValue.length &&
                portfolioDifference.length === portfolioStocks.length &&
                portfolioShares.length === portfolioStocks.length
              ) {
                this.setState({
                  portfolioLoader: true
                });
                document.getElementById("portfolio").style.display = "block";
              }
            }, 200);
          })();
        });
      });
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
  isInArray(arr, val) {
    return arr.indexOf(val) > -1;
  }
  componentDidMount() {
    chartData1 = [];
    chartData2 = [];
    const gainers =
      "https://cloud.iexapis.com/stable/stock/market/list/gainers?token=pk_7a3afe7fd31b450693dc69be9b7622d6";
    fetch(gainers)
      .then((res) => res.json())
      .then((result) => {
        for (let i = 0; i < result.length; i++) {
          toCheckSymbols.push(result[i].symbol);
        }
      })
      .then(() => {
        setTimeout(() => {
          if (toCheckSymbols.length > 2) {
            for (let i = 0; i < toCheckSymbols.length - 5; i++) {
              let good = 0;
              let nul = 0;
              const stockApi = `https://cloud.iexapis.com/stable/stock/${
                toCheckSymbols[i]
              }/intraday-prices?token=pk_7a3afe7fd31b450693dc69be9b7622d6`;
              fetch(stockApi)
                .then((res) => res.json())
                .then((result) => {
                  for (let b = 0; b < result.length - 1; b++) {
                    if (result[b].average === null) nul++;
                    else good++;
                  }
                  if (nul < 200 && stockSymbols.length < 3 && good > 2)
                    stockSymbols.push(toCheckSymbols[i]);
                });
            }
          } else {
            stockSymbols = toCheckSymbols.map((val) => {
              return val;
            });
          }
        }, 500);
      })
      .then(() => {
        setTimeout(() => {
          if (stockSymbols.length > 0) {
            this.getStockInfo(
              stockSymbols[0],
              chartData1,
              stockChanges,
              stockPrices,
              0
            );
            this.getStockInfo(
              stockSymbols[1],
              chartData2,
              stockChanges,
              stockPrices,
              1
            );
          }
        }, 3000);
      })
      .then(() => {
        setTimeout(() => {
          this.checkCharts();
        }, 4000);
      });
    document.title = "Trader24 - Dashboard";
    // GET CHARTS

    // STOCK LIST
    this.getStocksList();

    //READ PORTFOLIO
    this.getAccountInfo();
    fetch("https://financialmodelingprep.com/api/v3/is-the-market-open")
      .then((res) => res.json())
      .then((result) => {
        if (result.isTheStockMarketOpen)
          document.getElementById("panel__status").style.color = "#5efad7";
        else document.getElementById("panel__status").style.color = "#eb5887";
        document.getElementById(
          "panel__status"
        ).innerHTML = result.isTheStockMarketOpen
          ? "Market status: Open"
          : "Market status: Closed";
      });
    //setTimeout(() => {
    //console.clear()
    //}, 2500);
  }
  checkCharts() {
    if (
      stockChanges[0] !== undefined &&
      stockPrices[0] !== undefined &&
      chartData1.length >= 2
    ) {
      this.setState({
        loader1: true
      });
    } else {
      this.setState({
        loader1: false
      });
    }
    if (
      stockChanges[1] !== undefined &&
      stockPrices[1] !== undefined &&
      chartData2.length >= 2
    ) {
      this.setState({
        loader2: true
      });
    } else {
      this.setState({
        loader2: false
      });
    }
  }
  render() {
    let user = firebase.auth().currentUser.displayName;
    for (let i = 0; i < stockSymbols.length; i++) {
      if (Math.sign(stockChanges[i]) === -1) {
        changesColors[i] = "#f45485";
      } else if (Math.sign(stockChanges[i]) === 1) {
        changesColors[i] = "#66f9da";
        stockChanges[i] = "+" + stockChanges[i];
        if (
          stockChanges[i].charAt(0) === "+" &&
          stockChanges[i].charAt(1) === "+"
        )
          stockChanges[i] = stockChanges[i].substr(1);
      } else {
        changesColors[i] = "#999eaf";
      }
      if (document.getElementById("searchBar") === document.activeElement) {
        document.getElementById("topbar__searchbar").style.boxShadow =
          "0px 0px 30px 0px rgba(0,0,0,0.10)";
        document.getElementById("results").style.boxShadow =
          "0px 30px 20px 0px rgba(0,0,0,0.10)";
      }
    }
    return (
      <div className="Dashboard">
        <div style={{display: "flex", flexDirection: "column", width: "100%"}}>
          <div style={{display: "flex", height: "100%"}}>
            <div className="leftbar">
              <img
                className="topbar__logo"
                src={require("../images/logo.png")}
                alt="logo"
              />
              <ul className="leftbar__menu">
                <li>
                  <svg
                    style={{fill: "#5eb5f8"}}
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
                viewBox="0 0 512.016 512"
              >
                <path d="m496 240.007812h-202.667969c-8.832031 0-16-7.167968-16-16 0-8.832031 7.167969-16 16-16h202.667969c8.832031 0 16 7.167969 16 16 0 8.832032-7.167969 16-16 16zm0 0" />
                <path d="m416 320.007812c-4.097656 0-8.191406-1.558593-11.308594-4.691406-6.25-6.253906-6.25-16.386718 0-22.636718l68.695313-68.691407-68.695313-68.695312c-6.25-6.25-6.25-16.382813 0-22.632813 6.253906-6.253906 16.386719-6.253906 22.636719 0l80 80c6.25 6.25 6.25 16.382813 0 22.632813l-80 80c-3.136719 3.15625-7.230469 4.714843-11.328125 4.714843zm0 0" />
                <path d="m170.667969 512.007812c-4.566407 0-8.898438-.640624-13.226563-1.984374l-128.386718-42.773438c-17.46875-6.101562-29.054688-22.378906-29.054688-40.574219v-384c0-23.53125 19.136719-42.6679685 42.667969-42.6679685 4.5625 0 8.894531.6406255 13.226562 1.9843755l128.382813 42.773437c17.472656 6.101563 29.054687 22.378906 29.054687 40.574219v384c0 23.53125-19.132812 42.667968-42.664062 42.667968zm-128-480c-5.867188 0-10.667969 4.800782-10.667969 10.667969v384c0 4.542969 3.050781 8.765625 7.402344 10.28125l127.785156 42.582031c.917969.296876 2.113281.46875 3.480469.46875 5.867187 0 10.664062-4.800781 10.664062-10.667968v-384c0-4.542969-3.050781-8.765625-7.402343-10.28125l-127.785157-42.582032c-.917969-.296874-2.113281-.46875-3.476562-.46875zm0 0" />
                <path d="m325.332031 170.675781c-8.832031 0-16-7.167969-16-16v-96c0-14.699219-11.964843-26.667969-26.664062-26.667969h-240c-8.832031 0-16-7.167968-16-16 0-8.832031 7.167969-15.9999995 16-15.9999995h240c32.363281 0 58.664062 26.3046875 58.664062 58.6679685v96c0 8.832031-7.167969 16-16 16zm0 0" />
                <path d="m282.667969 448.007812h-85.335938c-8.832031 0-16-7.167968-16-16 0-8.832031 7.167969-16 16-16h85.335938c14.699219 0 26.664062-11.96875 26.664062-26.667968v-96c0-8.832032 7.167969-16 16-16s16 7.167968 16 16v96c0 32.363281-26.300781 58.667968-58.664062 58.667968zm0 0" />
              </svg>
            </div>
            <div className="panel">
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
                          "0px 30px 20px 0px rgba(0,0,0,0.10)";
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
              <div className="panel__container">
                <div className="panel__top">
                  <div className="panel__title">
                    <div style={{display: "flex", alignItems: "center"}}>
                      <svg
                        className="panel__popular"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                        xmlSpace="preserve"
                        version="1.1"
                        viewBox="0 0 411 261.25"
                        x="0px"
                        y="0px"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      >
                        <defs />
                        <g>
                          <path d="M314 0c-29,0 -29,44 0,44l23 0 -113 112 -92 -92c-9,-8 -22,-8 -31,0l-94 95c-21,20 10,51 30,31l79 -79 92 92c9,8 23,8 31,0l128 -129 0 23c0,29 44,29 44,0l0 -75c0,-12 -10,-22 -22,-22l-75 0z" />
                        </g>
                      </svg>
                      <h2>Gainers</h2>
                    </div>
                  </div>
                  <div className="panel__topCharts" style={{display: "flex"}}>
                    <div className="stockChart">
                      {this.state.loader1 === "" && (
                        <ul className="loader">
                          <li />
                          <li />
                          <li />
                        </ul>
                      )}
                      {this.state.loader1 === false && (
                        <h5>Couldn't load chart try again in few minutes</h5>
                      )}
                      {this.state.loader1 === true && (
                        <div className="stockChart__chart">
                          <Line data={this.data1} options={options} />
                        </div>
                      )}
                      {this.state.loader1 ? (
                        <div className="stockChart__info">
                          <h3 className="stockChart__name">
                            {stockSymbols[0]}
                          </h3>
                          <div className="stockChart__price-info">
                            <h4
                              className="stockChart__change"
                              style={{color: changesColors[0]}}
                            >
                              {stockChanges[0]}%
                            </h4>
                            <h3 className="stockChart__price">
                              ${stockPrices[0]}
                            </h3>
                          </div>
                        </div>
                      ) : (
                        <div />
                      )}
                    </div>
                    <div className="stockChart">
                      {this.state.loader2 === "" ? (
                        <ul className="loader">
                          <li />
                          <li />
                          <li />
                        </ul>
                      ) : (
                        <div />
                      )}
                      {this.state.loader2 === false && (
                        <h5>Couldn't load chart try again in few minutes</h5>
                      )}
                      {this.state.loader2 === true && (
                        <div
                          onClick={() => this.routeChange(stockSymbols[1])}
                          className="stockChart__chart"
                        >
                          <Line data={this.data2} options={options} />
                        </div>
                      )}
                      {this.state.loader2 && (
                        <div className="stockChart__info">
                          <h3 className="stockChart__name">
                            {stockSymbols[1]}
                          </h3>
                          <div className="stockChart__price-info">
                            <h4
                              className="stockChart__change"
                              style={{color: changesColors[1]}}
                            >
                              {stockChanges[1]}%
                            </h4>
                            <h3 className="stockChart__price">
                              ${stockPrices[1]}
                            </h3>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="panel__portfolio-section">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap"
                        }}
                      >
                        <svg
                          className="panel__portfolio-title"
                          xmlns="http://www.w3.org/2000/svg"
                          xmlnsXlink="http://www.w3.org/1999/xlink"
                          version="1.1"
                          x="0px"
                          y="0px"
                          viewBox="0 0 200 250"
                          enableBackground="new 0 0 200 200"
                          xmlSpace="preserve"
                        >
                          <g>
                            <g>
                              <path d="M156.811,54.528H43.159L0,97.64l96.874,96.875l3.119,3.117l3.117-3.117L200,97.64L156.811,54.528z     M99.992,187.565l-8.136-8.134L10.082,97.64l36.02-35.99h107.763l36.056,35.99l-81.793,81.792L99.992,187.565z" />
                              <g>
                                <path d="M63.434,94.079l28.423,85.353l5.017,15.083l3.119,3.117l3.117-3.117l5.018-15.083l28.409-85.353H63.434z      M99.992,181.331l-26.684-80.13h53.351L99.992,181.331z" />
                                <polygon points="74.664,101.198 5.041,101.198 5.041,94.076 62.083,94.076 41.576,59.925 47.684,56.259    " />
                                <polygon points="67.956,103.86 41.576,59.925 47.684,56.259 68.791,91.413 97.21,55.868 102.771,60.316    " />
                                <polygon points="132.02,103.86 97.21,60.316 102.771,55.868 131.185,91.413 152.288,56.259 158.396,59.925    " />
                                <polygon points="194.96,101.198 125.312,101.198 152.288,56.259 158.396,59.925 137.893,94.076 194.96,94.076         " />
                              </g>
                            </g>
                            <g>
                              <rect
                                x="96.439"
                                y="2.368"
                                width="7.123"
                                height="23.74"
                              />
                              <rect
                                x="120.786"
                                y="7.211"
                                transform="matrix(0.9238 0.3828 -0.3828 0.9238 16.7729 -46.1416)"
                                width="7.124"
                                height="23.742"
                              />
                              <rect
                                x="141.429"
                                y="21.002"
                                transform="matrix(0.7071 0.7071 -0.7071 0.7071 65.7174 -92.8988)"
                                width="7.121"
                                height="23.742"
                              />
                              <rect
                                x="63.779"
                                y="15.52"
                                transform="matrix(0.3827 0.9239 -0.9239 0.3827 64.3313 -58.112)"
                                width="23.742"
                                height="7.124"
                              />
                              <rect
                                x="43.139"
                                y="29.312"
                                transform="matrix(0.707 0.7072 -0.7072 0.707 39.3628 -29.2704)"
                                width="23.74"
                                height="7.121"
                              />
                            </g>
                          </g>
                        </svg>{" "}
                        <h2>Portfolio</h2>
                      </div>
                      <div className="panel__portfolio" id="portfolio">
                        {this.state.portfolioLoader === "" && (
                          <ul className="loader">
                            <li />
                            <li />
                            <li />
                          </ul>
                        )}
                        {this.state.portfolioLoader === false && (
                          <h5>Couldn't load chart try again in few minutes</h5>
                        )}
                        {this.state.portfolioLoader && (
                          <div>
                            <ul className="panel__portfolio-list">
                              <li>
                                <h6>SYMBOL</h6>
                                <h6>QUANTITY</h6>
                                <h6>TOTAL GAIN/LOSS (%)</h6>
                                <h6>CURRENT VALUE</h6>
                              </li>
                              {portfolioStocks.map((value, index) => {
                                return (
                                  <li key={index}>
                                    <h5>{value}</h5>
                                    <h5>{portfolioShares[index]}</h5>
                                    <h5 style={{color: portfolioColor[index]}}>
                                      {portfolioDifference[index]}%
                                    </h5>
                                    <h5>
                                      $
                                      {this.numberWithCommas(
                                        portfolioValue[index]
                                      )}
                                    </h5>
                                  </li>
                                );
                              })}
                            </ul>
                            <div className="panel__value">
                              <h5>NET WORTH</h5>
                              <h5>{this.state.accountValue}</h5>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="panel__low">
                <div className="panel__bottom-title">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 80"
                    x="0px"
                    y="0px"
                  >
                    <g data-name="Layer 2">
                      <g data-name="Layer 4">
                        <path d="M24,64A24,24,0,0,1,11.44,19.55a2,2,0,0,1,2.71,2.82C13,24.08,10,29.35,10,33a6.93,6.93,0,0,0,7,7c3.48,0,7-2.16,7-7,0-1.89-1-3.57-2.06-5.53-3-5.38-6.83-12.07,6.58-26.82a2,2,0,0,1,3.33,2.11c-4.11,10,0,13.59,5.75,18.58C42.47,25.6,48,30.42,48,40A24,24,0,0,1,24,64ZM6.2,30.84A20,20,0,1,0,44,40c0-7.76-4.39-11.59-9-15.64-4.13-3.61-8.67-7.56-8.74-14.41-5.17,7.85-3,11.62-.81,15.56C26.69,27.74,28,30.06,28,33A10.64,10.64,0,0,1,17,44,10.88,10.88,0,0,1,6,33,12.59,12.59,0,0,1,6.2,30.84Z" />
                      </g>
                    </g>
                  </svg>
                  <h3>Most Active</h3>
                </div>
                <div className="panel__bottom">
                  <div className="panel__stockList">
                    {this.state.loader3 ? (
                      <ul className="panel__list">
                        {stockList.map((value, index) => {
                          if (index < 3)
                            return (
                              <li key={index}>
                                <a href={stockListTickers[index]}>
                                  <span className="panel__fullname">
                                    <h4>{stockListTickers[index]}</h4>
                                    <h6 className="panel__name">{value}</h6>
                                  </span>
                                  <div className="panel__list-change">
                                    <h4> {stockListPrices[index]}</h4>
                                    <h5
                                      style={{
                                        color:
                                          stockListChangeColors[index] + ")",
                                        margin: "5px 0 0 0",
                                        textShadow:
                                          "0px 0px 7px " +
                                          stockListChangeColors[index] +
                                          ",0.5)"
                                      }}
                                    >
                                      {stockListChange[index]}
                                    </h5>
                                  </div>
                                </a>
                              </li>
                            );
                          else return "";
                        })}
                      </ul>
                    ) : (
                      <ul className="loader">
                        <li />
                        <li />
                        <li />
                      </ul>
                    )}
                  </div>
                  <div className="panel__stockList">
                    {this.state.loader3 ? (
                      <ul className="panel__list">
                        {stockList.map((value, index) => {
                          if (index >= 3 && index < 6)
                            return (
                              <li key={index}>
                                <a href={stockListTickers[index]}>
                                  <span className="panel__fullname">
                                    <h4>{stockListTickers[index]}</h4>
                                    <h6 className="panel__name">{value}</h6>
                                  </span>
                                  <div className="panel__list-change">
                                    <h4> {stockListPrices[index]}</h4>
                                    <h5
                                      style={{
                                        color:
                                          stockListChangeColors[index] + ")",
                                        margin: "5px 0 0 0",
                                        textShadow:
                                          "0px 0px 7px " +
                                          stockListChangeColors[index] +
                                          ",0.5)"
                                      }}
                                    >
                                      {stockListChange[index]}
                                    </h5>
                                  </div>
                                </a>
                              </li>
                            );
                          else return "";
                        })}
                      </ul>
                    ) : (
                      <ul className="loader">
                        <li />
                        <li />
                        <li />
                      </ul>
                    )}
                  </div>
                  <div className="panel__stockList">
                    {this.state.loader3 ? (
                      <ul className="panel__list">
                        {stockList.map((value, index) => {
                          if (index >= 6)
                            return (
                              <li key={index}>
                                <a href={stockListTickers[index]}>
                                  <span className="panel__fullname">
                                    <h4>{stockListTickers[index]}</h4>
                                    <h6 className="panel__name">{value}</h6>
                                  </span>
                                  <div className="panel__list-change">
                                    <h4> {stockListPrices[index]}</h4>
                                    <h5
                                      style={{
                                        color:
                                          stockListChangeColors[index] + ")",
                                        margin: "5px 0 0 0",
                                        textShadow:
                                          "0px 0px 7px " +
                                          stockListChangeColors[index] +
                                          ",0.5)"
                                      }}
                                    >
                                      {stockListChange[index]}
                                    </h5>
                                  </div>
                                </a>
                              </li>
                            );
                          else return "";
                        })}
                      </ul>
                    ) : (
                      <ul className="loader">
                        <li />
                        <li />
                        <li />
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;
