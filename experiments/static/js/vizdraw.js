function convertFsmToDot(fsm) {
	let ret = getHead(fsm)
	+ getEdgeItem(fsm) 
	+ '}';
	return ret;
}

function getHead(fsm) {
	let ret = `
	digraph finite_state_machine {
		rankdir=TB;
		bgcolor=transparent;
	`
	+ 'node [shape = circle, fontname = Tahoma ]; ' + fsm.initial + ";" 
	+
	`
	node [shape = rect, fontname = Tahoma ,margin=0.15, style=rounded];
	edge [fontname = Tahoma ]
	`
	return ret;
}

function getEdgeItem(fsm) {
	let ret = ''

	fsm.events.forEach(e => {
		ret += (e.from + ' -> ' + e.to + ' [ label = ' + e.name + ', fontsize=12 ];\n');
	});
	return ret;
}

function getNodeItem(fsm) {
	let ret = ''
	// fsm.events.forEach(e => {
	// 	ret += event.from +  ' [shape="rect", label= ' + event.from + ']'
	// });	
	return ret
}


let g = convertFsmToDot(normalGameFsm);

function renderFsm(fsm) {
	let findSvg = $('svg');
	console.log(findSvg);
	if(findSvg.length > 0) {
		findSvg[0].remove();
	}

	let gr = convertFsmToDot(fsm);
	console.log(gr);

    let viz = new Viz();
    viz.renderSVGElement(gr)
    .then(function(element) {
        
        document.body.appendChild(element);
		panZoom = svgPanZoom(element, panConfig)
		panZoom.zoom(0.9);
    })
    .catch(error => {
        // Create a new Viz instance (@see Caveats page for more info)
        viz = new Viz();

        // Possibly display the error
        console.error(error);
    });
}

let panConfig = 
{
    zoomEnabled: true,
    controlIconsEnabled: true,
    fit: true,
    center: true,    
 }

 let panZoom;
$(document).ready(()=>{
    console.log('haha');

    renderFsm(mainFsm);
	
	setDropDown();
})

$(window).resize(function(){
    panZoom.resize();
    panZoom.center();
})


// var panZoomTiger = svgPanZoom('#demo-tiger');
// // or
// var svgElement = document.querySelector('#demo-tiger')
function setDropDown() {
	for(let i in farray) {
		$("#dp").append("<option value='" + i +  "'>" + farray[i].name +  "</option>");
	}

	$("#dp").change(function(){
		let i = $(this).val();
		let fsm = farray[i];
		renderFsm(fsm);
   });
}
