

var zoomLevels = ['test','summary','title'];

var currentZoomLevel = 0;

graph = graphWithStyle.graph;
nodeStyles = graphWithStyle.style;



//the graph has been loaded in another script
console.log(graph);


var elements = graph;


function computeNodeSizes(useMathJax){
  //get the heights of the nodes for each zoom level
  //for (var i = 0; i < graph.length; i++) {
  console.log("computeNodeSizes",useMathJax,display_main_text,graph.m);

  var nodeList = [];
  var divList = [];

  for(var i = 0; i < graph.length; i++){
    var node = graph[i];
    console.log(node);
    if(node.group == 'nodes'){
      node.data["height"] = 0;
      node.data["width"] = 0;
      console.log("SIZE:",nodeStyles[node.data.name].nodeStyle["node-width"])
      nodeWidth = nodeStyles[node.data.name].nodeStyle["node-width"]
      if(!nodeWidth) nodeWidth = 500;
      //nodeWidth=700
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
        nodeList.push(node);
        divList.push(div);
        console.log("height",div.offsetHeight,div.getBoundingClientRect().height);
        //node.data["height"] = div.scrollHeight + 100;
        //node.data["width"] = div.scrollWidth + 350;
        console.log(node.data["height"])
        //div.remove();
        break;
      
      case "subsectionTitle":
        var div = document.createElement("div");
        div.style.width = nodeWidth.toString() + "px";
        div.style.fontSize = fontSizeSection["subsection"].toString() + "px";
        div.innerHTML = node.data.text;
        //var text = document.createTextNode(node.data.text);
        //div.appendChild(text);
        document.getElementById("testdiv").appendChild(div);
        nodeList.push(node);
        divList.push(div);
        console.log("height",div.offsetHeight);
        //node.data["height"] = div.scrollHeight + 100;
        //node.data["width"] = div.scrollWidth + 80;
        //div.remove();
        break;
      default:
        node.data["height"] = 0;
        node.data["width"] = 0;
        console.log(node.data.id,node.data.hasSummary,node.data.hasTitle,((!node.data.hasSummary) && (!node.data.hasTitle)))
        if((display_main_text) || ((!node.data.hasSummary) && (!node.data.hasTitle))){
          var div = document.createElement("div");
          div.style.width = nodeWidth.toString() + "px";
          div.style.fontSize = fontsSize[0].toString() + "px";
          div.innerHTML = node.data.text;
          //var text = document.createTextNode(node.data.text);
          //div.appendChild(text);
          document.getElementById("testdiv").appendChild(div);
          nodeList.push(node);
          divList.push(div);
          console.log("BUGGG",display_main_text,node.data.hasSummary,node.data.hasTitle,node.data.id);
          //console.log("height",div.offsetHeight);
          //node.data["height"] = div.scrollHeight + 100;
          //node.data["width"] = div.scrollWidth + 80;
          //div.remove();
        }

        if(node.data.hasSummary){
          var divs = document.createElement("div");
          divs.style.width = nodeWidth.toString() + "px";
          divs.style.fontSize = fontsSize[1].toString() + "px";
          divs.style.border = "2px solid black";
          divs.innerHTML = node.data.summary;
          //var text = document.createTextNode(node.data.text);
          //div.appendChild(text);
          document.getElementById("testdiv").appendChild(divs);
          nodeList.push(node);
          divList.push(divs);
          //console.log("marginleft",divs.currentStyle.marginLeft);
          //node.data["height"] = Math.max(node.data["height"],divs.scrollHeight + 100);
          //node.data["width"] = Math.max(node.data["width"],divs.scrollWidth+80);
          //divs.remove();
        }
        if(node.data.hasTitle){
          var divt = document.createElement("div");
          divt.style.width = nodeWidth.toString() + "px";
          divt.style.fontSize = fontsSize[2].toString() + "px";
          divt.innerHTML = node.data.title;
          //var text = document.createTextNode(node.data.text);
          //div.appendChild(text);
          document.getElementById("testdiv").appendChild(divt);
          nodeList.push(node);
          divList.push(divt);
          //console.log("width",divt.offsetWidth);
          //node.data["height"] = Math.max(node.data["height"],divt.scrollHeight + 100);
          //node.data["width"] = Math.max(node.data["width"],divt.scrollWidth + 80);
          //divt.remove();
        }
      }
    }
  }

  if(useMathJax){
    console.log("using MATHKAX!")
    MathJax.typeset(divList);
  }

  for(var i = 0; i < nodeList.length; i++){
    var node = nodeList[i];
    var div = divList[i];
    switch(node.data.name){
      case "sectionTitle":
        node.data["height"] = div.scrollHeight + 100;
        node.data["width"] = div.scrollWidth + 350;
        console.log(node.data["height"])
        break;
      
      case "subsectionTitle":
        console.log("height",div.offsetHeight);
        node.data["height"] = div.scrollHeight + 100;
        node.data["width"] = div.scrollWidth + 80;
        break;
      default:
        node.data["height"] = Math.max(node.data["height"],div.scrollHeight + 50);
        node.data["width"] = Math.max(node.data["width"],div.scrollWidth+80);
      }
      div.remove();
  }
}

if(hasMathML) computeNodeSizes(false);


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
function getLabelFromText(text, index,nodeWidth,fontSize = 20,bold=false) {
  if(bold){
    return String.raw`<div id= '` + '_graph_internal_' + index + String.raw`' style = "font-size:` + fontSize.toString() + String.raw`px;width:`+ nodeWidth.toString() + String.raw`px;margin:30px;"><b>` + text + String.raw`</b></div>`;
  }
  else{
    return String.raw`<div id= '` + '_graph_internal_' + index + String.raw`' style = "font-size:` + fontSize.toString() + String.raw`px;width:`+ nodeWidth.toString() + String.raw`px;margin:30px;">` + text + String.raw`</div>`;
  }
}

//More cytoscape style for nodes with HTML labels
cyInstance.nodeHtmlLabel([{
  query: '.l0',
  valign: "center",
  halign: "left",
  valignBox: "center",
  halignBox: "right",
  tpl: function (data) {

    nodeWidth = nodeStyles[data.name].nodeStyle["node-width"]
    if(!nodeWidth) nodeWidth = 500
    if(data.name == "sectionTitle"){
      return getLabelFromText(data.text, data.id,nodeWidth,fontSizeSection["section"]);
    }
    if(data.name == "subsectionTitle"){
      return getLabelFromText(data.text, data.id,nodeWidth,fontSizeSection["subsection"]);
    }
    //console.log(cyInstance.zoom());

    if(currentZoomLevel == 1){
      if(data["hasSummary"]){
        return getLabelFromText(data.summary, data.id,nodeWidth,fontsSize[1]);
      }
    }
    if(currentZoomLevel >= 1){
      if(data["hasTitle"]){
        return getLabelFromText(data.title, data.id,nodeWidth,fontsSize[2],true);
      }
    }  
      //console.log(getLabelFromText(data.text, data.id,20));
    //return getLabelFromText(data.text, data.id,20);
    
    if(!display_main_text && data.hasSummary){
      //if(data.hasSummary)
        return getLabelFromText(data.summary, data.id,nodeWidth,fontsSize[1]);
    }
    
    if(!display_main_text && data.hasTitle){
      return getLabelFromText(data.title, data.id,nodeWidth,fontsSize[2],true);
    }

    return getLabelFromText(data.text, data.id,nodeWidth,fontsSize[0]);
    
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
      return getLabelFromText(data.summary, data.id,nodeStyles[data.name].nodeStyle["node-width"]);
    }
    else{
      return getLabelFromText(data.text, data.id,nodeStyles[data.name].nodeStyle["node-width"]);
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
/*if (!hasMathML) {
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
  }, 10000);
}*/

//===============================================================================================================================
//===============================================================================================================================
//===============================================================================================================================
// Set correct style for nodes

//this sets the size of the node so that the text fits inside the node. Sadly, it means creating one specific nodeStyle per node.
//We wait 500ms before doing this so that the page is loaded properly and the typesetting of Latex equation is done, otherwise
//the size of the nodes can wrong
//500ms is entierly arbitrary and there should be a better way to do this

var styleAlreadySet = false;

async function asyncSetStyle() {
  while(typeof cyInstance == "undefined") {
      await sleep(100);
  }
  setStyle();
}

function setStyle(){

    console.log("cuurentZoom",currentZoomLevel);
    var resizedStyle = [
      {
        selector: 'edge[type="strong"]',
        style: {
          'width': 2,
          'target-arrow-shape': 'triangle',
          'line-color': 'yellow',//'#2972E8',
          'target-arrow-color': 'black',//'#2972E8',
          'arrow-scale': 3,
          "curve-style": 'straight',
          "line-fill": "linear-gradient",
          "line-gradient-stop-colors": "black blue",
          'line-style': 'dashed',
          'line-dash-offset': 500,
          "line-gradient-stop-positions": "0 100"
        }
      },
      {
        selector: 'edge[type="strong"][visibility=0]',
        style: {
          'display' : 'none',
          'width': 6,
          'target-arrow-shape': 'triangle',
          'line-color': 'yellow',//'#2972E8',
          'target-arrow-color': 'black',//'#2972E8',
          'arrow-scale': 3,
          "curve-style": 'straight',
          "line-fill": "linear-gradient",
          "line-gradient-stop-colors": "black blue",
          "line-gradient-stop-positions": "0 100"
        }
      },
      {
        selector: 'edge[type="strong"].highlight',
        style: {
          'display' : 'element',
          'width': 15,
          'target-arrow-shape': 'triangle',
          'line-color': 'black',//'#2972E8',
          'target-arrow-color': 'black',//'#2972E8',
          'arrow-scale': 2,
          "curve-style": 'straight',
          "line-fill": "linear-gradient",
          "line-gradient-stop-colors": "red red",
          'line-style': 'solid',          
          "line-gradient-stop-positions": "0 100"
        }
      },
      {
        selector: 'edge[type="weak"]',
        style: {
          'display': 'none',
          'width': 2,
          'target-arrow-shape': 'triangle',
          'line-color': 'red',//'#2972E8',
          'target-arrow-color': 'black',//'#2972E8',
          'arrow-scale': 3,
          "curve-style": 'straight',
          "line-fill": "linear-gradient",
          "line-gradient-stop-colors": "black blue",
          'line-style': 'dashed',
          "line-gradient-stop-positions": "0 100"
        }
      },
      {
        selector: 'edge[type="weak"].highlight',
        style: {
          'display': 'element',
          'width': 8,
          'target-arrow-shape': 'triangle',
          'line-color': 'red',//'#2972E8',
          'target-arrow-color': 'black',//'#2972E8',
          'arrow-scale': 3,
          "curve-style": 'straight',
          "line-fill": "linear-gradient",
          "line-gradient-stop-colors": "red red",
          'line-style': 'dashed',
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
        //console.log("width1",width1);
        //console.log("height1",height1,graph[i].data.height,graph[i].data.id);
        //console.log(graph[i].data.id,document.getElementById(elemid).style);
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
        nodeStyle.style['background-opacity'] = nodeStyle.style['background-opacity'] /4;        
        nodeStyle.style['border-width'] = nodeStyle.style['border-width']/4;
        nodeStyle.style['border-style'] = 'dashed';
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
        //nodeStyleH.style['border-color'] = 'red';
        //nodeStyleH.style['border-width'] = 10;
        resizedStyle.push(nodeStyleH);
      }
    }
    				// demo your ext
            /*cyInstance.edgeEditing({
              undoable: true,
              bendRemovalSensitivity: 16,
              enableMultipleAnchorRemovalOption: true,
              initAnchorsAutomatically: false,
              useTrailingDividersAfterContextMenuOptions: false,
              enableCreateAnchorOnDrag: true
            });*/
            
    cyInstance.style().fromJson(resizedStyle).update();
    cyInstance.edgeEditing({
      undoable: true,
      bendRemovalSensitivity: 16,
      enableMultipleAnchorRemovalOption: true,
      initAnchorsAutomatically: false,
      useTrailingDividersAfterContextMenuOptions: false,
      enableCreateAnchorOnDrag: false
    });
    cyInstance.style().update();
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
      else{
        if("cyedgebendeditingWeights" in graph[i].data){
          if(graph[i].data["cyedgebendeditingWeights"].length > 0 )
            graph[i]["classes"]=  'edgebendediting-hasbendpoints'; 
        }
        if("cyedgecontroleditingWeights" in graph[i].data){
          if(graph[i].data["cyedgecontroleditingWeights"].length > 0 )
            graph[i]["classes"]=  'edgecontrolediting-hascontrolpoints'; 
        }
      }
    }
    fileName = "graph_with_pos.txt";
    var a = document.createElement("a");
    graphWithStyle = {"graph":graph,"style":nodeStyles,"full_text":graphWithStyle["full_text"]};
    var file = new Blob(['var graphWithStyle = ' + JSON.stringify(graphWithStyle) + ';'], { type: 'application/json' });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }
  document.getElementById("saveButton").onclick = savePositions;
}



if (!move_nodes) cyInstance.filter('node').panify();

var divsToTypeset = []; //only used if mathjax is used

function getDivsToTypeset(node){
  divName = '_graph_internal_' + node.id();
  var divList = [divName];
  var childrens = node.children();
  for(var i = 0; i < childrens.length; i++){
    divList = divList.concat(getDivsToTypeset(childrens[i]));
  }
  return divList;
}

//disable node movement if needed
cyInstance.on('mouseover', 'node', function (e) {
  //if (!move_nodes) e.target.panify();
  if(!hasMathML){
    divsToTypeset = divsToTypeset.concat(getDivsToTypeset(e.target))
  }
});



//=============================================================================================================
//=============================================================================================================
//interactive ancestors

/**
 * Get all the ancestors of a node (only strong links)
 * @param {Node} node which we search the ancestor
 * @param {Node} currentAncestors List of all found ancestors
 * @param {Edge} currentAncestorsEdges List of all edges found between ancestors
 * @returns 
 */
 function getAncestors(node, currentAncestors,currentAncestorsEdges) {

  for (var i = 0; i < currentAncestors.length; i++) {
    if (currentAncestors[i] == node) return [currentAncestors,currentAncestorsEdges];
  }

  currentAncestors.push(node);

  var ancestors = node.incomers('edge[type="strong"]');
  //currentAncestorsEdges.concat(ancestors);
  //console.log("ii",currentAncestorsEdges);
  //console.log("aa",ancestors)
  for (var i = 0; i < ancestors.size(); i++) {
    currentAncestorsEdges.push(ancestors[i]);
    var elem = ancestors[i].source();
    if (!currentAncestors.includes(elem)) {
      var val = getAncestors(elem, currentAncestors,currentAncestorsEdges);
      //currentAncestors.concat(val[0]);
      //currentAncestorsEdges.concat(val[1]);
    }
  }
  //console.log("i",currentAncestorsEdges);
  return [currentAncestors,currentAncestorsEdges];
}

//=============================================================================================================
//=============================================================================================================

cyInstance.filter('node').addClass('highlight');

cyNodes = cyInstance.filter('node'); //this is not an array...

var highlighted_items = [];
for(var i =0; i < cyNodes.length;i++){
  highlighted_items.push(cyNodes[i]);
}
var selectedNode = null;

function selectNode(target,center = false){
  node = getCyNode(target.id());
  var sel = target;
  parent = node.parent();
  //Highlighting
  for (var i = 0; i < highlighted_items.length; i++) {
    highlighted_items[i].removeClass('highlight');
    if(!hasMathML){
      divName = '_graph_internal_' + highlighted_items[i].id();
      if(!divsToTypeset.includes(divName))
        divsToTypeset.push(divName);
    }

    if(center == true){
      cyInstance.center(node)
    }
  }

  
  document.getElementById('tablecontent' + target.id()).style.color = "red";
  if(selectedNode != null){
    document.getElementById('tablecontent' + selectedNode.data().id).style.color = "inherit";
  }

  if(node == selectedNode){
    selectedNode = null;
    highlighted_items = [];
    for(var i =0; i < cyNodes.length;i++){
      highlighted_items.push(cyNodes[i]);
    }
  }
  else{
    var val = getAncestors(sel, [],[]);
    highlighted_items = val[0].concat(val[1]); //add nodes
    //in addition to that, we hightight any degree 1 ancestors, even with weak dependencies
    var incomers = node.incomers();
    highlighted_items = highlighted_items.concat(incomers);
    //we also add the ancestors of the section/subsection/whatever containing the node 
    var val2 = getAncestors(parent, [],[]);
    highlighted_items = highlighted_items.concat(val2[0].concat(val2[1]));
    selectedNode = node;

  }

  for (var i = 0; i < highlighted_items.length; i++) {
    highlighted_items[i].addClass('highlight');
    if(!hasMathML){
      divsToTypeset = divsToTypeset.concat(getDivsToTypeset(highlighted_items[i]));
    }
  }


  //displaying text on the right, if left panel exists
  if(document.getElementById("MainNode")){
    document.getElementById("MainNode").innerHTML =  String.raw`<div style="border: 4px solid black;padding:5px">` + node.data().text + `</div>`;

    var ancestors = node.incomers();
    var ancestorsText = "";
    for (var i = 0; i < ancestors.size(); i++) {
      var elem = ancestors[i];
      if(elem.data().hasOwnProperty("text"))
        ancestorsText += String.raw`<div style="border: 2px solid grey;padding:5px">` 
        + elem.data().text + `</div><br>`;
    }
    document.getElementById("AncestorsNodes").innerHTML = ancestorsText;

    if(!hasMathML){
      divsToTypeset.push("LatexPage");
    }
  }
}

cyInstance.on('click', 'node', function(evt){
  selectNode(evt.target)
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
      if(!hasMathML){
        divsToTypeset = ['cy'];
      }
      //setStyle();
    }
  }
  //setStyle();
  //console.log(nodes);
});


//===========================================================================================================
//===========================================================================================================

//determine the max "display_order" of the nodes
max_display_order = 0
for(var i = 0; i < graph.length; i++){
  var node = graph[i];
  console.log(node);
  if(node.group == 'nodes'){
    max_display_order = Math.max(max_display_order,node.data["display_order"])
  }
}
current_display_order = max_display_order


//a list of node names that are title related and that should not be selected when pressing the forward/backward buttons
titleNamesList = ["section","sectionTitle","subsection","subsectionTitle"]

function set_display_order(display_order){
  nodes = cyInstance.nodes();
  console.log(display_order)
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].data()["display_order"] <= display_order) {
      nodes[i].addClass('l0');
      nodes[i].style("display", "element");
    }
    else{
      nodes[i].removeClass('l0');
      nodes[i].style("display", "none");
    }
    if (nodes[i].data()["display_order"] == display_order) {
      console.log("selecting node",nodes[i].data().name,titleNamesList.includes(nodes[i].data().name))
      if(!titleNamesList.includes(nodes[i].data().name))
      selectNode(nodes[i])
    }
  }
}

