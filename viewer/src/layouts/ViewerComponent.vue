<template>
  <q-layout view="hHh Lpr lFf" class="shadow-2 rounded-borders" style="font-size:12px;">

    <q-header elevated>
      <q-toolbar>
        <q-btn v-if="drawerLeft" class="q-mx-sm" flat dense icon="sym_o_left_panel_close" aria-label="Menu"
          @click="toggleLeftDrawer" />
        <q-btn v-if="!drawerLeft" class="q-mx-sm" flat dense icon="sym_o_left_panel_open" aria-label="Menu"
          @click="toggleLeftDrawer" />


        <q-toolbar-title style="font-size:10px">
          {{ selectedFile }} {{ status_msg }} <div v-if="unsavedChanges">*</div>
        </q-toolbar-title>

        <q-btn class="q-mx-sm" dense icon="sym_o_fast_rewind" aria-label="Course beginning" @click="fastBackward">
          <q-tooltip>Course beginning</q-tooltip>
        </q-btn>
        <q-btn class="q-mx-sm" dense icon="sym_o_arrow_left" aria-label="Previous node" @click="backward">
          <q-tooltip>Previous node</q-tooltip>
        </q-btn>
        <q-btn class="q-mx-sm" dense icon="sym_o_visibility" aria-label="Up to current node" @click="showUpToSelected">
          <q-tooltip>Up to current node</q-tooltip>
        </q-btn>
        <q-btn class="q-mx-sm" dense icon="sym_o_arrow_right" aria-label="Next node" @click="forward">
          <q-tooltip>Next node</q-tooltip>
        </q-btn>
        <q-btn class="q-mx-sm" dense icon="sym_o_fast_forward" aria-label="Full graph" @click="fastForward">
          <q-tooltip>Full graph</q-tooltip>
        </q-btn>

      </q-toolbar>
    </q-header>


    <q-drawer v-model="drawerLeft" show-if-above :width="drawerWidth" bordered elevated :breakpoint="0"
      class="text-white">
      <div class="column full-height">
        <q-list bordered class="rounded-borders text-black">
          <q-expansion-item group="leftdrawer" icon="schema" label="Graphs" header-class="text-primary">
            <q-separator />
            <div class="scroll" style="max-height: 50vh">
              <q-tree :nodes="graphs" color="blue" node-key="graphname" v-model:selected="selectedGraph" dense
                style="font-size:12px;">
                <template v-slot:default-header="prop">
                  <div>
                    {{ prop.node.graphname }}
                  </div>
                </template>
              </q-tree>
            </div>
          </q-expansion-item>

          <q-separator />

          <q-expansion-item group="leftdrawer" icon="help_outline" label="User Guide" header-class="text-primary">
            <q-separator />
            <div class="q-pa-sm text-body2">
              <ul class="q-pl-md q-mt-none q-mb-sm">
                 <li><b>Navigation:</b> Drag to move, scroll to zoom.</li>
                 <li><b>Zoom Details:</b> Zoom in to make summaries visible.</li>
                 <li><b>Focus:</b> Click a node to center and see details.</li>
                 <li><b>History:</b> Use arrow buttons (top right) to go back/forward.</li>
                 <li><b>Search:</b> Use the Table of Content to find topics.</li>
              </ul>
            </div>
          </q-expansion-item>

          <q-separator />

          <q-expansion-item group="leftdrawer" icon="list" label="Table of Content" default-opened header-class="text-primary">
            <q-separator />
            <div class="scroll" style="max-height: 65vh">
              <q-tree :nodes="TableOfContent" color="blue" node-key="label" v-model:selected="selectedNode"
                v-model:expanded="expandedKeys" dense style="font-size:12px;">
                <template v-slot:default-header="prop">
                  <div class="row items-center">
                    <div v-html="prop.node.label"></div>
                  </div>
                </template>
              </q-tree>
            </div>
          </q-expansion-item>
        </q-list>
      </div>
      <div v-touch-pan.preserveCursor.prevent.mouse.horizontal="resizeDrawer" class="q-drawer__resizer"></div>
    </q-drawer>


    <q-page-container>

      <router-view v-slot="{ Component }">
        <component @nodeSelected="nodeSelected" ref="graphComponent" :is="Component" />
      </router-view>

    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
//import IndexPage from '../../../editor/src/pages/GraphComponent.vue';



defineOptions({
  name: 'MainLayout'
})

const splitterModel = ref(50);
const drawerSplitterModel = ref(50);

const status_msg = ref('')
const processing = ref(false)


var graphs = ref([{ graphname: "sdf" }]);

const tab = ref('FilesTab')
const selectedGraph = ref('')


const error_msg = ref('')
const disp_err_msg = ref(false)

const unsavedChanges = ref(false); //should we display a * to indicate unsaved changes?


var graphContent = '';
const graphComponent = ref(null)
const savePosEnabled = ref(false);
const graphFile = ref('');
var TableOfContent = [];
const selectedNode = ref('');
const expandedKeys = ref([]);



function fastBackward() {
  graphComponent.value.fastBackward();
}
function fastForward() {
  graphComponent.value.fastForward();
}
function backward() {
  graphComponent.value.backward();
}
function forward() {
  graphComponent.value.forward();
}

function showUpToSelected() {
  graphComponent.value.showUpToSelected();
}

function findNodeInToC(element, id) {
  console.log(element, id)
  if (element.id == id) {
    return element;
  } else if (element.children != null) {
    var i;
    var result = null;
    for (i = 0; result == null && i < element.children.length; i++) {
      result = findNodeInToC(element.children[i], id);
    }
    return result;
  }
  return null;
}

// Helper to find path to node for expansion
function findPath(nodes, targetId, currentPath) {
  for (let node of nodes) {
    if (node.id === targetId) {
      return currentPath;
    }
    if (node.children) {
      let path = findPath(node.children, targetId, [...currentPath, node.label]);
      if (path) return path;
    }
  }
  return null;
}

//called when a node is selected in the graph
function nodeSelected(id) {
  console.log("id", id)
  
  // Expand ToC to show the node
  let path = findPath(TableOfContent, id, []);
  if (path) {
     for (let key of path) {
        if (!expandedKeys.value.includes(key)) {
            expandedKeys.value.push(key);
        }
     }
  }

  let node = findNodeInToC({ children: TableOfContent }, id)
  //console.log("SSSS", TableOfContent, node)
  if (node != null) {
    selectedNode.value = node.label;
    
    // Scroll to the selected node in ToC if possible? 
    // This is tricky without direct DOM access to the tree nodes, 
    // but the expansion helps visibility.
  }
}

function selectedNodeToC(node) {
  console.log(node)
  fastForward();
  graphComponent.value.selectNode(node.id);
  return;
}

function updateGraph(graphContent) {
  graphComponent.value.updateGraph(graphContent, selectedNodeToC)
  //status_msg.value = '';
  processing.value = false;
  savePosEnabled.value = true;
  //graphFile.value = selectedFile.value;

  TableOfContent = graphComponent.value.ToC;
  
  // Set default expansion: first section and first subsection
  expandedKeys.value = [];
  if (TableOfContent.length > 0) {
    expandedKeys.value.push(TableOfContent[0].label); // First section
    if (TableOfContent[0].children && TableOfContent[0].children.length > 0) {
      expandedKeys.value.push(TableOfContent[0].children[0].label); // First subsection
    }
  }
}

const drawerLeft = ref(false)

function toggleLeftDrawer() {
  drawerLeft.value = !drawerLeft.value
}

let initialDrawerWidth;
const drawerWidth = ref(400)
function resizeDrawer(ev) {
  if (ev.isFirst === true) {
    initialDrawerWidth = drawerWidth.value
  }
  drawerWidth.value = initialDrawerWidth + ev.offset.x
}


//function that is called when a node is graph in the list of graphs in hte GRAPHS tab.
async function selectedGraphHandler(node) {
  if (node.filename != '') {
    console.log('./' + node.filename, node)
    fetch('./' + node.filename)
      .then((response) => response.json())
      .then((json) => updateGraph(json));
  }
}

onMounted(() => {


  fetch('./graphlist.json')
    .then((response) => response.json())
    .then((json) => {
      graphs.value = json.graphs;
      for (let i = 0; i < graphs.value.length; i++) {
        graphs.value[i].handler = selectedGraphHandler;
      }
      console.log(json.graphs)
      if (graphs.value.length > 0) {
        selectedGraph.value = graphs.value[0].graphname;
        selectedGraphHandler(graphs.value[0]);
      }
    });

  /*fetch('./graph_with_pos2.txt')
    .then((response) => response.json())
    .then((json) => updateGraph(json));*/


})

</script>

<style>
.q-tree__node--selected .q-tree__node-header-content {
  font-weight: bold;
  background-color: #e3f2fd;
  color: #1565c0;
  border-radius: 4px;
  padding-left: 5px;
}
</style>
