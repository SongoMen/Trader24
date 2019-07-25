import React from "react";
import Leftbar from "./leftbar";
import { Link } from "react-router-dom";
import Topbar from "./topbar";
import firebase from "firebase/app";

let difference = [],
  moneyPaid = [],
  symbols = [],
  color = [],
  shares = [],
  value = [],
  position = [];
let check;

export default class portfolio extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loader1: "",
      confirmation: "",
      funds: ""
    };
    this.handleStockSell = this.handleStockSell.bind(this);
  }
  getLatestPrice(symbol, i) {
    const lastPrice = `https://cloud.iexapis.com/stable/stock/${symbol}/quote?displayPercent=true&token=pk_d0e99ea2ee134a4f99d0a3ceb700336c`;
    fetch(lastPrice)
      .then(res => res.json())
      .then(result => {
        value[i] = Number(shares[i] * result.latestPrice).toFixed(2);
      })
      .then(() => {
        difference[i] =
          this.relDiff(parseFloat(value[i]), parseFloat(moneyPaid[i])).toFixed(
            2
          ) + "%";
        if (value[i] > moneyPaid[i]) {
          difference[i] = "+" + difference[i];
          color[i] = "#66F9DA";
        } else if (value[i] === moneyPaid[i]) color[i] = "#999EAF";
        else {
          difference[i] = "-" + difference[i];
          color[i] = "#F45385";
        }
        if (difference[i].includes("NaN")) {
          difference[i] = "---";
          color[i] = "#999EAF";
        }
      });
  }
  relDiff(a, b) {
    return 100 * Math.abs((a - b) / ((a + b) / 2));
  }
  getPositions() {
    let user = firebase.auth().currentUser.uid;
    let i = 0;
    firebase
      .firestore()
      .collection("users")
      .doc(user)
      .collection("stocks")
      .get()
      .then(snapshot => {
        if (snapshot.docs.length !== 0) {
          snapshot.forEach(doc => {
            position.push(doc.id);
            symbols.push(doc.data().symbol);
            shares.push(doc.data().shares);
            moneyPaid.push(doc.data().moneyPaid);
            this.getLatestPrice(symbols[i], i);
            i++;
          });
        } else {
          this.setState({
            portfolioLoader: "nothing"
          });
        }
      });
  }
  handleStockSell(position, number) {
    let user = firebase.auth().currentUser.uid;
    this.setState({
      confirmation: true
    });
    firebase
      .firestore()
      .collection("users")
      .doc(user)
      .collection("stocks")
      .doc(position)
      .delete()
      .then(
        function() {
          this.setState({
            funds: Number(this.state.funds) + Number(moneyPaid[number])
          });
          firebase
            .firestore()
            .collection("users")
            .doc(user)
            .update({
              currentfunds: this.state.funds
            })
            .catch(error => {
              console.log("Error getting document:", error);
              this.setState({
                portfolioLoader: false
              });
            });
          this.getPositions();
        }.bind(this)
      )
      .catch(function(error) {
        console.error("Error removing document: ", error);
      });
  }
  componentDidMount() {
    let user = firebase.auth().currentUser.uid;

    document.title = document.title + " - Portfolio";
    this.getPositions();
    setTimeout(() => {}, 2000);
    check = () =>
      setInterval(() => {
        if (symbols.length === difference.length) {
          this.setState({
            loader1: true
          });
        } else {
          clearInterval(check);
        }
      }, 1000);
    check();
    firebase
      .firestore()
      .collection("users")
      .doc(user)
      .onSnapshot(
        function(doc) {
          if (doc.data() !== undefined)
            this.setState({
              funds: doc.data()["currentfunds"]
            });
        }.bind(this)
      );
  }
  componentWillUnmount() {
    clearInterval(check);
  }
  render() {
    setTimeout(() => {
      if (this.state.loader1 === "") {
        this.getPositions();
        check();
        console.log("X");
      }
    }, 5000);
    return (
      <div className="portfolio">
        <Leftbar />
        <div className="portfolio__container">
          <Topbar />
          {this.state.loader1 === "" && (
            <ul className="loader">
              <li />
              <li />
              <li />
            </ul>
          )}
          {this.state.loader1 === true && (
            <table className="portfolio__list">
              <tbody>
                <tr>
                  <th>SYMBOL</th>
                  <th>QUANTITY</th>
                  <th>GAIN/LOSS (%)</th>
                  <th>CURRENT VALUE</th>
                  <th />
                </tr>
                {symbols.map((val, index) => {
                  return (
                    <tr key={index}>
                      <td>{val}</td>
                      <td>{shares[index]}</td>
                      <td style={{ color: color[index] }}>
                        {difference[index]}
                      </td>
                      <td>${value[index]}</td>
                      <td>
                        <svg
                          onClick={() =>
                            this.handleStockSell(position[index], index)
                          }
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <g>
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" />
                          </g>
                        </svg>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }
}
