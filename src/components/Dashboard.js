import React from "react";
import { Chart } from "react-google-charts";
import { Line } from 'react-chartjs-2';

const stockApi =
    "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=AAPL&interval=5min&apikey=OLMMOMZUFXFOAOTI";
let price;


var options = {
    //tooltips: {enabled: false},
    //hover: {mode: null},
    legend: {
        display: false
    },
    scales: {
        xAxes: [{
            display: false
        }],
        yAxes: [{
            display: false
        }]
    },

}

let chartData =[]
let data;
class Dashboard extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loaded: ""
        }
        function labelGen(length){
            let result = 0;
            for(let i = 1;i<length;i++){
                result = result + "," + i
            }
            return result.split(",")
        }
        this.data = (canvas) => {
            labelGen(20)
            const ctx = canvas.getContext("2d")
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, '#ff8e9a');
            gradient.addColorStop(1, '#fe8e9a');
            console.log(data)
            return {
                labels:labelGen(20),
                datasets: [
                    {
                        lineTension: 0.3,
                        label: 'My First dataset',
                        pointBorderWidth: 0,
                        pointHoverRadius: 0,
                        backgroundColor: gradient,
                        borderColor: gradient,
                        pointBorderColor: gradient,
                        pointBackgroundColor: gradient,
                        fill: false,
                        borderWidth: 5,
                        hoverBackgroundColor: 'rgba(255,99,132,0.4)',
                        hoverBorderColor: 'rgba(255,99,132,1)',
                        data: [207.4303,207.7,207.89,207.4544,207.42,207.31,207.28,207.16,207.44,207.64,207.75,207.813,207.9,207.95,207.865,207.71,207.72,207.6344,207.7269,207.59]
                    }
                ]
            }
        };
    }
    componentWillMount() {
        fetch(stockApi)
            .then(res => res.json())
            .then(result => {
                if ("Note" in result) {
                    this.setState({
                        loaded: false
                    })
                } else {
                    let lastRefreshed = result["Meta Data"]["3. Last Refreshed"];
                    let time1 = lastRefreshed.split(" ");
                    let time = time1[1].split("");
                    let hour = time[0] + "" + time[1];
                    let minutes = time[3] + "" + time[4];
                    for (let i = 0; i < 20; i++) {
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
                                minutes = "0" + minutes
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
                    data = chartData.join(",")
                    this.setState({
                        loaded: true
                    })
                }
            });
    }

    render() {
        return (
            <div className="Dashboard">
                <div className="leftbar">
                    <h3>LALALA</h3>
                </div>
                <div className="panel">
                    <h2>Most Popular</h2>
                    <div className="stockChart" id="stockChart">
                        {this.state.loaded === false ?
                            <h3>Couldn't load chart try again in few minutes</h3>
                            :
                            <Line data={this.data} options={options} />}
                        {this.state.loaded ?
                            <h2>AAPL</h2>
                            :
                            <div></div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default Dashboard;
