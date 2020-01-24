import React from "react";
import Leftbar from "../Elements/leftbar";
import Topbar from "../Elements/topbar";
import firebase from "firebase/app";
import { relDiff } from "../helpers.js";
import Loader from "../Elements/Loader";

let difference = [],
  moneyPaid = [],
  symbols = [],
  color = [],
  shares = [],
  value = [],
  change = [],
  position = [];

export default class portfolio extends React.Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      loader1: "",
      confirmation: "",
      funds: "",
      marketStatus: "",
      error: ""
    };
    this.handleStockSell = this.handleStockSell.bind(this);
  }

  /*
   * gets latest price from API and changes color depending on that
   * @param {symbol} name of stock as symbol
   * @param {i} index of array
   */

  getLatestPrice(symbol, i) {
    const lastPrice = `https://cloud.iexapis.com/stable/stock/${symbol}/quote?displayPercent=true&token=${process.env.REACT_APP_API_KEY_2}`;
    fetch(lastPrice)
      .then(res => res.json())
      .then(result => {
        value[parseInt(i)] = parseFloat(
          Number(shares[parseInt(i)] * result.latestPrice).toFixed(2)
        );
      })
      .then(() => {
        difference[parseInt(i)] =
          relDiff(
            parseFloat(value[parseInt(i)]),
            parseFloat(moneyPaid[parseInt(i)])
          ).toFixed(2) + "%";
        change[parseInt(i)] =
          "$" +
          parseFloat(
            parseFloat(
              value[parseInt(i)] - parseFloat(moneyPaid[parseInt(i)])
            ).toFixed(2)
          );
        if (value[parseInt(i)] > moneyPaid[parseInt(i)]) {
          difference[parseInt(i)] = `+${difference[parseInt(i)]}`;
          color[parseInt(i)] = "#66F9DA";
        } else if (value[parseInt(i)] === moneyPaid[parseInt(i)]) {
          color[parseInt(i)] = "#999EAF";
        } else {
          difference[parseInt(i)] = `-${difference[parseInt(i)]}`;
          color[parseInt(i)] = "#F45385";
        }
        if (difference[parseInt(i)].includes("NaN")) {
          difference[parseInt(i)] = "---";
          color[parseInt(i)] = "#999EAF";
        }
        if (change[parseInt(i)].split("")[1] === "-") {
          let name = "" + change[parseInt(i)];
          change[parseInt(i)] = `-$${name.substr(2)}`;
        }
      });
  }

  /*
   * gets users opened positions
   */

  getPositions() {
    if (this._isMounted)
      this.setState({
        loader1: ""
      });
    symbols = [];
    position = [];
    shares = [];
    moneyPaid = [];
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
            this.getLatestPrice(symbols[parseInt(i)], i);
            i++;
          });
        } else {
          if (this._isMounted)
            this.setState({
              loader1: "nothing"
            });
        }
      })
      .then(() => {
        setTimeout(() => {
          if (this._isMounted && symbols.length > 0) {
            this.setState({
              loader1: true
            });
          }
        }, 1000);
      });
  }

  /*
   * closes position
   * @param {position} name of position
   * @param {number} index of 'value' array
   */

  handleStockSell(position, number) {
    symbols = [];
    let user = firebase.auth().currentUser.uid;
    if (this.state.marketStatus && this._isMounted) {
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
            if (this._isMounted)
              this.setState({
                funds:
                  Number(this.state.funds) + Number(value[parseInt(number)])
              });
            firebase
              .firestore()
              .collection("users")
              .doc(user)
              .update({
                currentfunds: this.state.funds
              })
              .catch(() => {
                if (this._isMounted) {
                  this.setState({
                    loader1: false
                  });
                }
              });
            this.getPositions();
          }.bind(this)
        )
        .catch(function(error) {
          console.error(error);
        });
    }
  }
  componentDidMount() {
    this._isMounted = true;

    /*
     * check if market opened
     */

    fetch("https://financialmodelingprep.com/api/v3/is-the-market-open")
      .then(res => res.json())
      .then(result => {
        if (this._isMounted) {
          this.setState({
            marketStatus: result.isTheStockMarketOpen
          });
        }
      });

    let user = firebase.auth().currentUser.uid;

    document.title = `${document.title} - Portfolio`;
    this.getPositions();
    firebase
      .firestore()
      .collection("users")
      .doc(user)
      .onSnapshot(
        function(doc) {
          if (typeof doc.data() !== "undefined" && this._isMounted) {
            this.setState({
              funds: doc.data()["currentfunds"]
            });
          }
        }.bind(this)
      );
    document.querySelector(".hamburger").addEventListener("click", e => {
      e.currentTarget.classList.toggle("is-active");
    });
  }
  componentWillUnmount() {
    this._isMounted = false;
  }
  render() {
    return (
      <div className="portfolio">
        {this.state.error === true && (
          <div className="alertMessage">
            Market is currently closed{" "}
            <button
              style={{ margin: "20px" }}
              className="stockPage__buy-button"
              onClick={() => {
                if (this._isMounted) {
                  this.setState({
                    error: false
                  });
                }
              }}
            >
              CONFIRM
            </button>
          </div>
        )}
        <Leftbar />
        <div className="portfolio__container">
          <Topbar />
          {this.state.loader1 === "" && <Loader />}
          {this.state.loader1 === true && symbols.length > 0 && (
            <table className="portfolio__list">
              <tbody>
                <tr>
                  <th>SYMBOL</th>
                  <th>QUANTITY</th>
                  <th>GAIN/LOSS (%)</th>
                  <th>GAIN/LOSS ($)</th>
                  <th>CURRENT VALUE</th>
                  <th />
                </tr>
                {symbols.map((val, index) => {
                  return (
                    <tr key={index}>
                      <td>{val}</td>
                      <td>{shares[parseInt(index)]}</td>
                      <td style={{ color: color[parseInt(index)] }}>
                        {difference[parseInt(index)]}
                      </td>
                      <td style={{ color: color[parseInt(index)] }}>
                        {change[parseInt(index)]}
                      </td>
                      <td>${value[parseInt(index)]}</td>
                      <td>
                        <svg
                          onClick={() => {
                            if (this.state.marketStatus) {
                              this.handleStockSell(
                                position[parseInt(index)],
                                index
                              );
                            } else {
                              if (this._isMounted) {
                                this.setState({
                                  error: true
                                });
                              }
                            }
                          }}
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
          {this.state.loader1 === "nothing" && (
            <div className="errorMsg">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <g>
                  <path fill="none" d="M0 0h24v24H0z" />
                  <path d="M5.373 4.51A9.962 9.962 0 0 1 12 2c5.523 0 10 4.477 10 10a9.954 9.954 0 0 1-1.793 5.715L17.5 12H20A8 8 0 0 0 6.274 6.413l-.9-1.902zm13.254 14.98A9.962 9.962 0 0 1 12 22C6.477 22 2 17.523 2 12c0-2.125.663-4.095 1.793-5.715L6.5 12H4a8 8 0 0 0 13.726 5.587l.9 1.902zm-5.213-4.662L10.586 12l-2.829 2.828-1.414-1.414 4.243-4.242L13.414 12l2.829-2.828 1.414 1.414-4.243 4.242z" />
                </g>
              </svg>
              <h3>You didn't buy any stocks yet.</h3>
            </div>
          )}
        </div>
      </div>
    );
  }
}
