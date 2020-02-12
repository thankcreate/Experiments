'use strict';

/**
 * React scrips need to be put into the end of <body>,
 * so we can't build the this file together with other phaser logic
 */

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

    is404() {
        return Math.random() < 0.5;
    }

    isNewAdded() {
        return this.props.newAdded == true;
    }

    componentDidMount() {
        console.log('mont');
        $('#overlay-with-scroll')[0].addEventListener('scroll', this.handleScroll);
    }
    
    componentWillUnmount() {
        
        $('#overlay-with-scroll')[0].removeEventListener('scroll', this.handleScroll);
    }
    
    handleScroll(event){
        let rect = $('.newadded')[0].getBoundingClientRect();
        let windowH = $(window).height();
        let relaH = windowH - rect.bottom;
        // console.log(windowH - rect.bottom);

        /**
         * relaH represents the bottom of the div related to the viewport bottom
         * >0: div above the viewport bottom
         */

        let fullShownHeight = windowH * 0.3;
        let op = relaH / fullShownHeight;
        let clampedOp = clamp(op, 0, 1);
        $('.newadded').css('opacity', clampedOp);
    }


    render() {
        let up =    
            <div>
                <div className='review-block-comment wrap'>
                    {this.props.item.comment}
                </div>
                <div className='review-block-time'>
                    {moment(this.props.item.timestamp).fromNow()}
                </div>
            </div>         
        
        let up404 = 
            <div className='review-block-404 tooltip'>
                404
                <span className="tooltiptext">The user has deleted their own comment</span>
            </div>

        let focus = 
            <div className='review-block-404 tooltip'>
                Focus
                <span className="tooltiptext">The user has deleted their own comment</span>
            </div>
        
        let blockClass = 'review-block';
        if(this.props.newAdded) 
            blockClass+= ' newadded';

        return (
            <div className={blockClass} >
                <div className='review-block-up'>
                    {this.is404() ? up404 : this.props.newAdded? focus : up} 
                </div>
                            
                <div className="review-block-bottom">
                    <div className="review-block-name">
                        {this.props.item.username}                        
                    </div>
                </div>
            </div>
        );
    }
}

var myRef;
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
        this.id = '';
        this.refresh();
        myRef= React.createRef();
    }

    componentDidMount() {
        console.log('componentDidMount');
        msInit();
        msReload();
    }

    componentDidUpdate() {
        console.log('componentDidUpdate');
        msReload();
    }

    refresh(newID) {
        let request = {count: 50};
        this.id = newID;
        let pm = apiPromise('api/review', request, 'json', 'GET')
            .then(
                val => {               
                    this.setState({                        
                        items: val.reverse()
                    });                    
                    console.log("React refresh suc"); 
                    // console.log(val.reverse()); 
                },
                err => {                    
                    console.log('Failed to fetch review info');                    
                });
        return pm;
    }

    renderOne(i) {
        // console.log('render one ' + this.state.items[i].username);
        let isNewAdded = this.state.items[i].id == this.id;
        if(isNewAdded) {
            console.log('newadded');
        }
        let ret = <ReviewBlock item={this.state.items[i]} key={i} newAdded={isNewAdded} />        
        
        return ret
    }


    renderAll() {
        let res = [];
        for(let i = 0; i < this.state.items.length ;i++) {
            res.push(this.renderOne(i));
        }
        return res;
    }


    render() {    
        console.log('123');
        return (
            <div className="review-wall-container">
                {this.renderAll()}
            </div>
        );
    }
}

let s_rw = ReactDOM.render(
   
    <ReviewWall />,
    $('#review-wall-container-root')[0]    
);


/**
 * Called when ReviewWall element is mounted by React
 */
function msInit() {    
    $('.review-wall-container').masonry({        
        itemSelector: '.review-block',
        // columnWidth: 210
    });
}


function msReload() {
    $('.review-wall-container').masonry('reloadItems');
    $('.review-wall-container').masonry();
}
