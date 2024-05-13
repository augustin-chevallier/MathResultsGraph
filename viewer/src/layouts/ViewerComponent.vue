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

        <q-btn class="q-mx-sm" dense icon="sym_o_fast_rewind" aria-label="fast backward" @click="fastBackward" />
        <q-btn class="q-mx-sm" dense icon="sym_o_arrow_left" aria-label="backward" @click="backward" />
        <q-btn class="q-mx-sm" dense icon="sym_o_arrow_right" aria-label="forward" @click="forward" />
        <q-btn class="q-mx-sm" dense icon="sym_o_fast_forward" aria-label="fast forward" @click="fastForward" />

      </q-toolbar>
    </q-header>


    <q-drawer v-model="drawerLeft" show-if-above :width="drawerWidth" bordered elevated :breakpoint="0"
      class="text-white">
      <q-splitter style="height: 90vh">
        <template v-slot:before>
          <q-tabs v-model="tab" dense vertical class="text-grey" active-color="primary" indicator-color="primary"
            align="justify">
            <q-tab name="GraphsTab" label="Graphs" />
            <q-tab name="ToCTab" label="Table of Content" />
          </q-tabs>
        </template>
        <template v-slot:after>
          <q-tab-panels v-model="tab" animated vertical>
            <q-tab-panel name="GraphsTab" dense class="text-black" active-color="primary" indicator-color="primary">
              <div class="">
                Graphs:
                <q-separator></q-separator>
                <q-tree :nodes="graphs" color="blue" node-key="graphname" v-model:selected="selectedGraph" dense
                  style="font-size:12px;">
                  <template v-slot:default-header="prop">
                    <div>
                      {{ prop.node.graphname }}
                    </div>
                  </template>
                </q-tree>
              </div>
            </q-tab-panel>
            <q-tab-panel name="ToCTab" class="text-black" active-color="primary" indicator-color="primary">
              <div class="">Table of content</div>
              <div class="">
                <q-tree :nodes="TableOfContent" color="blue" node-key="label" v-model:selected="selectedNode" dense
                  default-expand-all style="font-size:12px;">
                  <template v-slot:default-header="prop">
                    <div class="row items-center">
                      <div v-html="prop.node.label"></div>
                    </div>
                  </template>
                </q-tree>
              </div>

            </q-tab-panel>
          </q-tab-panels>
        </template>
      </q-splitter>
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

//called when a node is selected in the graph
function nodeSelected(id) {
  console.log("id", id)
  let node = findNodeInToC({ children: TableOfContent }, id)
  console.log("SSSS", TableOfContent, node)
  if (node != null) {
    selectedNode.value = node.label;
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
    });

  /*fetch('./graph_with_pos2.txt')
    .then((response) => response.json())
    .then((json) => updateGraph(json));*/


})

</script>
