import React from 'react'
import { Chart } from "react-google-charts";


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
                <Chart
                    width={'600px'}
                    height={'400px'}
                    chartType="LineChart"
                    loader={<div>Loading Chart</div>}
                    data={[
                        ['x', 'dogs'],
                        [0, 0],
                        [1, 10],
                        [2, 23],
                        [3, 17],
                        [4, 18],
                        [5, 9],
                        [6, 11],
                        [7, 27],
                    ]}
                    options={{
                        series: {
                            0: { curveType: 'function' },
                        },
                    }}
                    rootProps={{ 'data-testid': '2' }}
                />
            </div>
        )
    }
}

export default Dashboard;