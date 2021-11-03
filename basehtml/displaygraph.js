

var zoomLevels = ['test','summary','title'];

var currentZoomLevel = 0;


// styles of the nodes (color,alpha, type of border, etc). See cytoscape doc
var nodeStyles = {
  'theorem': {
    nodeType: 'theorem',
    nodeStyle: {
      'background-color': '#006474',
      'background-opacity': 0.2,
      'width': 200,
      'height': 20,
      'border-color': '#006474',
      'border-style': 'solid',
      'border-width': 8,
      shape: 'roundrectangle'
    }
  },
  'definition': {
    nodeType: 'definition',
    nodeStyle: {
      'background-color': '#018a7a',
      'background-opacity': 0.2,
      'width': 200,
      'height': 20,
      'border-color': '#018a7a',
      'border-style': 'solid',
      'border-width': 8,
      shape: 'roundrectangle'
    }
  },
  'proposition': {
    nodeType: 'proposition',
    nodeStyle: {
      'background-color': '#0093ab',
      'background-opacity': 0.2,
      'width': 200,
      'height': 20,
      'border-color': '#0093ab',
      'border-style': 'solid',
      'border-width': 4,
      shape: 'roundrectangle'
    }
  },
  'lemma': {
    nodeType: 'lemma',
    nodeStyle: {
      'background-color': '#00b9ff',
      'background-opacity': 0.2,
      'width': 200,
      'height': 20,
      'border-color': '#00b9ff',
      'border-style': 'solid',
      'border-width': 2,
      shape: 'roundrectangle'
    }
  },
  'remark': {
    nodeType: 'lemma',
    nodeStyle: {
      'background-color': '#00b9ff',
      'background-opacity': 0.3,
      'width': 200,
      'height': 20,
      'border-color': 'black',
      'border-style': 'solid',
      'border-width': 1,
      shape: 'roundrectangle'
    }
  },
  'corollary': {
    nodeType: 'lemma',
    nodeStyle: {
      'background-color': '#0093ab',
      'background-opacity': 0.3,
      'width': 200,
      'height': 20,
      'border-color': 'black',
      'border-style': 'solid',
      'border-width': 1,
      shape: 'roundrectangle'
    }
  },
  'section': {
    nodeType: 'section',
    nodeStyle: {
      'background-color': '#d8d8d8',
      'background-opacity': 0.3,
      'width': 200,
      'height': 20,
      'border-color': 'black',
      'border-style': 'solid',
      'border-width': 5,
      shape: 'roundrectangle'
    }
  },
  'sectionTitle': {
    nodeType: 'sectionTitle',
    nodeStyle: {
      'background-color': '#383838',
      'background-opacity': 0.1,
      'width': 200,
      'height': 20,
      //'border-color': 'black',
      //'border-style': 'solid',
      //'border-width': 3,
      shape: 'roundrectangle'
    }
  },
  'subsection': {
    nodeType: 'subsection',
    nodeStyle: {
      'background-color': '#858585',
      'background-opacity': 0.2,
      'width': 200,
      'height': 20,
      'border-color': 'black',
      'border-style': 'dashed',
      'border-width': 4,
      shape: 'roundrectangle'
    }
  },
  'subsectionTitle': {
    nodeType: 'subsectionTitle',
    nodeStyle: {
      'background-color': '#383838',
      'background-opacity': 0.1,
      'width': 200,
      'height': 20,
      //'border-color': 'black',
      //'border-style': 'solid',
      //'border-width': 3,
      shape: 'roundrectangle'
    }
  }
};

//the graph has been loaded in another script
console.log(graph);


var elements = graph;


//get the heights of the nodes for each zoom level
for (var i = 0; i < graph.length; i++) {
  var node = graph[i];
  if(node.group == 'nodes'){

    switch(node.data.name){
    case "sectionTitle":
      var div = document.createElement("div");
      div.style.width = nodeWidth.toString() + "px";
      div.style.fontSize = fontSizeSection["section"].toString() + "px";
      console.log("fontsize",fontSizeSection["section"].toString(),node.data.id);
      div.innerHTML = node.data.text;
      //var text = document.createTextNode(node.data.text);
      //div.appendChild(text);
      document.getElementById("testdiv").appendChild(div);
      console.log("height",div.offsetHeight,div.getBoundingClientRect().height);
      node.data["height"] = div.offsetHeight + 100;
      node.data["width"] = div.offsetWidth + 350;
      console.log(node.data["height"])
      div.remove();
      break;
    
    case "subsectionTitle":
      var div = document.createElement("div");
      div.style.width = nodeWidth.toString() + "px";
      div.style.fontSize = fontSizeSection["subsection"].toString() + "px";
      div.innerHTML = node.data.text;
      //var text = document.createTextNode(node.data.text);
      //div.appendChild(text);
      document.getElementById("testdiv").appendChild(div);
      console.log("height",div.offsetHeight);
      node.data["height"] = div.offsetHeight + 100;
      node.data["width"] = div.offsetWidth + 80;
      div.remove();
      break;
    default:
      var div = document.createElement("div");
      div.style.width = nodeWidth.toString() + "px";
      div.style.fontSize = fontsSize[0].toString() + "px";
      div.innerHTML = node.data.text;
      //var text = document.createTextNode(node.data.text);
      //div.appendChild(text);
      document.getElementById("testdiv").appendChild(div);
      //console.log("height",div.offsetHeight);
      node.data["height"] = div.offsetHeight + 100;
      node.data["width"] = div.offsetWidth + 80;
      div.remove();

      if(node.data.hasSummary){
        var divs = document.createElement("div");
        divs.style.width = nodeWidth.toString() + "px";
        divs.style.fontSize = fontsSize[1].toString() + "px";
        divs.innerHTML = node.data.summary;
        //var text = document.createTextNode(node.data.text);
        //div.appendChild(text);
        document.getElementById("testdiv").appendChild(divs);
        //console.log("height",divs.offsetHeight);
        node.data["height"] = Math.max(node.data["height"],divs.offsetHeight + 100);
        node.data["width"] = Math.max(node.data["width"],divs.offsetWidth + 80);
        divs.remove();
      }
      if(node.data.hasTitle){
        var divt = document.createElement("div");
        divt.style.width = nodeWidth.toString() + "px";
        divt.style.fontSize = fontsSize[2].toString() + "px";
        divt.innerHTML = node.data.title;
        //var text = document.createTextNode(node.data.text);
        //div.appendChild(text);
        document.getElementById("testdiv").appendChild(divt);
        //console.log("width",divt.offsetWidth);
        node.data["height"] = Math.max(node.data["height"],divt.offsetHeight + 100);
        node.data["width"] = Math.max(node.data["width"],divt.offsetWidth + 80);
        divt.remove();
      }
    }
  }
}


// create Cy instance
var cyInstance = cytoscape({
  container: document.getElementById('cy'),
  layout: {
    name: layout_name
  },
  elements: elements,
  wheelSensitivity: 0.2,
  autoungrabify: !move_nodes,
  //autounselectify: true
});


/**
 * Create an HTML label that cytoscape can use from a latex text
 * @param {*} text 
 * @param {*} index given to the div so that we can find it later if needed
 * @returns {String}
 */
function getLabelFromText(text, index,fontSize = 20,bold=false) {
  if(bold){
    return String.raw`<div id= '` + '_graph_internal_' + index + String.raw`' style = "font-size:` + fontSize.toString() + String.raw`px;width=`+ nodeWidth.toString() + String.raw`px;"><b>` + text + String.raw`</b></div>`;
  }
  else{
    return String.raw`<div id= '` + '_graph_internal_' + index + String.raw`' style = "font-size:` + fontSize.toString() + String.raw`px;width=`+ nodeWidth.toString() + String.raw`px;">` + text + String.raw`</div>`;
  }
}

//More cytoscape style for nodes with HTML labels
cyInstance.nodeHtmlLabel([{
  query: '.l0',
  valign: "center",
  halign: "center",
  valignBox: "center",
  halignBox: "center",
  tpl: function (data) {


    if(data.name == "sectionTitle"){
      return getLabelFromText(data.text, data.id,fontSizeSection["section"]);
    }
    if(data.name == "subsectionTitle"){
      return getLabelFromText(data.text, data.id,fontSizeSection["subsection"]);
    }
    //console.log(cyInstance.zoom());

    if(currentZoomLevel == 1){
      if(data["hasSummary"]){
        return getLabelFromText(data.summary, data.id,fontsSize[1]);
      }
    }
    if(currentZoomLevel >= 1){
      if(data["hasTitle"]){
        return getLabelFromText(data.title, data.id,fontsSize[2],true);
      }
    }  
      //console.log(getLabelFromText(data.text, data.id,20));
    //return getLabelFromText(data.text, data.id,20);
    
    if(display_summary && data.hasOwnProperty("summary")){
      return getLabelFromText(data.summary, data.id,fontsSize[1]);
    }
    else{
      return getLabelFromText(data.text, data.id,fontsSize[0]);
    }
  }
},
{
  query: '.l1',
  valign: "center",
  halign: "left",
  valignBox: "top",
  halignBox: "left",
  tpl: function (data) {
    if(display_summary && data.hasOwnProperty("summary")){
      return getLabelFromText(data.summary, data.id);
    }
    else{
      return getLabelFromText(data.text, data.id);
    }
  }
},
{
  query: '.l2',
  valign: "center",
  halign: "center",
  valignBox: "center",
  halignBox: "center",
  tpl: function (data) {

    return "prout";
    console.log(cyInstance.zoom());

    if(display_summary && data.hasOwnProperty("summary")){
      return getLabelFromText(data.summary, data.id);
    }
    else{
      return getLabelFromText(data.text, data.id);
    }
  }
}
]);


//===============================================================================================================================
//===============================================================================================================================
//===============================================================================================================================
// MathJax

//Many browser do not have MathML support (Edge, chrome, and everything chrome based). In that case we need to enable MathJax
//When moving a node, it breaks the typesetting and equations stops beeing displayed correctly, hence we call mathjax every
//2 seconds.
//This is a horrible hack, and there should be a way to do that only when a node moves, but I couldn't find how.
//Besides, the nodes are not resized, so the typesetting should not break in the first place...
if (!hasMathML) {
  console.log("mathjax", MathJax);
  var istypesetting = false;
  window.setInterval(function () {
    if (istypesetting == false) {
      istypesetting == true;
      MathJax.typesetClear();
      MathJax.typeset();
      istypesetting == false;
    }
    else {
      console.log("no typesetting")
    }
  }, 2000);
}

//===============================================================================================================================
//===============================================================================================================================
//===============================================================================================================================
// Set correct style for nodes

//this sets the size of the node so that the text fits inside the node. Sadly, it means creating one specific nodeStyle per node.
//We wait 500ms before doing this so that the page is loaded properly and the typesetting of Latex equation is done, otherwise
//the size of the nodes can wrong
//500ms is entierly arbitrary and there should be a better way to do this

var styleAlreadySet = false;

function setStyle(){

    console.log("cuurentZoom",currentZoomLevel);
    var resizedStyle = [
      {
        selector: 'edge',
        style: {
          'width': 4,
          'target-arrow-shape': 'triangle',
          'line-color': 'black',//'#2972E8',
          'target-arrow-color': 'black',//'#2972E8',
          'arrow-scale': 3,
          //"curve-style": 'straight'//"unbundled-bezier",
          "curve-style": "unbundled-bezier",
          "control-point-distances": [40, -40],
          "control-point-weights": [0.250, 0.75],
          //"font-size" : 100
          "line-fill": "linear-gradient",
          "line-gradient-stop-colors": "black blue",
          "line-gradient-stop-positions": "0 100"
        }
      }
    ];

    for (var i = 0; i < graph.length; i++) {
      //console.log(ths[i])
      if (graph[i].group == "nodes") {
        //if(graph[i].data.html_name != ""){
        //console.log(graph[i].data.id);
        var elemid = '_graph_internal_' + graph[i].data.id;
        var width1 = document.getElementById(elemid).offsetWidth + 80;//getBoundingClientRect().width;
        var height1 = document.getElementById(elemid).offsetHeight + 100;//getBoundingClientRect().height;
        //console.log("width1",width1);
        console.log("height1",height1,graph[i].data.height,graph[i].data.id);
        /*if(!graph[i].data.hasOwnProperty("width")){
          graph[i].data["width"] = width1;
          graph[i].data["height"] = height1;
        }
        graph[i].data["width"] = Math.max(graph[i].data["width"],width1);
        graph[i].data["height"] = Math.max(graph[i].data["height"],height1);
        if(i==0){
          console.log("width",width1,graph[i].data["width"]);
        }*/
        //console.log(nodeStyles[graph[i].data.name]);
        var nodeStyle = {
          selector: 'node[id = "' + graph[i].data.id + '"]',
          style: {
            //'background-color': '#11479e',
            //'background-opacity': 0.5,
            'width': graph[i].data["width"],//document.getElementById('t1').getBoundingClientRect().width,//200,
            'height': graph[i].data["height"],
            //'border-color': 'red',
            //'border-width': 3,
            //'border-style': 'dashed',
            //shape: 'roundrectangle'
          }
        };
        Object.assign(nodeStyle.style, nodeStyles[graph[i].data.name].nodeStyle);
        nodeStyle.style.width = graph[i].data["width"];
        nodeStyle.style.height = graph[i].data["height"];
        resizedStyle.push(nodeStyle);
        var nodeStyleH = {
          selector: 'node[id = "' + graph[i].data.id + '"].highlight',
          style: {
            //'background-color': '#11479e',
            //'background-opacity': 0.5,
            'width': graph[i].data["width"],//document.getElementById('t1').getBoundingClientRect().width,//200,
            'height': graph[i].data["height"],
            //'border-color': 'red',
            //'border-width': 8,
            //'border-style': 'dashed',
            //shape: 'roundrectangle'
          }
        };
        Object.assign(nodeStyleH.style, nodeStyles[graph[i].data.name].nodeStyle);
        nodeStyleH.style.width = graph[i].data["width"];
        nodeStyleH.style.height = graph[i].data["height"];
        nodeStyleH.style['border-color'] = 'red';
        nodeStyleH.style['border-width'] = 10;
        resizedStyle.push(nodeStyleH);
      }
      else {
        /*var nodeStyle = {
          selector: 'node[id = "' + graph[i].data.id + '"]',
          style: {
          }
        };
        console.log("prout");
        console.log(graph[i].data);
        Object.assign(nodeStyle.style, nodeStyles[graph[i].data.name].nodeStyle);
        nodeStyle.style.width = width1;
        nodeStyle.style.height = height1;
        resizedStyle.push(nodeStyle);
        var nodeStyleH = {
          selector: 'node[id = "' + graph[i].data.id + '"].highlight',
          style: {
          }
        };
        Object.assign(nodeStyleH.style, nodeStyles[graph[i].data.name].nodeStyle);
        nodeStyleH.style.width = width1;
        nodeStyleH.style.height = height1;
        nodeStyleH.style['border-color'] = 'red';
        resizedStyle.push(nodeStyleH);*/
      }
      //}
    }
    cyInstance.style().fromJson(resizedStyle).update();
    cyInstance.layout(
      {
        name: layout_name
      }).run();
  
  currentZoomLevel = 0;
  styleAlreadySet = true;
}


setTimeout(setStyle, 500);





//=============================================================================================================
//=============================================================================================================
//Saving the graph

/**
 * Return a node of a given ID
 * @param {str} id Id of the node
 * @returns {Node}
 */
function getCyNode(id) {
  //there should be a  better way to do this
  nodes = cyInstance.nodes();
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].id() == id) {
      //console.log("found");
      return nodes[i];
    }
  }
  //console.log("not found");
}


/**
 * Save the graph with the current positions of the nodes to a file that the user can download.
 */
if(document.getElementById("saveButton")){
  function savePositions() {
    for (var i = 0; i < graph.length; i++) {
      if (graph[i].group == 'nodes') {
        node = getCyNode(graph[i].data.id);
        graph[i].position = node.position();
        //console.log(graph[i]);
      }
    }
    fileName = "graph_with_pos.txt";
    var a = document.createElement("a");
    var file = new Blob(['var graph = ' + JSON.stringify(graph) + ';'], { type: 'application/json' });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }
  document.getElementById("saveButton").onclick = savePositions;
}


//=============================================================================================================
//=============================================================================================================
//interactive ancestors

/**
 * Get all the ancestors of a node
 * @param {Node} node which we search the ancestor
 * @param {Node} currentAncestors List of all found ancestors
 * @returns 
 */
 function getAncestors(node, currentAncestors) {
  var ancestors = node.incomers();

  var node_in_ancestors = false;
  for (var i = 0; i < currentAncestors.length; i++) {
    if (currentAncestors[i] == node) node_in_ancestors = true;
  }
  if (!node_in_ancestors) currentAncestors.push(node);
  for (var i = 0; i < ancestors.size(); i++) {
    var elem = ancestors[i];
    if (!currentAncestors.includes(elem)) {
      currentAncestors.concat(getAncestors(elem, currentAncestors));
    }
  }
  return currentAncestors;
}

//change the style of the ancestors when the user hover the mouse on top of a node
cyInstance.on('mouseover', 'node', function (e) {
  var sel = e.target;
  var ancestors = getAncestors(sel, []);
  //console.log(ancestors);
  for (var i = 0; i < ancestors.length; i++) {
    ancestors[i].addClass('highlight');
  }
  if (!move_nodes) e.target.panify();
});
cyInstance.on('mouseout', 'node', function (e) {
  var sel = e.target;
  var ancestors = getAncestors(sel, []);
  //console.log(ancestors);
  for (var i = 0; i < ancestors.length; i++) {
    ancestors[i].removeClass('highlight');
  }
});

//=============================================================================================================
//=============================================================================================================


cyInstance.on('click', 'node', function(evt){
  //console.log( 'clicked ' + this.id() );
  //console.log(evt.target.parents().data())
  node = getCyNode(evt.target.id());
  //console.log(node.data());
  //window.location="#" + this.id();
  document.getElementById("MainNode").innerHTML =  String.raw`<hr style="height: 15px;box-shadow: inset 0 12px 12px -12px rgba(9, 84, 132);border:none;border-top: solid 2px;" />` + node.data().text

  var ancestors = node.incomers();
  var ancestorsText = "";
  for (var i = 0; i < ancestors.size(); i++) {
    var elem = ancestors[i];
    if(elem.data().hasOwnProperty("text"))
      ancestorsText += String.raw`<hr style="height: 15px;box-shadow: inset 0 12px 12px -12px rgba(9, 84, 132);border:none;border-top: solid 2px;" />` + elem.data().text;
  }
  document.getElementById("AncestorsNodes").innerHTML = ancestorsText;

});

cyInstance.on('zoom', function(evt){
  if(styleAlreadySet){
    var zoomLevelChanged = false;
    if(currentZoomLevel == 0){
      if(cyInstance.zoom() < zoomLevelsChanges[0]){
        currentZoomLevel = 1;
        zoomLevelChanged = true;
      }
    }
    if(currentZoomLevel == 2){
      if(cyInstance.zoom() > zoomLevelsChanges[1]){
        currentZoomLevel = 1;
        zoomLevelChanged = true;
      }
    }
    if(currentZoomLevel == 1){
      if(cyInstance.zoom() > zoomLevelsChanges[0]){
        currentZoomLevel = 0;
        zoomLevelChanged = true;
      }
      if(cyInstance.zoom() < zoomLevelsChanges[1]){
        currentZoomLevel = 2;
        zoomLevelChanged = true;
      }
    }
    //console.log( cyInstance.zoom());
    nodes = cyInstance.nodes();
    if(zoomLevelChanged == true){
      console.log("zoomLevel",currentZoomLevel,cyInstance.zoom(),styleAlreadySet)
      for (var i = 0; i < nodes.length; i++) {
        nodes[i].addClass('.highlight');
        nodes[i].removeClass('.highlight');
      }
      //setStyle();
    }
  }
  //setStyle();
  //console.log(nodes);
});