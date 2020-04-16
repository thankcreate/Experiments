'use strict';

var gReviewWall;

class NewspaperLabel extends React.Component{
    constructor(props) {
        super(props);                       
    }

    render() {
        return (
            <div className="newspaper-stamp" id={this.props.item.id}>
                {this.props.item.content}
            </div>
        );
    }
}

class NewspaperLabelWall extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            items: [
                {
                    id: 'stamp-fake-news',
                    content: 'Fake News',
                },
                {
                    id: 'stamp-nasty',
                    content: 'Nasty',
                },
                {
                    id: 'stamp-third-rate-journalism',
                    content: 'Third-Rate Journalism',
                }
            ]
        }
        gReviewWall = React.createRef();        
    }

    renderOne(i) {               
        let ret = 
            <NewspaperLabel
                item={this.state.items[i]} 
                key={i} 
            />                
        return ret
    }


    renderAll() {
        let res = [];        
        for(let i = 0; i < this.state.items.length ;i++) {
            let rd = this.renderOne(i);
            res.push(rd);            
        }
        return res;
    }

    render() {            
        return (
            <div id="newspaper-toolbox-stamps">
                {this.renderAll()}
            </div>
        );
    }
}


let s_rw = ReactDOM.render(
   
    <NewspaperLabelWall />,
    $('#newspaper-toolbox-stamps-react')[0]    
);