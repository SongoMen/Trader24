import React from "react";
import Loader from "../Elements/Loader";

let newsDate = [];
let newsHeadline = [];
let newsImage = [];
let newsSummary = [];
let newsUrl = [];
let newsRelated = [];

class News extends React.Component {
  _isMounted = false;
  constructor() {
    super();
    this.state = {
      loading: true
    };
  }
  getLatestNews() {
    fetch(
      `https://cloud.iexapis.com/stable/stock/${this.props.symbol}/news?token=${process.env.REACT_APP_API_KEY_2}`
    )
      .then(res => res.json())
      .then(result => {
        for (let i = 0; i < 3; i++) {
          if (typeof result[parseInt(i)] !== "undefined") {
            let date = Date(result[parseInt(i)].datetime)
              .toString()
              .split(" ");
            newsDate[parseInt(i)] = `${date[1]} ${date[2]}`;
            newsHeadline[parseInt(i)] = result[parseInt(i)].headline;
            newsUrl[parseInt(i)] = result[parseInt(i)].url;
            newsSummary[parseInt(i)] = `${result[parseInt(i)].summary
              .split(" ")
              .splice(-result[parseInt(i)].summary.split(" ").length, 17)
              .join(" ")} ...`;
            newsRelated[parseInt(i)] = result[parseInt(i)].related;
            newsImage[parseInt(i)] = result[parseInt(i)].image;
          }
        }
      })
      .then(() => {
        setTimeout(() => {
          for (let i = 0; i < newsUrl.length; i++) {
            if (document.querySelector("#img" + i) !== null) {
              document.querySelector(
                "#img" + i
              ).style = `background-image:url(${newsImage[parseInt(i)]})`;
            }
          }
        }, 1000);
      })
      .then(() => {
        if (this._isMounted) {
          this.setState({ loading: false });
        }
      });
  }
  componentDidMount() {
    this._isMounted = true;
    this.getLatestNews();
  }
  componentWillUnmount() {
    this._isMounted = false;
  }
  render() {
    return (
      <div className="news__articles">
        {newsHeadline.map((val, indx) => {
          return (
            <a
              href={newsUrl[parseInt(indx)]}
              target="_blank"
              rel="noopener noreferrer"
              key={indx}
            >
              <div className="article">
                <div className="article__image" id={"img" + indx} />
                <div className="article__content">
                  <div className="article__top">
                    <h4>{val}</h4>
                    <h6>{newsDate[parseInt(indx)]}</h6>
                  </div>
                  <h5>{newsSummary[parseInt(indx)]}</h5>
                </div>
              </div>
            </a>
          );
        })}
        {newsHeadline.length === 0 && !this.state.loading && (
          <div className="news__nothing">
            <svg
              enableBackground="new 0 0 512 512"
              viewBox="0 0 512 512"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g>
                <path d="m60 272h332v-152h-332zm30-122h272v92h-272z" />
                <path d="m60 302h151v30h-151z" />
                <path d="m60 362h151v30h-151z" />
                <path d="m241 452h151v-150h-151zm30-120h91v90h-91z" />
                <path d="m60 422h151v30h-151z" />
                <path d="m60 0v60h-60v407c0 24.813 20.187 45 45 45h421.979c.172 0 .345-.001.518-.003 24.584-.268 44.503-20.351 44.503-44.997v-467zm-15 482c-8.271 0-15-6.729-15-15v-377h392v377c0 5.197.87 10.251 2.543 15zm437-15c0 8.174-6.571 14.841-14.708 14.997-4.094.084-7.857-1.43-10.75-4.244-2.929-2.85-4.542-6.669-4.542-10.753v-407h-362v-30h392z" />
              </g>
            </svg>
            <h3>Sorry, we couldn't find any related news.</h3>
          </div>
        )}
        {this.state.loading && <Loader />}
      </div>
    );
  }
}
export default News;
