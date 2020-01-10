import React from "react";

let newsDate = [];
let newsHeadline = [];
let newsImage = [];
let newsSummary = [];
let newsUrl = [];
let newsRelated = [];

class News extends React.Component {
  getLatestNews() {
    fetch(
      `https://cloud.iexapis.com/stable/stock/${this.props.symbol}/news?token=pk_95c4a35c80274553987b93e74bb825d7`,
    )
      .then(res => res.json())
      .then(result => {
        for (let i = 0; i < 3; i++) {
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
      })
      .then(() => {
        setTimeout(() => {
          for (let i = 0; i < newsUrl.length; i++) {
            document.querySelector("#img" + i).style =`background-image:url(${newsImage[parseInt(i)]})`;
          }
        }, 1500);
      });
  }
    componentDidMount(){
this.getLatestNews()
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
              key={indx}>
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
      </div>
    );
  }
}
export default News
