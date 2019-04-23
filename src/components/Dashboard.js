import React from 'react'
import { Chart } from "react-google-charts";

//SCKYFF3IUQD3WLPF

const theURL = "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=MSFT&interval=1min&apikey=SCKYFF3IUQD3WLPF";

class Dashboard extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        return (
            <div className="Dashboard">
                <div className="leftbar">
                    <h3>LALALA</h3>
                </div>
                <div className="panel"></div>
                <div className="stockChart">
                <Chart
                    width={'600px'}
                    height={'400px'}
                    chartType="LineChart"
                    loader={<div>Loading Chart</div>}
                    data={[
                        ['x', 'dogs'],
                        [0, 5],
                        [1, 10],
                        [2, 23],
                        [3, 17],
                        [4, 18],
                        [5, 9],
                        [6, 11],
                        [7, 27],
                    ]}
                    options={{
                        legend: { position: 'none' },
                        backgroundColor: { fill: 'transparent' },
                        hAxis: {
                            textPosition: 'none',
                            gridlines: {
                                color: 'transparent'
                            }
                        },
                        vAxis: {
                            textPosition: 'none',
                            gridlines: {
                                color: 'transparent'
                            }
                        },
                        series: {
                            0: { curveType: 'function' },
                        },
                    }}
                    rootProps={{ 'data-testid': '2' }}
                />
                </div>
            </div>
        )
    }
}

export default Dashboard;