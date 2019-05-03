import React from 'react'
import StockPage from './stockPage'

export default class AAPL extends React.Component{
    render(){
        return (
            <StockPage symbol = "AAPL"></StockPage>
        )
    }
}