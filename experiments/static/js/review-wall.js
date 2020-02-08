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
            <div className="review-block">
                <div className="review-block-name">
                    {this.props.item.username}
                </div>
                <div className='review-block-comment'>
                    {this.props.item.comment}
                </div>                
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
        this.refresh();
    }

    refresh() {
        let request = {count: 50};
        let pm = apiPromise('api/review', request, 'json', 'GET')
            .then(
                val => {
                    this.setState({
                        // reversed
                        items: val.reverse()
                    });
                    console.log("React refresh suc"); 
                },
                err => {                    
                    console.log('Failed to fetch review info');                    
                });
        return pm;
    }

    renderOne(i) {
        return (
            <ReviewBlock item={this.state.items[i]} key={i} />
        )
    }


    renderAll() {
        let res = [];
        for(let i = 0; i < this.state.items.length ;i++) {
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