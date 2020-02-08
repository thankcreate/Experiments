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

const domContainer = document.querySelector('#review-wall-container');
ReactDOM.render(e(LikeButton), domContainer);


// const name = 'Josh Perez';
// const element = <h1>Hello, {name}</h1>;

// ReactDOM.render(
//   '123213',
//   document.getElementById('review-wall-container')
// );

ReactDOM.render(
    <h1>Hello, world!</h1>,
    $('#review-wall-container')[0]
    // document.getElementById('review-wall-container')
);