'use strict';

const e = React.createElement;

class LikeButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { liked: false };
  }

  render() {
    if (this.state.liked) {
      return 'You liked this111.';
    }

    return (
        <button onClick={() => this.setState({ liked: true })}>
          Like
        </button>
      );
  }
}

// const domContainer = document.querySelector('#review-wall-container');
// ReactDOM.render(e(LikeButton), domContainer);


class ReviewBlock extends React.Component {

    render() {
        return (
            <div>
                {this.props.item.username}
                {this.props.item.comment}
            </div>
        );
    }
}

class ReviewWall extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            items: [
                {
                    username: 'Haha',
                    comment: 'Good game',
                },
                {
                    username: 'TronTron',
                    comment: 'Bad game',
                }
            ]
        }
    }

    renderOne(i) {
        return (
            <ReviewBlock item={this.state.items[i]} />
        )
    }


    renderAll() {
        let res = [];
        for(let i = 0; i < 2 ;i++) {
            res.push(this.renderOne(i));
        }
        return res;
    }


    render() {    
        return (
            <div className="review-wall-container">
                {this.renderAll()}
            </div>
        );
    }
}

ReactDOM.render(
   
    <ReviewWall />,
    $('#review-wall-container-root')[0]    
);