'use strict';



class NewspaperLabel extends React.Component{
    constructor(props) {
        super(props);                       
    }

    dragStartHandler(e) {
        GlobalEventManager.getInstance().dragStart(e);
    }

    render() {
        return (
            <div className="newspaper-stamp" id={this.props.item.id} draggable='true'  onDragStart={this.dragStartHandler}>
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
    }

    

    setItems(inputs) {
        let newItems = [];
        for(let i in inputs) {
            let item = {id:'', content: ''};
            item.content = inputs[i];
            item.id = this.convertToID(item.content);
            newItems.push(item);
        }
        this.setState({items: newItems});
        console.log('setItemssetItemssetItemssetItemssetItemsv');
    }

    convertToID(content) {
        let ret = '';
        for(let i = 0 ; i < content.length; i++) {
            let c = content.charAt(i);
            ret += c == ' ' ? '-' : c;
        }
        return ret;
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


var gLabelWall = ReactDOM.render(
   
    <NewspaperLabelWall />,
    $('#newspaper-toolbox-stamps-react')[0]    
);