import React from "react";
import {Line} from "react-chartjs-2";
import firebase from "firebase/app";
import "firebase/firestore";
import $ from "jquery";
import {Link} from "react-router-dom";
import Leftbar from "./leftbar";

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
  layout: {
    padding: {
      bottom: 15
    }
  },
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

let timeout;

function Alert() {
  if (
    sessionStorage.getItem("alert") === "true" ||
    sessionStorage.getItem("alert") === null
  ) {
    return (
      <div className="alertMessage" id="alertMessage">
        <h2>HELLO !</h2>
        <p>
          This application is in pre-alpha. It means you might have problem with
          responsiveness, buing/selling stocks and due to my api provider, there
          is a limit in loading charts.
        </p>
        <button
          onClick={() => {
            document.getElementById("alertMessage").outerHTML = "";
            sessionStorage.setItem("alert", "false");
          }}
          className="alertMessage__button"
        >
          OK
        </button>
      </div>
    );
  } else {
    return <div />;
  }
}

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
      gradientFill.addColorStop(0.1, "rgba(124, 131, 255,.3)");
      gradientFill.addColorStop(0.8, "rgba(55, 58, 70, 0)");
      ctx.shadowColor = "rgba(124, 131, 255,.3)";
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
      gradientFill.addColorStop(0.1, "rgba(124, 131, 255,.3)");
      gradientFill.addColorStop(0.8, "rgba(55, 58, 70, 0)");
      ctx.shadowColor = "rgba(124, 131, 255,.3)";
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
      .then((res) => res.json())
      .then((result) => {
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
        } else {
          if (result["Note"] === undefined) {
            b++;
            const stockApi = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=1min&apikey=${
              apiKeys[b]
            }`;
            fetch(stockApi)
              .then((res) => res.json())
              .then((result) => {
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
          } else {
            if (result["Note"] === undefined) {
              b++;
              const stockApi = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=1min&apikey=${
                apiKeys[b]
              }`;
              fetch(stockApi)
                .then((res) => res.json())
                .then((result) => {
                  for (
                    let i =
                      Object.keys(result["Time Series (1min)"]).length - 1;
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
          }
        }
      });
  }
  getStockInfo(symbol, dataChart, changeStash, priceStash, num, callback) {
    const percentageChange = `https://cloud.iexapis.com/stable/stock/${symbol}/quote?displayPercent=true&token=pk_e103471603a7468f8947eeb5bd9b6b77`;
    fetch(percentageChange)
      .then((res) => res.json())
      .then((result) => {
        if (result.latestPrice !== null)
          priceStash[num] = result.latestPrice.toFixed(2);
        if (result.changePercent !== null)
          changeStash[num] = parseFloat(result.changePercent).toFixed(2);
      });
    this.getChart(dataChart, symbol, callback);
  }
  getStocksList() {
    const stocks =
      "https://cloud.iexapis.com/stable/stock/market/list/mostactive?token=pk_e103471603a7468f8947eeb5bd9b6b77";
    fetch(stocks)
      .then((res) => res.json())
      .then((result) => {
        const gainers =
          "https://cloud.iexapis.com/stable/stock/market/list/gainers?token=pk_e103471603a7468f8947eeb5bd9b6b77";
        let counter = 0;
        fetch(gainers)
          .then((res) => res.json())
          .then((result) => {
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
              })
              .then(() => {
                setTimeout(() => {
                  this.setState({
                    loader3: true
                  });
                }, 900);
              });
          }
        }, 1500);
      });
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
        if (snapshot.docs.length !== 0) {
          snapshot.forEach((doc) => {
            console.log(doc.id, "=>", doc.data());
            portfolioStocks.push(doc.id);
            portfolioShares.push(this.numberWithCommas(doc.data().shares));
          });
        } else {
          this.setState({
            portfolioLoader: "nothing"
          });
        }
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
        if (snapshot.docs.length !== 0) {
          snapshot.forEach((doc) => {
            (async () => {
              for (let i = 0; i < portfolioStocks.length; i++) {
                const lastPrice = `https://cloud.iexapis.com/stable/stock/${
                  portfolioStocks[i]
                }/quote?displayPercent=true&token=pk_e103471603a7468f8947eeb5bd9b6b77`;
                await new Promise((resolve) =>
                  fetch(lastPrice)
                    .then((res) => res.json())
                    .then((result) => {
                      portfolioValue.push(
                        doc.data().shares * result.latestPrice
                      );
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
              }, 300);
            })();
          });
        } else {
          docRef.get().then((doc) => {
            this.setState({
              funds: "$" + this.numberWithCommas(doc.data()["currentfunds"])
            });
            this.setState({
              fundsLoader: true
            });
          });
        }
      });
  }
  searchStocks(e) {
    document.getElementById("results").innerHTML = "";
    let b = 0;
    let filter = document.getElementById("searchBar").value.toUpperCase();
    if (e.key === "Enter") window.location = "stocks/" + filter;
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
      .then((res) => res.json())
      .then((result) => {
        allSymbols = result.map((val) => {
          return val;
        });
      });
    chartData1 = [];
    chartData2 = [];
    const gainers =
      "https://cloud.iexapis.com/stable/stock/market/list/gainers?token=pk_e103471603a7468f8947eeb5bd9b6b77";
    fetch(gainers)
      .then((res) => res.json())
      .then((result) => {
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
    timeout = function() {
      setTimeout(() => {
        if (this.state.portfolioLoader !== true) this.getAccountInfo();
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
        if (stockListChange.length < 1) {
          this.setState({
            loader3: false
          });
        }
        if (this.state.loader3 !== true) {
          this.setState({
            loader3: false
          });
        }
        console.log(this.state.loader3);
      }, 5000);
    };
    document.querySelector(".hamburger").addEventListener("click", (e) => {
      e.currentTarget.classList.toggle("is-active");
    });
    setTimeout(() => {
      if (this.state.loader1 === "") {
        this.setState({
          loader1: false
        });
      }
      if (this.state.loader2 === "") {
        this.setState({
          loader2: false
        });
      }
    }, 7000);
  }
  componentWillUnmount() {
    clearTimeout(timeout);
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
        <Alert />
        <div style={{display: "flex", flexDirection: "column", width: "100%"}}>
          <div style={{display: "flex", height: "100%"}}>
            <Leftbar />
            <div className="panel">
              <div className="topbar">
                <div className="hamburger">
                  <div className="hamburger__container">
                    <div className="hamburger__inner" />
                    <div className="hamburger__hidden" />
                  </div>
                </div>
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
                    <div style={{display: "flex", alignItems: "center"}}>
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
                  <div className="panel__topCharts" style={{display: "flex"}}>
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
                          <div className="errorMsg">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                            >
                              <g>
                                <path fill="none" d="M0 0h24v24H0z" />
                                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z" />
                              </g>
                            </svg>
                            <p>
                              Couldn't load chart try again in few minutes
                            </p>
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
                          <div className="errorMsg">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                            >
                              <g>
                                <path fill="none" d="M0 0h24v24H0z" />
                                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z" />
                              </g>
                            </svg>
                            <p>
                              Couldn't load chart try again in few minutes
                            </p>
                          </div>
                        )}
                        {this.state.loader2 === true && (
                          <div className="stockChart__chart">
                            <Line data={this.data2} options={options} />
                          </div>
                        )}
                        {this.state.loader2 === true && (
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
                        {this.state.portfolioLoader === "nothing" && (
                          <div className="errorMsg">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                            >
                              <g>
                                <path fill="none" d="M0 0h24v24H0z" />
                                <path d="M5.373 4.51A9.962 9.962 0 0 1 12 2c5.523 0 10 4.477 10 10a9.954 9.954 0 0 1-1.793 5.715L17.5 12H20A8 8 0 0 0 6.274 6.413l-.9-1.902zm13.254 14.98A9.962 9.962 0 0 1 12 22C6.477 22 2 17.523 2 12c0-2.125.663-4.095 1.793-5.715L6.5 12H4a8 8 0 0 0 13.726 5.587l.9 1.902zm-5.213-4.662L10.586 12l-2.829 2.828-1.414-1.414 4.243-4.242L13.414 12l2.829-2.828 1.414 1.414-4.243 4.242z" />
                              </g>
                            </svg>
                            <p>You didn't buy any stocks yet.</p>
                          </div>
                        )}
                        {this.state.portfolioLoader === false && (
                          <div className="errorMsg">
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
                        {this.state.portfolioLoader === true && (
                          <div>
                            <table className="panel__portfolio-list">
                              <tbody>
                                <tr>
                                  <th>SYMBOL</th>
                                  <th>QUANTITY</th>
                                  <th>GAIN/LOSS (%)</th>
                                  <th>CURRENT VALUE</th>
                                </tr>
                                {portfolioStocks.map((value, index) => {
                                  return (
                                    <tr key={index}>
                                      <td>{value}</td>
                                      <td>{portfolioShares[index]}</td>
                                      <td
                                        style={{color: portfolioColor[index]}}
                                      >
                                        {portfolioDifference[index]}%
                                      </td>
                                      <td>
                                        $
                                        {this.numberWithCommas(
                                          portfolioValue[index]
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
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
                {this.state.loader3 === true ? (
                  <div className="panel__bottom">
                    <div className="panel__stockList">
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
                    </div>
                    <div className="panel__stockList">
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
                    </div>
                    <div className="panel__stockList">
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
                    </div>
                  </div>
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
    );
  }
}

export default Dashboard;
