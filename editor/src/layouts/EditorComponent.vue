<template>
  <q-layout view="hHh Lpr lFf" class="shadow-2 rounded-borders" style="font-size:12px;">

    <q-header elevated>
      <q-toolbar>
        <q-btn v-if="drawerLeft" class="q-mx-sm" flat dense icon="sym_o_left_panel_close" aria-label="Menu"
          @click="toggleLeftDrawer" />
        <q-btn v-if="!drawerLeft" class="q-mx-sm" flat dense icon="sym_o_left_panel_open" aria-label="Menu"
          @click="toggleLeftDrawer" />

        <q-btn class="q-mx-sm" dense @click="process_graph">Generate graph <q-circular-progress indeterminate rounded
            size="15px" color="lime" class="" v-if="processing" /></q-btn>


        <q-btn class="q-mx-sm" dense :disable="!unsavedChanges" @click="saveFile">Save file</q-btn>

        <q-btn class="q-mx-sm" dense :disable="!savePosEnabled" label="Save graph layout" @click="saveGraph" />

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
            <q-tab name="FilesTab" label="Files" />
            <q-tab name="EditorTab" label="Editor" />
            <q-tab name="ToCTab" label="Table of Content" />
          </q-tabs>
        </template>
        <template v-slot:after>
          <q-tab-panels v-model="tab" animated vertical>
            <q-tab-panel name="FilesTab" dense class="text-black" active-color="primary" indicator-color="primary">
              <div class="">
                <q-btn dense class="q-mb-sm" @click="fetchFiles">Refresh Files</q-btn>
                <br>Files:
                <q-separator></q-separator>
                <q-tree :nodes="files" color="blue" node-key="label" v-model:selected="selectedFile" dense
                  style="font-size:12px;">
                  <template v-slot:default-header="prop">
                    <div>
                      {{ prop.node.filename }}
                    </div>
                  </template>
                </q-tree>
              </div>
            </q-tab-panel>
            <q-tab-panel name="EditorTab" class="text-black" active-color="primary" indicator-color="primary">
              <div class="">Error message:</div>
              {{ error_msg }}

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

    <q-dialog v-model="disp_err_msg" seamless position="bottom">
      <q-card style="width: 450px">

        <q-card-section class="row items-center no-wrap">
          <div>
            <div class="text-weight-bold text-red">{{ error_msg }}</div>
            <div class="text-grey">This error message can be found in the EDITOR tab.</div>
          </div>

          <q-space />

          <q-btn flat round icon="close" @click="disp_err_msg = false" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-page-container>

      <q-splitter v-model="splitterModel" style="height: 100vh">
        <template v-slot:before>
          <div id="editor" style="height: 90vh;"></div>

        </template>

        <template v-slot:separator>
          <q-avatar color="primary" text-color="white" size="40px" icon="drag_indicator" />
        </template>


        <template v-slot:after>
          <router-view v-slot="{ Component }">
            <component @nodeSelected="nodeSelected" ref="graphComponent" :is="Component" />
          </router-view>
        </template>

      </q-splitter>

    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import IndexPage from '../pages/GraphComponent.vue';
import * as monaco from 'monaco-editor';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import jsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';



defineOptions({
  name: 'MainLayout'
})

const splitterModel = ref(50);

const status_msg = ref('')
const processing = ref(false)

const editorText = ref('')

var editor = null;

var files = ref([{ label: "sdf/sdf", filename: "sdf", path: "sdf", children: [] }]);

const tab = ref('FilesTab')
const selectedFile = ref('')

const selectedFileContent = ref('')

const error_msg = ref('')
const disp_err_msg = ref(false)

var savedVersionID = null;
const unsavedChanges = ref(false); //should we display a * to indicate unsaved changes?


var graphContent = '';
const graphComponent = ref(null)
const savePosEnabled = ref(false);
const graphFile = ref('');
var TableOfContent = [];
const selectedNode = ref('');

var styleOptions = { editor: { fontSize: 10 } }


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

    //console.log("edit", editor.getModel().findMatches('\\label{' + id + '}')[0].range.startLineNumber, '\\label{' + id + '}')
    //editor.setPosition({ lineNumber: editor.getModel().findMatches('\\label{' + id + '}')[0].range.startLineNumber, column: 1 })
    //editor.setPosition({ lineNumber: 100, column: 1 })
    let matches = editor.getModel().findMatches('\\label{' + id + '}');
    if (matches.length == 1) {
      editor.revealLineInCenter(matches[0].range.startLineNumber);
      editor.setPosition({ lineNumber: matches[0].range.startLineNumber, column: 1 })
    }
    else {
      //TODO: error messages
      console.log("Error: label defined several times in tex document.")
    }
  }
}

function getDirectory(label, F = files.value, k = 0) {
  console.log(F)
  if (k > 2) return [];
  for (let i = 0; i < F.length; i++) {
    if (label == F[i].label) {
      return F;
    }
  }
  for (let i = 0; i < F.length; i++) {
    let node = F[i];
    if (node.isDirectory == true) {
      let Fn = getDirectory(label, node.children, k + 1)
      if (Fn.length > 0) return Fn;
      //console.log(node.children)
    }
  }
  return []
}

async function getFile(filepath) {
  const response = await fetch('http://localhost:8000/file', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ "filepath": filepath })
  });
  const data = await response.text();
  console.log(typeof (data))
  return data;
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
  graphFile.value = selectedFile.value;

  TableOfContent = graphComponent.value.ToC;
}

async function fileSelected(node) {
  if (node.filename != '') {
    selectedFile.value = node.label;
    const data = await getFile(selectedFile.value)
    selectedFileContent.value = data;
    editor.setValue(data);
    savedVersionID = editor.getModel().getAlternativeVersionId();
    unsavedChanges.value = false;

    //now check if a graph alreay exists if it's a tex file:
    if (node.filename.split('.').pop() == "tex") {
      let F = getDirectory(node.label);
      let graphFileName = "graph_with_pos" + node.filename + ".txt"
      for (let i = 0; i < F.length; i++) {
        console.log(F[i].filename, graphFileName, graphFileName == F[i].filename)
        if (F[i].filename == graphFileName) {
          const data = await getFile(F[i].label)
          graphContent = JSON.parse(data);
          updateGraph(graphContent);
        }
      }

    }

  }
}

/*watch(selectedFile, async (newFile) => {
  if (newFile != '') {
    console.log(newFile)
    const data = await getFile(selectedFile.value)
    selectedFileContent.value = data;
    editor.setValue(data);
    savedVersionID = editor.getModel().getAlternativeVersionId();
    unsavedChanges.value = false;

    //now check if a graph alreay exists:
    let F = getDirectory(selectedFile.value);
    console.log(F)
    let filename = 
    let graphFileName = 

  }
})*/

async function saveFile() {
  if (selectedFile.value != '' && unsavedChanges.value == true) {
    const response = await fetch('http://localhost:8000/save', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ filename: selectedFile.value, content: editor.getValue() })
    });
    savedVersionID = editor.getModel().getAlternativeVersionId();
    unsavedChanges.value = false;
  }
}


async function process_graph() {
  if (selectedFile.value != '') {
    //status_msg.value = 'generating graph... please wait'
    processing.value = true;
    const response = await fetch('http://localhost:8000/process/' + selectedFile.value);
    console.log(response)
    const data = await response.json();
    console.log(typeof data.graph)
    if (data.error == "") {
      graphContent = JSON.parse(data.graph);
      updateGraph(graphContent)
    }
    error_msg.value = data.error;
    if (error_msg.value != "") disp_err_msg.value = true;
    console.log(data)
    processing.value = false;


    fetchFiles();
    //console.log("vsdfsdf",graphComponent.value)
    //graphComponent.value.graphContent.value = graphContent;
  }
}

async function saveGraph() {
  let graphjson = JSON.stringify(graphComponent.value.getGraphJSON());
  const response = await fetch('http://localhost:8000/save', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ filename: "graph_with_pos" + graphFile.value + ".txt", content: graphjson })
  });
  console.log(graphjson);
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

function addFilesHandler(F) {
  for (let i = 0; i < F.length; i++) {
    if (F[i].isDirectory) {
      F[i].children = addFilesHandler(F[i].children)
    }
    else {
      F[i].handler = fileSelected;
    }
  }
  return F;
}

async function fetchFiles() {
  try {
    const response = await fetch('http://localhost:8000/list_files');
    const data = await response.json();
    //console.log("file",data)

    //files.value = [{ label: "filesSys", filename: "rootdir", children: addFilesHandler(data.files) }];
    files.value = addFilesHandler(data.files);
    //console.log("files",data.files)
  } catch (error) {
    console.error('Error fetching files:', error);
  }
}


self.MonacoEnvironment = {
  getWorker: function (workerId, label) {
    console.log("sdfsdfsdf", label)
    switch (label) {
      case 'json':
        return jsonWorker();
      case 'css':
      case 'scss':
      case 'less':
        return cssWorker();
      case 'html':
      case 'handlebars':
      case 'razor':
        return htmlWorker();
      case 'typescript':
      case 'javascript':
        return jsWorker();
      default:
        return editorWorker();
    }
  }
};

onMounted(() => {
  monaco.languages.register({ id: "latex" });
  monaco.languages.setMonarchTokensProvider('latex', {
    "displayName": "Latex",
    "name": "latex",
    "mimeTypes": ["text/latex", "text/tex"],
    "fileExtensions": ["tex", "sty", "cls"],

    "lineComment": "% ",

    "builtin": [
      "addcontentsline", "addtocontents", "addtocounter", "address", "addtolength", "addvspace", "alph", "appendix",
      "arabic", "author", "backslash", "baselineskip", "baselinestretch", "bf", "bibitem", "bigskipamount", "bigskip",
      "boldmath", "boldsymbol", "cal", "caption", "cdots", "centering", "chapter", "circle", "cite", "cleardoublepage",
      "clearpage", "cline", "closing", "color", "copyright", "dashbox", "date", "ddots", "documentclass", "dotfill", "em",
      "emph", "ensuremath", "epigraph", "euro", "fbox", "flushbottom", "fnsymbol", "footnote", "footnotemark",
      "footnotesize", "footnotetext", "frac", "frame", "framebox", "frenchspacing", "hfill", "hline", "href", "hrulefill",
      "hspace", "huge", "Huge", "hyphenation", "include", "includegraphics", "includeonly", "indent", "input", "it", "item",
      "kill", "label", "large", "Large", "LARGE", "LaTeX", "LaTeXe", "ldots", "left", "lefteqn", "line", "linebreak",
      "linethickness", "linewidth", "listoffigures", "listoftables", "location", "makebox", "maketitle", "markboth",
      "mathcal", "mathop", "mbox", "medskip", "multicolumn", "multiput", "newcommand", "newcolumntype", "newcounter",
      "newenvironment", "newfont", "newlength", "newline", "newpage", "newsavebox", "newtheorem", "nocite", "noindent",
      "nolinebreak", "nonfrenchspacing", "normalsize", "nopagebreak", "not", "onecolumn", "opening", "oval", "overbrace",
      "overline", "pagebreak", "pagenumbering", "pageref", "pagestyle", "par", "paragraph", "parbox", "parindent", "parskip",
      "part", "protect", "providecommand", "put", "raggedbottom", "raggedleft", "raggedright", "raisebox", "ref",
      "renewcommand", "right", "rm", "roman", "rule", "savebox", "sbox", "sc", "scriptsize", "section", "setcounter",
      "setlength", "settowidth", "sf", "shortstack", "signature", "sl", "slash", "small", "smallskip", "sout", "space", "sqrt",
      "stackrel", "stepcounter", "subparagraph", "subsection", "subsubsection", "tableofcontents", "telephone", "TeX",
      "textbf", "textcolor", "textit", "textmd", "textnormal", "textrm", "textsc", "textsf", "textsl", "texttt", "textup",
      "textwidth", "textheight", "thanks", "thispagestyle", "tiny", "title", "today", "tt", "twocolumn", "typeout", "typein",
      "uline", "underbrace", "underline", "unitlength", "usebox", "usecounter", "uwave", "value", "vbox", "vcenter", "vdots",
      "vector", "verb", "vfill", "vline", "vphantom", "vspace",

      "RequirePackage", "NeedsTeXFormat", "usepackage", "input", "include", "documentclass", "documentstyle",
      "def", "edef", "defcommand", "if", "ifdim", "ifnum", "ifx", "fi", "else", "begingroup", "endgroup",
      "definecolor", "textcolor", "color",
      "eifstrequal", "eeifstrequal"
    ],
    "tokenizer": {
      "root": [
        ["(\\\\begin)(\\s*)(\\{)([\\w\\-\\*\\@]+)(\\})",
          ["keyword.predefined", "white", "@brackets", { "token": "tag.env-$4", "bracket": "@open" }, "@brackets"]],
        ["(\\\\end)(\\s*)(\\{)([\\w\\-\\*\\@]+)(\\})",
          ["keyword.predefined", "white", "@brackets", { "token": "tag.env-$4", "bracket": "@close" }, "@brackets"]],
        ["\\\\[^a-zA-Z@]", "keyword"],
        ["\\@[a-zA-Z@]+", "keyword.at"],
        ["\\\\([a-zA-Z@]+)", {
          "cases": {
            "$1@builtin": "keyword.predefined",
            "@default": "keyword"
          }
        }],
        { "include": "@whitespace" },
        ["[{}()\\[\\]]", "@brackets"],
        ["#+\\d", "number.arg"],
        ["\\-?(?:\\d+(?:\\.\\d+)?|\\.\\d+)\\s*(?:em|ex|pt|pc|sp|cm|mm|in)", "number.len"]
      ],

      "whitespace": [
        ["[ \\t\\r\\n]+", "white"],
        ["%.*$", "comment"]
      ]
    }
  })
  editor = monaco.editor.create(document.getElementById('editor'), {
    value: '',
    language: 'latex',
    automaticLayout: true,
    fontSize: toString(styleOptions.editor.fontSize) + "px",
    theme: "vs-dark",
    wordWrap: true,
    minimap: { enabled: false }
  });

  editor.onDidChangeModelContent(function (change) {
    console.log("change", change);
    unsavedChanges.value = editor.getModel().getAlternativeVersionId() != savedVersionID;
  });


  document.addEventListener('keydown', ((e) => {
    if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault(); // present "Save Page" from getting triggered.

      saveFile();
    }
  }));

  fetchFiles().then(() => {
    for (let i = 0; i < files.value.length; i++) {
      console.log("AAA", files.value[i].filename)
      if (files.value[i].filename == "example.tex") {
        fileSelected(files.value[i])
      }
    }
  })

})

</script>
