import React from "react";
import { Line } from "react-chartjs-2";

let stockApi =
  "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=AAPL&interval=5min&apikey=OLMMOMZUFXFOAOTI";
let lastPrice =
  "https://api-v2.intrinio.com/securities/AAPL/prices/realtime?api_key=OjNmMmQyMjFlZmU5NDAzNWQ2ZWIyNmRhY2QxNzIzMjM2";
let percentageChange =
  "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=OLMMOMZUFXFOAOTI";

let price, color;

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
let chartData = [];

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: "",
      stock1: "",
      change: ""
    };
    function labelGen(length) {
      let result = 0;
      for (let i = 1; i < length; i++) {
        result = result + "," + i;
      }
      return result.split(",");
    }
    this.data = canvas => {
      const ctx = canvas.getContext("2d");
      const gradient = ctx.createLinearGradient(0, 0, 600, 10);
      gradient.addColorStop(0, "#ff5e57");
      gradient.addColorStop(1, "#ffd32a");
      let gradientFill = ctx.createLinearGradient(0, 0, 0, 100);
      gradientFill.addColorStop(0, "rgba(255,94,87,0.3)");
      gradientFill.addColorStop(0.2, "rgba(255,211,42,.25)");
      gradientFill.addColorStop(1, "rgba(255, 255, 255, 0)");
      return {
        labels: labelGen(10),
        datasets: [
          {
            lineTension: 0.3,
            label: "My First dataset",
            pointBorderWidth: 0,
            pointHoverRadius: 0,
            borderColor: gradient,
            backgroundColor: gradientFill,
            pointBackgroundColor: gradient,
            fill: true,
            borderWidth: 5,
            data: chartData
          }
        ]
      };
    };
  }
  componentDidMount() {
    fetch(percentageChange)
      .then(res => res.json())
      .then(result => {
        if ("Note" in result) {
          this.setState({
            loaded: false
          });
        } else {
          let change = parseFloat(
            result["Global Quote"]["10. change percent"]
          ).toFixed(2);
          this.setState({
            change: change
          });
        }
      });
    fetch(lastPrice)
      .then(res => res.json())
      .then(result => {
        if ("Note" in result) {
          this.setState({
            loaded: false
          });
        } else {
          this.setState({
            stock1: result.last_price
          });
        }
      });

    fetch(stockApi)
      .then(res => res.json())
      .then(result => {
        if ("Note" in result) {
          this.setState({
            loaded: false
          });
        } else {
          let lastRefreshed = result["Meta Data"]["3. Last Refreshed"];
          let time1 = lastRefreshed.split(" ");
          let time = time1[1].split("");
          let hour = time[0] + "" + time[1];
          let minutes = time[3] + "" + time[4];
          for (let i = 0; i < 10; i++) {
            if (minutes === "00") {
              hour--;
              minutes = "55";
              price = parseFloat(
                result["Time Series (5min)"][
                  time1[0] + " " + hour + ":" + minutes + ":00"
                ]["4. close"],
                2
              );
            } else {
              minutes -= 5;
              if (minutes < 10) {
                minutes = "0" + minutes;
              }
              price = parseFloat(
                result["Time Series (5min)"][
                  time1[0] + " " + hour + ":" + minutes + ":00"
                ]["4. close"],
                2
              );
            }
            chartData.push(parseFloat(price));
          }
          setTimeout(() => {
            if (this.state.stock1 !== "" && this.state.change !== "") {
              this.setState({
                loaded: true
              });
            }
          }, 1000);
        }
      });
  }

  render() {
    if (Math.sign(this.state.change) === -1) {
      color = "#ff5e57";
    } else if (Math.sign(this.state.change) === 1) {
      color = "green";
    } else {
      color = "#999eaf";
    }
    return (
      <div className="Dashboard">
        <div className="leftbar">
          <h3>LALALA</h3>
        </div>
        <div className="panel">
          <h2>Most Popular</h2>
          <div className="stockChart" id="stockChart">
            {this.state.loaded === "" ? (
              <div className="loader">
                <div className="loader-inner" />
              </div>
            ) : (
              <div />
            )}
            {this.state.loaded === false ? (
              <h5>Couldn't load chart try again in few minutes</h5>
            ) : (
              <div />
            )}
            {this.state.loaded === true ? (
              <div className="stockChart__chart">
                <Line data={this.data} options={options} />
              </div>
            ) : (
              <div />
            )}
            {this.state.loaded ? (
              <div className="stockChart__info">
                <h3 className="stockChart__name">AAPL</h3>
                <div className="stockChart__price-info">
                  <h4 className="stockChart__change" style={{ color: color }}>{this.state.change}%</h4>
                  <h3 className="stockChart__price">${this.state.stock1}</h3>
                </div>
              </div>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;
