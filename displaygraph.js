

   
    var nodeStyles = {
        'theorem': {
          nodeType: 'theorem',
          nodeStyle: {
            'background-color': '#006474',
            'background-opacity': 0.7,
            'width': 200,
            'height': 20,
            'border-color': 'black',
            'border-style': 'solid',
            'border-width': 3,
            shape: 'roundrectangle'
          }
        },
        'definition': {
          nodeType: 'definition',
          nodeStyle: {
            'background-color': '#018a7a',
            'background-opacity': 0.7,
            'width': 200,
            'height': 20,
            'border-color': 'black',
            'border-style': 'solid',
            'border-width': 4,
            shape: 'roundrectangle'
          }
        },
        'proposition': {
          nodeType: 'proposition',
          nodeStyle: {
            'background-color': '#0093ab',
            'background-opacity': 0.5,
            'width': 200,
            'height': 20,
            'border-color': 'black',
            'border-style': 'solid',
            'border-width': 2,
            shape: 'roundrectangle'
          }
        },
        'lemma': {
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
  
    
      //var graph = ;
      console.log(graph);
  
  
      var elements = graph;//[];
  
  
      var defaultStyle = [
        {
          selector: 'node(data.name = "theorem")',
          style: {
            'background-color': '#11479e',
            'background-opacity': 0.5,
            'width': 200,//document.getElementById('t1').getBoundingClientRect().width,//200,
            'height': 20,
            'border-color': 'red',
            'border-style': 'dashed',
            shape: 'roundrectangle'
          }
        },
  
        {
          selector: 'edge',
          style: {
            'width': 4,
            'target-arrow-shape': 'triangle',
            //'line-color': '#9dbaea',
            //'target-arrow-color': '#9dbaea',
            //'curve-style': 'bezier'
          },
          /*css: {
          "line-fill": "radial-gradient",
          "line-gradient-stop-colors": "red green blue",
          "line-gradient-stop-positions": "25 50 75"
          }*/
        }
      ];
      // create Cy instance
      var cyInstance = cytoscape({
        container: document.getElementById('cy'),
        layout: {
          name: layout_name
        },
        style: defaultStyle,
        elements: elements,
        //userPanningEnabled: false,
        //boxSelectionEnabled: false,
        wheelSensitivity: 0.2,
        autoungrabify: true
        //autounselectify: true
      });
  
      function getLabelFromText(text, index) {
        return String.raw`<div id= '` + '_graph_internal_' + index + String.raw`'>` + text + String.raw`</div>`;
      }
  
  
      cyInstance.nodeHtmlLabel([{
        query: '.l0',
        valign: "center",
        halign: "center",
        valignBox: "center",
        halignBox: "center",
        tpl: function (data) {
          return getLabelFromText(data.text, data.id);
        }
      },
      {
        query: '.l1',
        valign: "center",
        halign: "left",
        valignBox: "top",
        halignBox: "left",
        tpl: function (data) {
          return getLabelFromText(data.text, data.id);
        }
      }
      ]);
  
  
      function getAncestors(node,currentAncestors){
        var ancestors = node.incomers();
  
        var node_in_ancestors = false;
        for(var i = 0; i < currentAncestors.length;i++){
          if(currentAncestors[i] == node) node_in_ancestors = true;
        }
        if(!node_in_ancestors) currentAncestors.push(node);
        for(var i =0; i < ancestors.size();i++){
          var elem = ancestors[i];
          if(!currentAncestors.includes(elem)){
            currentAncestors.concat(getAncestors(elem,currentAncestors));
          }
        }
        return currentAncestors;
      }
  
      cyInstance.on('mouseover', 'node', function(e){
        var sel = e.target;
        var ancestors = getAncestors(sel,[]);
        console.log(ancestors);
        for(var i = 0; i < ancestors.length; i++){
          ancestors[i].addClass('highlight');
        }
      });
      cyInstance.on('mouseout', 'node', function(e){
        var sel = e.target;
        var ancestors = getAncestors(sel,[]);
        console.log(ancestors);
        for(var i = 0; i < ancestors.length; i++){
          ancestors[i].removeClass('highlight');
        }
      });
  
  
      setTimeout(function () { MathJax.typesetPromise() }, 250);
      setTimeout(function () { MathJax.typesetPromise() }, 750);
      setTimeout(function () { MathJax.typesetPromise() }, 3500);
      window.setInterval(function () { MathJax.typesetPromise() }, 1000);
      setTimeout(function () {
  
        var resizedStyle = [
          {
            selector: 'edge',
            style: {
              'width': 4,
              'target-arrow-shape': 'triangle',
              'line-color': 'black',//'#2972E8',
              'target-arrow-color': 'black',//'#2972E8',
              'arrow-scale' : 3,
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
              console.log(graph[i].data.id);
              var elemid = '_graph_internal_' + graph[i].data.id;
              var width1 = document.getElementById(elemid).offsetWidth + 80;//getBoundingClientRect().width;
              var height1 = document.getElementById(elemid).offsetHeight + 100;//getBoundingClientRect().height;
              console.log(nodeStyles[graph[i].data.name]);
              var nodeStyle = {
                selector: 'node[id = "' + graph[i].data.id + '"]',
                style: {
                  //'background-color': '#11479e',
                  //'background-opacity': 0.5,
                  'width': width1,//document.getElementById('t1').getBoundingClientRect().width,//200,
                  'height': height1,
                  //'border-color': 'red',
                  //'border-width': 3,
                  //'border-style': 'dashed',
                  //shape: 'roundrectangle'
                }
              };
              Object.assign(nodeStyle.style, nodeStyles[graph[i].data.name].nodeStyle);
              nodeStyle.style.width = width1;
              nodeStyle.style.height = height1;
              resizedStyle.push(nodeStyle);
              var nodeStyleH = {
                selector: 'node[id = "' + graph[i].data.id + '"].highlight',
                style: {
                  //'background-color': '#11479e',
                  //'background-opacity': 0.5,
                  'width': width1,//document.getElementById('t1').getBoundingClientRect().width,//200,
                  'height': height1,
                  //'border-color': 'red',
                  //'border-width': 8,
                  //'border-style': 'dashed',
                  //shape: 'roundrectangle'
                }
              };
              Object.assign(nodeStyleH.style, nodeStyles[graph[i].data.name].nodeStyle);
              nodeStyleH.style.width = width1;
              nodeStyleH.style.height = height1;
              nodeStyleH.style['border-color'] = 'red';
              nodeStyleH.style['border-width'] = 10;
              resizedStyle.push(nodeStyleH);
            }
            else{
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
      }, 500);
  
      MathJax.typesetPromise();
  
  
      //there should be a  better way to do this
      function getCyNode(id){
        nodes = cyInstance.nodes();
        for (var i = 0; i < nodes.length; i++) {
          if(nodes[i].id() == id){
             console.log("found");
             return nodes[i];
          }
        }
        console.log("not found");
      }
  
      function savePositions() {
        for (var i = 0; i < graph.length; i++) {
          if(graph[i].group == 'nodes'){
            node = getCyNode(graph[i].data.id);
            graph[i].position = node.position();
            console.log(graph[i]);
          }
        }
        fileName = "graph_with_pos.txt";
        var a = document.createElement("a");
        var file = new Blob(['var graph = ' + JSON.stringify(graph) + ';'], {type : 'application/json'});
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
      } 
      document.getElementById("saveButton").onclick = savePositions;
      //download(graph.json, 'json.txt', 'text/plain');