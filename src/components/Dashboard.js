import React from "react";
import { Line } from "react-chartjs-2";
import firebase from "firebase/app";
import "firebase/firestore";
import { logout } from "./auth";
import $ from "jquery";
import { Link } from "react-router-dom";

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

const apiKeys = [
  "OYMIDLPTGY6CAMP0",
  "TVARN7J9F191IFLB",
  "NOBPQ2OPX7E1XRT3",
  "7V0Q0N46CBIPHA2K"
];

let chartData1 = [];
let chartData2 = [];

let allSymbols = [];

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
    this.data1 = canvas => {
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
    this.data2 = canvas => {
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
  getChart(dataChart, symbol, callback) {
    let b = 0;
    const stockApi = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=1min&apikey=${
      apiKeys[0]
    }`;
    fetch(stockApi)
      .then(res => res.json())
      .then(result => {
        if (result["Note"] === undefined) {
        for (
          let i = Object.keys(result["Time Series (1min)"]).length - 1;
          i > 0 || callback();
          i--
        ) {
          dataChart.push(
            parseFloat(
              result["Time Series (1min)"][
                Object.keys(result["Time Series (1min)"])[i]
              ]["4. close"]
            ).toFixed(2)
          );
        }
      }
      else{
            b++;
            const stockApi = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=1min&apikey=${
              apiKeys[b]
            }`;
            fetch(stockApi)
              .then(res => res.json())
              .then(result => {
                for (
                  let i = Object.keys(result["Time Series (1min)"]).length - 1;
                  i > 0 || callback();
                  i--
                ) {
                  dataChart.push(
                    parseFloat(
                      result["Time Series (1min)"][
                        Object.keys(result["Time Series (1min)"])[i]
                      ]["4. close"]
                    ).toFixed(2)
                  );
                }
              });
            }
      });
  }
  getStockInfo(symbol, dataChart, changeStash, priceStash, num, callback) {
    const percentageChange = `https://cloud.iexapis.com/stable/stock/${symbol}/quote?displayPercent=true&token=pk_e103471603a7468f8947eeb5bd9b6b77`;
    fetch(percentageChange)
      .then(res => res.json())
      .then(result => {
        priceStash[num] = result.latestPrice.toFixed(2);
        let change = parseFloat(result.changePercent).toFixed(2);
        changeStash[num] = change;
      });
    this.getChart(dataChart, symbol, callback);
  }
  getStocksList() {
    const stocks =
      "https://cloud.iexapis.com/stable/stock/market/list/mostactive?token=pk_e103471603a7468f8947eeb5bd9b6b77";
    fetch(stocks)
      .then(res => res.json())
      .then(result => {
        const gainers =
          "https://cloud.iexapis.com/stable/stock/market/list/gainers?token=pk_e103471603a7468f8947eeb5bd9b6b77";
        let counter = 0;
        fetch(gainers)
          .then(res => res.json())
          .then(result => {
            for (let i = 0; i < result.length; i++) {
              if (result[i].latestPrice !== null) {
                tempStocksSymbols.push(result[i].symbol);
                tempStockName.push(result[i].companyName);
                tempStockPrice.push("$" + result[i].latestPrice.toFixed(2));
              }
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
          for (let i = 0; i < 9; i++) {
            const percentageChange = `https://cloud.iexapis.com/stable/stock/${
              stockListTickers[i]
            }/quote?displayPercent=true&token=pk_e103471603a7468f8947eeb5bd9b6b77`;
            fetch(percentageChange)
              .then(res => res.json())
              .then(result => {
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
              })
              .then(() => {
                setTimeout(() => {
                  this.setState({
                    loader3: true
                  });
                }, 900);
              });
          }
        }, 1000);
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
      .then(snapshot => {
        snapshot.forEach(doc => {
          console.log(doc.id, "=>", doc.data());
          portfolioStocks.push(doc.id);
          portfolioShares.push(this.numberWithCommas(doc.data().shares));
        });
      })
      .catch(error => {
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
      .then(snapshot => {
        snapshot.forEach(doc => {
          (async () => {
            for (let i = 0; i < portfolioStocks.length; i++) {
              const lastPrice = `https://cloud.iexapis.com/stable/stock/${
                portfolioStocks[i]
              }/quote?displayPercent=true&token=pk_e103471603a7468f8947eeb5bd9b6b77`;
              await new Promise(resolve =>
                fetch(lastPrice)
                  .then(res => res.json())
                  .then(result => {
                    portfolioValue.push(doc.data().shares * result.latestPrice);
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
                      .then(doc => {
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
                      .catch(error => {
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
            }, 300);
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
                `<li><a href="/stocks/${allSymbols[i].symbol}"><h4>${
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
    fetch(
      "https://cloud.iexapis.com/stable/ref-data/symbols?token=pk_e103471603a7468f8947eeb5bd9b6b77"
    )
      .then(res => res.json())
      .then(result => {
        allSymbols = result.map(val => {
          return val;
        });
      });
    chartData1 = [];
    chartData2 = [];
    const gainers =
      "https://cloud.iexapis.com/stable/stock/market/list/gainers?token=pk_e103471603a7468f8947eeb5bd9b6b77";
    fetch(gainers)
      .then(res => res.json())
      .then(result => {
        for (let i = 0; i < 4; i++) {
          stockSymbols.push(result[i].symbol);
        }
        this.getStockInfo(
          stockSymbols[0],
          chartData1,
          stockChanges,
          stockPrices,
          0,
          () => {
            setTimeout(() => {
              if (
                stockChanges[0] !== undefined &&
                stockPrices[0] !== undefined &&
                chartData1.length >= 2
              ) {
                this.setState({
                  loader1: true
                });
                document.getElementById("chartFirst").href =
                  "/stocks/" + stockSymbols[0];
              } else {
                this.setState({
                  loader1: false
                });
                document.getElementById("chartFirst").href = "#";
              }
            }, 800);
          }
        );
        this.getStockInfo(
          stockSymbols[1],
          chartData2,
          stockChanges,
          stockPrices,
          1,
          () => {
            setTimeout(() => {
              if (
                stockChanges[1] !== undefined &&
                stockPrices[1] !== undefined &&
                chartData2.length >= 2
              ) {
                this.setState({
                  loader2: true
                });
                document.getElementById("chartSecond").href =
                  "/stocks/" + stockSymbols[1];
              } else {
                this.setState({
                  loader2: false
                });
                document.getElementById("chartSecond").href = "#";
              }
            }, 800);
          }
        );
      });
    document.title = "Trader24 - Dashboard";
    // GET CHARTS

    // STOCK LIST
    this.getStocksList();

    //READ PORTFOLIO
    this.getAccountInfo();
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
    setTimeout(() => {
      if (this.state.portfolioLoader !== true) this.getAccountInfo();
    }, 5000);
    setTimeout(() => {
      if (
        stockChanges[1] !== undefined &&
        stockPrices[1] !== undefined &&
        chartData2.length >= 2
      ) {
        this.setState({
          loader2: true
        });
        document.getElementById("chartSecond").href =
          "/stocks/" + stockSymbols[1];
      } else {
        this.setState({
          loader2: false
        });
        document.getElementById("chartSecond").href = "#";
      }
      if (
        stockChanges[0] !== undefined &&
        stockPrices[0] !== undefined &&
        chartData1.length >= 2
      ) {
        this.setState({
          loader1: true
        });
        document.getElementById("chartFirst").href =
          "/stocks/" + stockSymbols[0];
      } else {
        this.setState({
          loader1: false
        });
        document.getElementById("chartFirst").href = "#";
      }
    }, 5000);
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
        <div
          style={{ display: "flex", flexDirection: "column", width: "100%" }}
        >
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
                <li>
                  <svg
                    style={{ fill: "#5eb5f8" }}
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
                        }, 300);
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
              <div className="panel__container">
                <div className="panel__top">
                  <div className="panel__title">
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <svg
                        className="panel__popular"
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#5eb5f8"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 3v18h18" />
                        <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
                      </svg>
                      <h3>Gainers</h3>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "33%"
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="panel__portfolio-title"
                        viewBox="0 0 24 24"
                      >
                        <g>
                          <path fill="none" d="M0 0h24v24H0z" />
                          <path d="M4.873 3h14.254a1 1 0 0 1 .809.412l3.823 5.256a.5.5 0 0 1-.037.633L12.367 21.602a.5.5 0 0 1-.706.028c-.007-.006-3.8-4.115-11.383-12.329a.5.5 0 0 1-.037-.633l3.823-5.256A1 1 0 0 1 4.873 3zm.51 2l-2.8 3.85L12 19.05 21.417 8.85 18.617 5H5.383z" />
                        </g>
                      </svg>
                      <h3>Portfolio</h3>
                    </div>
                  </div>
                  <div className="panel__topCharts" style={{ display: "flex" }}>
                    <a id="chartFirst" href="/" className="chartLink">
                      <div className="stockChart">
                        {this.state.loader1 === "" && (
                          <ul className="loader">
                            <li />
                            <li />
                            <li />
                          </ul>
                        )}
                        {this.state.loader1 === false && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              flexDirection: "column"
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                            >
                              <g>
                                <path fill="none" d="M0 0h24v24H0z" />
                                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z" />
                              </g>
                            </svg>
                            <h5>
                              Couldn't load chart try again in few minutes
                            </h5>
                          </div>
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
                                style={{ color: changesColors[0] }}
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
                    </a>
                    <a id="chartSecond" href="/" className="chartLink">
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
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              flexDirection: "column"
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                            >
                              <g>
                                <path fill="none" d="M0 0h24v24H0z" />
                                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z" />
                              </g>
                            </svg>
                            <h5>
                              Couldn't load chart try again in few minutes
                            </h5>
                          </div>
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
                                style={{ color: changesColors[1] }}
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
                    </a>
                    <div className="panel__portfolio-section">
                      <div className="panel__portfolio" id="portfolio">
                        {this.state.portfolioLoader === "" && (
                          <ul className="loader">
                            <li />
                            <li />
                            <li />
                          </ul>
                        )}
                        {this.state.portfolioLoader === false && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              flexDirection: "column"
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                            >
                              <g>
                                <path fill="none" d="M0 0h24v24H0z" />
                                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z" />
                              </g>
                            </svg>
                            <h5>
                              Couldn't load your portfolio try again in few
                              minutes
                            </h5>
                          </div>
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
                                    <h5
                                      style={{ color: portfolioColor[index] }}
                                    >
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
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <g>
                      <path fill="none" d="M0 0h24v24H0z" />
                      <path
                        fillRule="nonzero"
                        d="M12 23a7.5 7.5 0 0 0 7.5-7.5c0-.866-.23-1.697-.5-2.47-1.667 1.647-2.933 2.47-3.8 2.47 3.995-7 1.8-10-4.2-14 .5 5-2.796 7.274-4.138 8.537A7.5 7.5 0 0 0 12 23zm.71-17.765c3.241 2.75 3.257 4.887.753 9.274-.761 1.333.202 2.991 1.737 2.991.688 0 1.384-.2 2.119-.595a5.5 5.5 0 1 1-9.087-5.412c.126-.118.765-.685.793-.71.424-.38.773-.717 1.118-1.086 1.23-1.318 2.114-2.78 2.566-4.462z"
                      />
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
                                <Link to={"stocks/" + stockListTickers[index]}>
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
                                </Link>
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
                                <Link to={"stocks/" + stockListTickers[index]}>
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
                                </Link>
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
                                <Link to={"stocks/" + stockListTickers[index]}>
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
                                </Link>
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
