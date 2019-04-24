import React from "react";
import { Chart } from "react-google-charts";
import $ from 'jquery'

const stockApi =
    "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=AAPL&interval=5min&apikey=OLMMOMZUFXFOAOTI";
let price;
let data = [["x", "AAPL"]];

class Dashboard extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loaded: ""
        }
    }
    componentWillMount() {
        fetch(stockApi)
            .then(res => res.json())
            .then(result => {
                console.log(result);
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
                                minutes = "0" + minutes
                            }
                            price = parseFloat(
                                result["Time Series (5min)"][
                                time1[0] + " " + hour + ":" + minutes + ":00"
                                ]["4. close"],
                                2
                            );
                        }
                        data.push([i, price]);
                    }
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
                            <p>Error, while loading chart</p>
                            :
                            <Chart
                                width={"110%"}
                                height={"110%"}
                                chartType="LineChart"
                                loader={<div>Loading Chart</div>}
                                data={data}
                                options={{
                                    lineWidth: 5,

                                    legend: { position: "none" },
                                    backgroundColor: { fill: "transparent" },
                                    hAxis: {
                                        textPosition: "none",
                                        gridlines: {
                                            color: "transparent"
                                        }
                                    },
                                    vAxis: {
                                        textPosition: "none",
                                        gridlines: {
                                            color: "transparent"
                                        }
                                    },
                                    series: {
                                        0: { curveType: "function" },
                                        6: { pointSize: 15 }
                                    }
                                }}
                                rootProps={{ "data-testid": "2" }}
                            />
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default Dashboard;
