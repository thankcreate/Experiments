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

    constructor(props) {
        super(props);
        this.myRef = React.createRef();
    }

    is404() {
        // if(this.isNewAdded())
        //     return false;
        // return Math.random() < 0.5;
        return this.getScore() < 4.0;
    }

    isNewAdded() {
        return this.props.newAdded == true;
    }

    componentDidMount() {
        $('#overlay-with-scroll')[0].addEventListener('scroll', this.handleScroll);
        this.refreshOpacity();
    }
    
    componentWillUnmount() {               
        $('#overlay-with-scroll')[0].removeEventListener('scroll', this.handleScroll);
    }
    
    handleScroll = () =>{        
        this.refreshOpacity();        
        this.refreshNewAddedOffset();
        this.refreshOpacityOfNextLevelButton();
    }

    refreshOpacityOfNextLevelButton() {
        let rect = $('#next-level-btn')[0].getBoundingClientRect();
        let windowH = $(window).height();   
        let relaH = windowH - rect.bottom;
        let proc = relaH / (windowH / 2);
        proc = clamp(proc, 0, 1);
        $('#next-level-btn').css('opacity', proc);       
    }


    getRelaH() {
        let rect = this.myRef.current.getBoundingClientRect();
        let windowH = $(window).height();
        let relaH = windowH - rect.bottom;
        return relaH;
    }

    refreshNewAddedOffset() {
        if(!this.isNewAdded()) {
            return;
        }

        let rect = this.myRef.current.getBoundingClientRect();        
        let windowH = $(window).height();               

        let sc = $('#overlay-with-scroll').scrollTop();
        let top = $(this.myRef.current).css('top');
        let topN = parseInt(top, 10);
        // console.log('style ' + $(this.myRef.current).attr("style"));
        // console.log('top ' + $(this.myRef.current).css('top'));
        
        let blockHeight = rect.bottom - rect.top;
        let masonryCalculatedTop = topN + blockHeight - sc;
        
        let relaH = windowH - masonryCalculatedTop;
        
        let maxOffset = 40;
        // console.log(topN + blockHeight - sc);
        let fullShownHeight = windowH * 0.55;
        let processRaw = relaH / fullShownHeight;
        let process = clamp(processRaw, 0, 1);
        let scale = 1.0 +  (1 - process) * 1.2;
        let prop = 'translateY(' + (1 - process) * maxOffset + 'vh) ' + 'scale(' + scale +  ')';
        $(this.myRef.current).css('transform', prop);
    }

    refreshOpacity() {        
        let windowH = $(window).height();
        let relaH = this.getRelaH();
        /**
         * relaH represents the bottom of the div related to the viewport bottom
         * >0: div above the viewport bottom
         */
        let fullShownHeight = windowH * 0.3;
        let op = relaH / fullShownHeight;
        let clampedOp = clamp(op, 0, 1);
        // $('.newadded').css('opacity', clampedOp);

        if(this.isNewAdded()) {
            clampedOp = 1;
        }
        $(this.myRef.current).css('opacity', clampedOp);        
    }

    score = null;

    getScore() {
        if(this.props.item.score) {
            this.score = this.props.item.score;
            return this.props.item.score;   
        }

        if(this.score) {
            return this.score;
        }

        this.score = Math.random() * 5;
        return this.score;
    }

    getRateLbl() {
        let sc = this.getScore().toFixed(1);
        return sc + ' / 5.0';
        // return 'Rating: ' + sc + ' / 5.0';
    }

    render() {
        let up =    
            <div>
                <div className='review-block-comment wrap'>
                    {this.props.item.comment}
                </div>
                <div className='review-block-comment-tail'>
                    <div className='review-block-rate'>
                        {this.getRateLbl()}
                    </div>
                    <div className='review-block-time'>
                        {moment(this.props.item.timestamp).fromNow()}
                    </div>
                    
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
            <div className={blockClass} ref={this.myRef}>
                <div className='review-block-up'>
                    {this.is404() ? up404 : this.props.newAdded? up : up} 
                </div>
                            
                <div className="review-block-bottom">
                    <div className="review-block-name">
                        {this.isNewAdded() ? this.props.item.username + '(You)': this.props.item.username}                        
                    </div>
                </div>
            </div>
        );
    }
}

var myRef;
class ReviewWall extends React.Component{

    blocks = [];
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
        msInit();
        msReload();
    }

    forceUpdateOpacity() {        
        this.blocks.forEach(e=>{
            if(e == null)
                return;
            e.refreshOpacity();
        });            
    }

    componentDidUpdate() {        
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
                },
                err => {                    
                    
                });
        return pm;
    }

    renderOne(i) {        
        let isNewAdded = this.state.items[i].id == this.id;
        let ret = 
            <ReviewBlock 
                item={this.state.items[i]} 
                key={i} 
                newAdded={isNewAdded} 
                ref={(instance)=>{this.blocks.push(instance)}}
            />        
        
        return ret
    }


    renderAll() {
        let res = [];
        this.blocks.length = 0;
        for(let i = 0; i < this.state.items.length ;i++) {
            let rd = this.renderOne(i);
            res.push(rd);            
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

    $('.review-wall-container').on( 'layoutComplete', ()=>{
        if(s_rw)
            s_rw.forceUpdateOpacity();
    } );
}


function msReload() {
    $('.review-wall-container').masonry('reloadItems');
    $('.review-wall-container').masonry();
}
