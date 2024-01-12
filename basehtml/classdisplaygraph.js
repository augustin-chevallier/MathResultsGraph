var displayGraphInstance = null;

class DisplayGraph {
    constructor(graphWithStyle, layout_name, move_nodes, hasMathML,
        zoomLevelsChanges, fontSizeSection, fontsSize, display_main_text,graph_fileName) {
        this.zoomLevels = ['test', 'summary', 'title'];
        this.currentZoomLevel = 0;
        this.graphWithStyle = graphWithStyle;
        this.graph = graphWithStyle.graph;
        this.nodeStyles = graphWithStyle.style;
        this.elements = this.graph;
        this.display_main_text = display_main_text;
        this.zoomLevelsChanges = zoomLevelsChanges;
        this.fontSizeSection = fontSizeSection;
        this.fontsSize = fontsSize;
        this.divsToTypeset = []; //only used if mathjax is used
        this.styleAlreadySet = false;
        this.hasMathML = hasMathML;
        this.move_nodes = move_nodes;
        this.graph_fileName = graph_fileName;
        this.selectedNode = null;

        //var nodeS = this.nodeStyles
        displayGraphInstance = this;

        //determine the max "display_order" of the nodes
        this.max_display_order = 0
        this.current_display_order = displayGraphInstance.max_display_order
        //a list of node names that are title related and that should not be selected when pressing the forward/backward buttons
        this.titleNamesList = ["section", "sectionTitle", "subsection", "subsectionTitle"]

        // ... Other constructor logic ...

        if (displayGraphInstance.hasMathML) displayGraphInstance.computeNodeSizes(false);

        displayGraphInstance.cyInstance = cytoscape({
            container: document.getElementById('cy'),
            layout: {
                name: layout_name
            },
            elements: displayGraphInstance.elements,
            wheelSensitivity: 0.2,
            autoungrabify: !move_nodes,
        });

        //More cytoscape style for nodes with HTML labels
        displayGraphInstance.cyInstance.nodeHtmlLabel([{
            query: '.l0',
            valign: "center",
            halign: "left",
            valignBox: "center",
            halignBox: "right",
            tpl: function (data) {

                nodeWidth = displayGraphInstance.nodeStyles[data.name].nodeStyle["node-width"]
                if (!nodeWidth) nodeWidth = 500
                if (data.name == "sectionTitle") {
                    return displayGraphInstance.getLabelFromText(data.text, data.id, nodeWidth, displayGraphInstance.fontSizeSection["section"]);
                }
                if (data.name == "subsectionTitle") {
                    return displayGraphInstance.getLabelFromText(data.text, data.id, nodeWidth, displayGraphInstance.fontSizeSection["subsection"]);
                }
                //console.log(cyInstance.zoom());

                if (displayGraphInstance.currentZoomLevel == 1) {
                    if (data["hasSummary"]) {
                        return displayGraphInstance.getLabelFromText(data.summary, data.id, nodeWidth, displayGraphInstance.fontsSize[1]);
                    }
                }
                if (displayGraphInstance.currentZoomLevel >= 1) {
                    if (data["hasTitle"]) {
                        return displayGraphInstance.getLabelFromText(data.title, data.id, nodeWidth, displayGraphInstance.fontsSize[2], true);
                    }
                }
                //console.log(getLabelFromText(data.text, data.id,20));
                //return getLabelFromText(data.text, data.id,20);

                if (!displayGraphInstance.display_main_text && data.hasSummary) {
                    //if(data.hasSummary)
                    return displayGraphInstance.getLabelFromText(data.summary, data.id, nodeWidth, displayGraphInstance.fontsSize[1]);
                }

                if (!displayGraphInstance.display_main_text && data.hasTitle) {
                    return displayGraphInstance.getLabelFromText(data.title, data.id, nodeWidth, displayGraphInstance.fontsSize[2], true);
                }

                return displayGraphInstance.getLabelFromText(data.text, data.id, nodeWidth, displayGraphInstance.fontsSize[0]);

            }
        },
        {
            query: '.l1',
            valign: "center",
            halign: "left",
            valignBox: "top",
            halignBox: "left",
            tpl: function (data) {
                if (display_summary && data.hasOwnProperty("summary")) {
                    return getLabelFromText(data.summary, data.id, displayGraphInstance.nodeStyles[data.name].nodeStyle["node-width"]);
                }
                else {
                    return getLabelFromText(data.text, data.id, displayGraphInstance.nodeStyles[data.name].nodeStyle["node-width"]);
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
                displayGraphInstance.styleAlreadySet = true;
                return "prout";
                console.log(cyInstance.zoom());

                if (display_summary && data.hasOwnProperty("summary")) {
                    return getLabelFromText(data.summary, data.id);
                }
                else {
                    return getLabelFromText(data.text, data.id);
                }
            }
        }
        ]);

        setTimeout(displayGraphInstance.setStyle, 500);

        /**
        * Save thedisplayGraphInstance.graph with the current positions of the nodes to a file that the user can download.
        */
        if (document.getElementById("saveButton")) {
            function savePositions() {
                for (var i = 0; i < displayGraphInstance.graph.length; i++) {
                    if (displayGraphInstance.graph[i].group == 'nodes') {
                        node = displayGraphInstance.getCyNode(displayGraphInstance.graph[i].data.id);
                        displayGraphInstance.graph[i].position = node.position();
                        //console.log(graph[i]);
                    }
                    else {
                        if ("cyedgebendeditingWeights" in displayGraphInstance.graph[i].data) {
                            if (displayGraphInstance.graph[i].data["cyedgebendeditingWeights"].length > 0)
                                displayGraphInstance.graph[i]["classes"] = 'edgebendediting-hasbendpoints';
                        }
                        if ("cyedgecontroleditingWeights" in displayGraphInstance.graph[i].data) {
                            if (displayGraphInstance.graph[i].data["cyedgecontroleditingWeights"].length > 0)
                                displayGraphInstance.graph[i]["classes"] = 'edgecontrolediting-hascontrolpoints';
                        }
                    }
                }
                let fileName = "graph_with_pos.txt";
                var a = document.createElement("a");
                let graphWithStyle = { "graph": displayGraphInstance.graph, "style": displayGraphInstance.nodeStyles, "full_text": displayGraphInstance.graphWithStyle["full_text"] };
                var blob = new Blob(['var graphWithStyle = ' + JSON.stringify(graphWithStyle, null, 4) + ';'], { type: 'application/json' });
                var file = new File([blob],displayGraphInstance.graph_fileName,{type: "text/plain"});
                uploadFile(file)
                //a.href = URL.createObjectURL(file);
                //a.download = fileName;
                //a.click();
            }
            document.getElementById("saveButton").onclick = savePositions;
        }



        if (!displayGraphInstance.move_nodes) displayGraphInstance.cyInstance.filter('node').panify();

        //disable node movement if needed
        displayGraphInstance.cyInstance.on('mouseover', 'node', function (e) {
            //if (!move_nodes) e.target.panify();
            if (!hasMathML) {
                displayGraphInstance.divsToTypeset = displayGraphInstance.divsToTypeset.concat(getDivsToTypeset(e.target))
            }
        });

        displayGraphInstance.cyInstance.filter('node').addClass('highlight');

        displayGraphInstance.cyNodes = displayGraphInstance.cyInstance.filter('node'); //displayGraphInstance is not an array...

        displayGraphInstance.highlighted_items = [];
        for (var i = 0; i < displayGraphInstance.cyNodes.length; i++) {
            displayGraphInstance.highlighted_items.push(displayGraphInstance.cyNodes[i]);
        }


        displayGraphInstance.cyInstance.on('click', 'node', function (evt) {
            displayGraphInstance.selectNode(evt.target)
        });

        displayGraphInstance.cyInstance.on('zoom', function (evt) {
            var zoomLevelChanged = false;
            console.log(displayGraphInstance.currentZoomLevel,displayGraphInstance.styleAlreadySet,displayGraphInstance.cyInstance.zoom() )
            if (displayGraphInstance.styleAlreadySet) {
                if (displayGraphInstance.currentZoomLevel == 0) {
                    if (displayGraphInstance.cyInstance.zoom() < displayGraphInstance.zoomLevelsChanges[0]) {
                        displayGraphInstance.currentZoomLevel = 1;
                        zoomLevelChanged = true;
                    }
                }
                if (displayGraphInstance.currentZoomLevel == 2) {
                    if (displayGraphInstance.cyInstance.zoom() > displayGraphInstance.zoomLevelsChanges[1]) {
                        displayGraphInstance.currentZoomLevel = 1;
                        zoomLevelChanged = true;
                    }
                }
                if (displayGraphInstance.currentZoomLevel == 1) {
                    if (displayGraphInstance.cyInstance.zoom() > displayGraphInstance.zoomLevelsChanges[0]) {
                        displayGraphInstance.currentZoomLevel = 0;
                        zoomLevelChanged = true;
                    }
                    if (displayGraphInstance.cyInstance.zoom() < displayGraphInstance.zoomLevelsChanges[1]) {
                        displayGraphInstance.currentZoomLevel = 2;
                        zoomLevelChanged = true;
                    }
                }
                //console.log(displayGraphInstance.cyInstance.zoom());
                let nodes = displayGraphInstance.cyInstance.nodes();
                if (zoomLevelChanged == true) {
                    console.log("zoomLevel", displayGraphInstance.currentZoomLevel, displayGraphInstance.cyInstance.zoom(), displayGraphInstance.styleAlreadySet)
                    for (var i = 0; i < nodes.length; i++) {
                        nodes[i].addClass('.highlight');
                        nodes[i].removeClass('.highlight');
                    }
                    if (!hasMathML) {
                        displayGraphInstance.divsToTypeset = ['cy'];
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
        for (var i = 0; i < displayGraphInstance.graph.length; i++) {
            var node = displayGraphInstance.graph[i];
            console.log(node);
            if (node.group == 'nodes') {
                displayGraphInstance.max_display_order = Math.max(displayGraphInstance.max_display_order, node.data["display_order"])
            }
        }
        displayGraphInstance.current_display_order = displayGraphInstance.max_display_order
    }




    computeNodeSizes(useMathJax) {
        //get the heights of the nodes for each zoom level
        //for (var i = 0; i <displayGraphInstance.graph.length; i++) {
        console.log("computeNodeSizes", useMathJax, displayGraphInstance.display_main_text, displayGraphInstance.graph.m);

        var nodeList = [];
        var divList = [];

        for (var i = 0; i < displayGraphInstance.graph.length; i++) {
            var node = displayGraphInstance.graph[i];
            console.log(node);
            if (node.group == 'nodes') {
                node.data["height"] = 0;
                node.data["width"] = 0;
                console.log("SIZE:", displayGraphInstance.nodeStyles[node.data.name].nodeStyle["node-width"])
                nodeWidth = displayGraphInstance.nodeStyles[node.data.name].nodeStyle["node-width"]
                if (!nodeWidth) nodeWidth = 500;
                //nodeWidth=700
                switch (node.data.name) {
                    case "sectionTitle":
                        var div = document.createElement("div");
                        div.style.width = nodeWidth.toString() + "px";
                        div.style.fontSize = displayGraphInstance.fontSizeSection["section"].toString() + "px";
                        console.log("fontsize", displayGraphInstance.fontSizeSection["section"].toString(), node.data.id);
                        div.innerHTML = node.data.text;
                        //var text = document.createTextNode(node.data.text);
                        //div.appendChild(text);
                        document.getElementById("testdiv").appendChild(div);
                        nodeList.push(node);
                        divList.push(div);
                        console.log("height", div.offsetHeight, div.getBoundingClientRect().height);
                        //node.data["height"] = div.scrollHeight + 100;
                        //node.data["width"] = div.scrollWidth + 350;
                        console.log(node.data["height"])
                        //div.remove();
                        break;

                    case "subsectionTitle":
                        var div = document.createElement("div");
                        div.style.width = nodeWidth.toString() + "px";
                        div.style.fontSize = displayGraphInstance.fontSizeSection["subsection"].toString() + "px";
                        div.innerHTML = node.data.text;
                        //var text = document.createTextNode(node.data.text);
                        //div.appendChild(text);
                        document.getElementById("testdiv").appendChild(div);
                        nodeList.push(node);
                        divList.push(div);
                        console.log("height", div.offsetHeight);
                        //node.data["height"] = div.scrollHeight + 100;
                        //node.data["width"] = div.scrollWidth + 80;
                        //div.remove();
                        break;
                    default:
                        node.data["height"] = 0;
                        node.data["width"] = 0;
                        console.log(node.data.id, node.data.hasSummary, node.data.hasTitle, ((!node.data.hasSummary) && (!node.data.hasTitle)))
                        if ((display_main_text) || ((!node.data.hasSummary) && (!node.data.hasTitle))) {
                            var div = document.createElement("div");
                            div.style.width = nodeWidth.toString() + "px";
                            div.style.fontSize = displayGraphInstance.fontsSize[0].toString() + "px";
                            div.innerHTML = node.data.text;
                            //var text = document.createTextNode(node.data.text);
                            //div.appendChild(text);
                            document.getElementById("testdiv").appendChild(div);
                            nodeList.push(node);
                            divList.push(div);
                            console.log("BUGGG", displayGraphInstance.display_main_text, node.data.hasSummary, node.data.hasTitle, node.data.id);
                            //console.log("height",div.offsetHeight);
                            //node.data["height"] = div.scrollHeight + 100;
                            //node.data["width"] = div.scrollWidth + 80;
                            //div.remove();
                        }

                        if (node.data.hasSummary) {
                            var divs = document.createElement("div");
                            divs.style.width = nodeWidth.toString() + "px";
                            divs.style.fontSize = displayGraphInstance.fontsSize[1].toString() + "px";
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
                        if (node.data.hasTitle) {
                            var divt = document.createElement("div");
                            divt.style.width = nodeWidth.toString() + "px";
                            divt.style.fontSize = displayGraphInstance.fontsSize[2].toString() + "px";
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

        if (useMathJax) {
            console.log("using MATHKAX!")
            MathJax.typeset(divList);
        }

        for (var i = 0; i < nodeList.length; i++) {
            var node = nodeList[i];
            var div = divList[i];
            switch (node.data.name) {
                case "sectionTitle":
                    node.data["height"] = div.scrollHeight + 100;
                    node.data["width"] = div.scrollWidth + 350;
                    console.log(node.data["height"])
                    break;

                case "subsectionTitle":
                    console.log("height", div.offsetHeight);
                    node.data["height"] = div.scrollHeight + 100;
                    node.data["width"] = div.scrollWidth + 80;
                    break;
                default:
                    node.data["height"] = Math.max(node.data["height"], div.scrollHeight + 50);
                    node.data["width"] = Math.max(node.data["width"], div.scrollWidth + 80);
            }
            div.remove();
        }
    }

    async asyncSetStyle() {
        while (typeof displayGraphInstance.cyInstance == "undefined") {
            await sleep(100);
        }
        displayGraphInstance.setStyle();
    }

    setStyle() {

        console.log(displayGraphInstance)
        console.log("cuurentZoom", displayGraphInstance.currentZoomLevel);
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
                    'display': 'none',
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
                    'display': 'element',
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

        for (var i = 0; i < displayGraphInstance.graph.length; i++) {
            //console.log(ths[i])
            if (displayGraphInstance.graph[i].group == "nodes") {
                //if(graph[i].data.html_name != ""){
                //console.log(graph[i].data.id);
                var elemid = '_graph_internal_' + displayGraphInstance.graph[i].data.id;
                //console.log("width1",width1);
                //console.log("height1",height1,graph[i].data.height,graph[i].data.id);
                //console.log(graph[i].data.id,document.getElementById(elemid).style);
                var nodeStyle = {
                    selector: 'node[id = "' + displayGraphInstance.graph[i].data.id + '"]',
                    style: {
                        //'background-color': '#11479e',
                        //'background-opacity': 0.5,
                        'width': displayGraphInstance.graph[i].data["width"],//document.getElementById('t1').getBoundingClientRect().width,//200,
                        'height': displayGraphInstance.graph[i].data["height"],
                        //'border-color': 'red',
                        //'border-width': 3,
                        //'border-style': 'dashed',
                        //shape: 'roundrectangle'
                    }
                };
                Object.assign(nodeStyle.style, displayGraphInstance.nodeStyles[displayGraphInstance.graph[i].data.name].nodeStyle);
                nodeStyle.style.width = displayGraphInstance.graph[i].data["width"];
                nodeStyle.style.height = displayGraphInstance.graph[i].data["height"];
                nodeStyle.style['background-opacity'] = nodeStyle.style['background-opacity'] / 4;
                nodeStyle.style['border-width'] = nodeStyle.style['border-width'] / 4;
                nodeStyle.style['border-style'] = 'dashed';
                resizedStyle.push(nodeStyle);
                var nodeStyleH = {
                    selector: 'node[id = "' + displayGraphInstance.graph[i].data.id + '"].highlight',
                    style: {
                        //'background-color': '#11479e',
                        //'background-opacity': 0.5,
                        'width': displayGraphInstance.graph[i].data["width"],//document.getElementById('t1').getBoundingClientRect().width,//200,
                        'height': displayGraphInstance.graph[i].data["height"],
                        //'border-color': 'red',
                        //'border-width': 8,
                        //'border-style': 'dashed',
                        //shape: 'roundrectangle'
                    }
                };
                Object.assign(nodeStyleH.style, displayGraphInstance.nodeStyles[displayGraphInstance.graph[i].data.name].nodeStyle);
                nodeStyleH.style.width = displayGraphInstance.graph[i].data["width"];
                nodeStyleH.style.height = displayGraphInstance.graph[i].data["height"];
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

        displayGraphInstance.cyInstance.style().fromJson(resizedStyle).update();
        displayGraphInstance.cyInstance.edgeEditing({
            undoable: true,
            bendRemovalSensitivity: 16,
            enableMultipleAnchorRemovalOption: true,
            initAnchorsAutomatically: false,
            useTrailingDividersAfterContextMenuOptions: false,
            enableCreateAnchorOnDrag: false
        });
        displayGraphInstance.cyInstance.style().update();
        displayGraphInstance.cyInstance.layout(
            {
                name: layout_name
            }).run();

        displayGraphInstance.currentZoomLevel = 0;
        displayGraphInstance.styleAlreadySet = true;
    }

    /**
     * Create an HTML label that cytoscape can use from a latex text
     * @param {*} text 
     * @param {*} index given to the div so that we can find it later if needed
     * @returns {String}
     */
    getLabelFromText(text, index, nodeWidth, fontSize = 20, bold = false) {
        if (bold) {
            return String.raw`<div id= '` + '_graph_internal_' + index + String.raw`' style = "font-size:` + fontSize.toString() + String.raw`px;width:` + nodeWidth.toString() + String.raw`px;margin:30px;"><b>` + text + String.raw`</b></div>`;
        }
        else {
            return String.raw`<div id= '` + '_graph_internal_' + index + String.raw`' style = "font-size:` + fontSize.toString() + String.raw`px;width:` + nodeWidth.toString() + String.raw`px;margin:30px;">` + text + String.raw`</div>`;
        }
    }

    /**
     * Return a node of a given ID
     * @param {str} id Id of the node
     * @returns {Node}
     */
    getCyNode(id) {
        //there should be a  better way to do displayGraphInstance
        let nodes = displayGraphInstance.cyInstance.nodes();
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].id() == id) {
                //console.log("found");
                return nodes[i];
            }
        }
        //console.log("not found");
    }

    getDivsToTypeset(node) {
        divName = '_graph_internal_' + node.id();
        var divList = [divName];
        var childrens = node.children();
        for (var i = 0; i < childrens.length; i++) {
            divList = divList.concat(getDivsToTypeset(childrens[i]));
        }
        return divList;
    }

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
    getAncestors(node, currentAncestors, currentAncestorsEdges) {

        for (var i = 0; i < currentAncestors.length; i++) {
            if (currentAncestors[i] == node) return [currentAncestors, currentAncestorsEdges];
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
                var val = displayGraphInstance.getAncestors(elem, currentAncestors, currentAncestorsEdges);
                //currentAncestors.concat(val[0]);
                //currentAncestorsEdges.concat(val[1]);
            }
        }
        //console.log("i",currentAncestorsEdges);
        return [currentAncestors, currentAncestorsEdges];
    }

    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    selectNode(target, center = false) {
        let node = displayGraphInstance.getCyNode(target.id());
        var sel = target;
        let parent = node.parent();
        //Highlighting
        for (var i = 0; i < displayGraphInstance.highlighted_items.length; i++) {
            displayGraphInstance.highlighted_items[i].removeClass('highlight');
            if (!displayGraphInstance.hasMathML) {
                let divName = '_graph_internal_' + displayGraphInstance.highlighted_items[i].id();
                if (!displayGraphInstance.divsToTypeset.includes(divName))
                    displayGraphInstance.divsToTypeset.push(divName);
            }

            if (center == true) {
                displayGraphInstance.cyInstance.center(node)
            }
        }

        if (document.getElementById('tablecontent' + target.id())) {
            document.getElementById('tablecontent' + target.id()).style.color = "red";
            if (displayGraphInstance.selectedNode != null) {
                document.getElementById('tablecontent' + displayGraphInstance.selectedNode.data().id).style.color = "inherit";
            }
        }

        if (node == displayGraphInstance.selectedNode) {
            displayGraphInstance.selectedNode = null;
            displayGraphInstance.highlighted_items = [];
            for (var i = 0; i < displayGraphInstance.cyNodes.length; i++) {
                displayGraphInstance.highlighted_items.push(displayGraphInstance.cyNodes[i]);
            }
        }
        else {
            var val = displayGraphInstance.getAncestors(sel, [], []);
            displayGraphInstance.highlighted_items = val[0].concat(val[1]); //add nodes
            //in addition to that, we hightight any degree 1 ancestors, even with weak dependencies
            var incomers = node.incomers();
            displayGraphInstance.highlighted_items = displayGraphInstance.highlighted_items.concat(incomers);
            //we also add the ancestors of the section/subsection/whatever containing the node 
            var val2 = displayGraphInstance.getAncestors(parent, [], []);
            displayGraphInstance.highlighted_items = displayGraphInstance.highlighted_items.concat(val2[0].concat(val2[1]));
            displayGraphInstance.selectedNode = node;

        }

        for (var i = 0; i < displayGraphInstance.highlighted_items.length; i++) {
            displayGraphInstance.highlighted_items[i].addClass('highlight');
            if (!displayGraphInstance.hasMathML) {
                displayGraphInstance.divsToTypeset = displayGraphInstance.divsToTypeset.concat(displayGraphInstance.getDivsToTypeset(displayGraphInstance.highlighted_items[i]));
            }
        }


        //displaying text on the right, if left panel exists
        if (document.getElementById("MainNode")) {
            document.getElementById("MainNode").innerHTML = String.raw`<div style="border: 4px solid black;padding:5px">` + node.data().text + `</div>`;

            var ancestors = node.incomers();
            var ancestorsText = "";
            for (var i = 0; i < ancestors.size(); i++) {
                var elem = ancestors[i];
                if (elem.data().hasOwnProperty("text"))
                    ancestorsText += String.raw`<div style="border: 2px solid grey;padding:5px">`
                        + elem.data().text + `</div><br>`;
            }
            document.getElementById("AncestorsNodes").innerHTML = ancestorsText;

            if (!hasMathML) {
                displayGraphInstance.divsToTypeset.push("LatexPage");
            }
        }
    }

    set_display_order(display_order) {
        let nodes = displayGraphInstance.cyInstance.nodes();
        console.log(display_order)
        displayGraphInstance.current_display_order = display_order;
        for (var i = 0; i < nodes.length; i++) {
            console.log("a",display_order,nodes[i].data()["display_order"],nodes[i].data()["display_order"] <= displayGraphInstance.display_order)
            if (nodes[i].data()["display_order"] <= displayGraphInstance.current_display_order) {
                nodes[i].addClass('l0');
                nodes[i].style("display", "element");
            }
            else {
                nodes[i].removeClass('l0');
                nodes[i].style("display", "none");
            }
            if (nodes[i].data()["display_order"] == displayGraphInstance.current_display_order) {
                console.log("selecting node", nodes[i].data().name, displayGraphInstance.titleNamesList.includes(nodes[i].data().name))
                if (!displayGraphInstance.titleNamesList.includes(nodes[i].data().name))
                    displayGraphInstance.selectNode(nodes[i])
            }
        }
    }

}

// Usage:
//const displayGraph = new DisplayGraph(graphWithStyle, 'your_layout_name', true, true, displayGraphInstance.zoomLevelsChanges, displayGraphInstance.fontSizeSection, displayGraphInstance.fontsSize, true);
//displayGraph.asyncSetStyle();
