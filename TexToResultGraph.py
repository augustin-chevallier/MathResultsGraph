# This must be the first statement before other statements.
# You may only put a quoted or triple quoted string, 
# Python comments, other future statements, or blank lines before the __future__ line.
from __future__ import print_function


from PyQt6.QtCore import *
from PyQt6.QtWidgets import *
from PyQt6.QtGui import *
from PyQt6.QtWebEngineWidgets import *
from PyQt6.QtWebEngineCore import *
import os
import shutil

import sys

import generateGraph as gg
import js2py
import json

#console ouput to variable
import builtins
messageStr = ""

def print(*args, **kwargs):
    """My custom print() function."""
    # Adding new arguments to the print function signature 
    # is probably a bad idea.
    # Instead consider testing if custom argument keywords
    # are present in kwargs
    #builtins.print('My overridden print() function!')
    global messageStr
    for a in args:
        messageStr += str(a) + " "
    for ka in kwargs:
        messageStr += str(ka) + " "
    messageStr += "\n"

    return builtins.print(*args, **kwargs)



def copytree(src, dst, symlinks=False, ignore=None):
    for item in os.listdir(src):
        s = os.path.join(src, item)
        d = os.path.join(dst, item)
        if os.path.isdir(s):
            shutil.copytree(s, d, symlinks, ignore)
        else:
            shutil.copy2(s, d)

class MainWindow(QMainWindow):

    def __init__(self, *args, **kwargs):
        super(MainWindow,self).__init__(*args, **kwargs)


        # check for init file. If it doesn't exist, create one with empty defaults.
        if not os.path.isfile("init.json"):
            print("CER")
            dic = {"texFile":"","buildFolder":""}
            json_string = json.dumps(dic)
            print(json_string,dic)
            with open('init.json', 'w') as outfile:
                json.dump(json_string, outfile)
        with open('init.json') as json_file:
            init_data = json.loads(json.load(json_file))
        #print(type(init_data))
        self.tex = init_data["texFile"]
        self.buildFolder = init_data["buildFolder"]

        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)#self.browser)

        self.hbox = QHBoxLayout(self.central_widget)
        #self.hbox.setContentsMargins(0, 0, 0, 0)

        self.browser = QWebEngineView()
        self.browser.settings().setAttribute(QWebEngineSettings.WebAttribute.LocalContentCanAccessRemoteUrls, True)
        #settings = QtWebEngineWidgets.QWebEngineSettings.defaultSettings()
        #settings.setAttribute(QtWebEngineWidgets.QWebEngineSettings.LocalContentCanAccessRemoteUrls, True)
        self.browser.setUrl(QUrl.fromLocalFile(self.buildFolder+"/graph_save.html"))
        self.hbox.addWidget(self.browser,5)


        #right menu
        self.rightMenu = QVBoxLayout()
        self.rightMenu.setAlignment(Qt.AlignmentFlag.AlignTop)
        self.hbox.addLayout(self.rightMenu,1)

        self.loadButton = QPushButton("Open .tex file")
        self.rightMenu.addWidget(self.loadButton)
        self.loadButton.clicked.connect(self.getfile)

        #self.tex = ""
        self.texLabel = QLabel("tex file:\n" + self.tex)
        self.rightMenu.addWidget(self.texLabel)

        self.loadFolderButton = QPushButton("Select build directory")
        self.rightMenu.addWidget(self.loadFolderButton)
        self.loadFolderButton.clicked.connect(self.getFolder)

        #self.buildFolder = ""
        self.buildFolderLabel = QLabel("build folder:\n" + self.buildFolder)
        self.rightMenu.addWidget(self.buildFolderLabel)

        self.updateGraphButton = QPushButton("Build/Update graph from tex")
        self.rightMenu.addWidget(self.updateGraphButton)
        self.updateGraphButton.clicked.connect(self.buildGraph)


        self.rightMenu.addWidget(QLabel("------------------------"))

        self.updateVisualisationButton = QPushButton("Update graph visualisation (don't forget to save positions!)")
        self.updateVisualisationButton.clicked.connect(self.updateVisualisation)
        self.rightMenu.addWidget(self.updateVisualisationButton)

        self.fixedNodesCheckbox = QCheckBox("Fixed nodes")
        self.rightMenu.addWidget(self.fixedNodesCheckbox)
        self.fixedNodes = False

        self.displayMainTextCheckbox = QCheckBox("Display main text (if unchecked, only summary on titles will be displayed)")
        self.rightMenu.addWidget(self.displayMainTextCheckbox)
        self.displayMainText = False

        self.layoutName = "preset"
        self.layoutComboBox = QComboBox()
        self.layoutComboBox.addItem("layout: positions (preset)")
        self.layoutComboBox.addItem("layout: tree (dagre)")
        self.rightMenu.addWidget(self.layoutComboBox)


        #font sizes, node width, zoom levels
        self.textSize = 20
        self.textSizeW = QLineEdit()
        self.textSizeW.setValidator(QIntValidator())
        self.summarySize = 40
        self.summarySizeW = QLineEdit()
        self.summarySizeW.setValidator(QIntValidator())
        self.titleSize = 60
        self.titleSizeW = QLineEdit()
        self.titleSizeW.setValidator(QIntValidator())
        self.sectionSize = 80
        self.sectionSizeW = QLineEdit()
        self.sectionSizeW.setValidator(QIntValidator())
        self.subsectionSize = 60
        self.subsectionSizeW = QLineEdit()
        self.subsectionSizeW.setValidator(QIntValidator())
        #node width
        self.nodeWidth = 500
        self.nodeWidthW = QLineEdit()
        self.nodeWidthW.setValidator(QIntValidator())
        #zoom levels
        self.zoomChanges1 = 0.4
        self.zoomChanges1W = QLineEdit()
        self.zoomChanges1W.setValidator(QDoubleValidator())
        self.zoomChanges2 = 0.2
        self.zoomChanges2W = QLineEdit()
        self.zoomChanges2W.setValidator(QDoubleValidator())
        flo = QFormLayout()
        flo.addRow("text font size:",self.textSizeW)
        flo.addRow("summary font size:",self.summarySizeW)
        flo.addRow("title font size:",self.titleSizeW)
        flo.addRow("section font size:",self.sectionSizeW)
        flo.addRow("subsection font size:",self.subsectionSizeW)
        flo.addRow("node width:",self.nodeWidthW)
        flo.addRow("zoom level 1:",self.zoomChanges1W)
        flo.addRow("zoom level 2:",self.zoomChanges2W)
        self.rightMenu.addLayout(flo)

        self.updateDisplayedOptions()


        self.consoleLog = QTextEdit(readOnly=True)
        self.rightMenu.addWidget(self.consoleLog)
        #self.process = QProcess(self)
        #self.process.setProgram("dirb")
        #self.process.setProcessChannelMode(QProcess.ProcessChannelMode.MergedChannels)
        #self.process.readyReadStandardOutput.connect(self.on_readyReadStandardOutput)
        #self.process.setArguments([])
        #self.process.readyRead.connect(self.stdoutReady)
        #self.process.started.connect(lambda: print('Started!'))
        #self.process.finished.connect(lambda: print('Finished!'))
        #self.process.start('python', ['TexToResultGraph.py'])

        #browser
        self.browser.page().profile().downloadRequested.connect(self._downloadRequested)

        self.show()


    def updateVisualisation(self):
        if self.buildFolder == "":
            print("no build folder selected")
            return
        self.getDisplayOptions()
        strJS = self.generateJSConfig()
        print(strJS)
        with open(self.buildFolder+"/config.js", 'w') as f:
            f.write(strJS)
        self.browser.setUrl(QUrl.fromLocalFile(self.buildFolder+"/graph_save.html"))


    def getfile(self):
        self.tex = QFileDialog.getOpenFileName(self, 'Open file', 'c:\\',"Tex file (*.tex)")[0]
        #print("LABEL",self.currentTex)
        self.texLabel.setText("current file:\n" + self.tex)
        #self.le.setPixmap(QPixmap(fname))

    def getDisplayOptions(self):
        self.displayMainText = self.displayMainTextCheckbox.isChecked()
        self.fixedNodes = self.fixedNodesCheckbox.isChecked()
        self.textSize = int(self.textSizeW.text())
        self.summarySize = int(self.summarySizeW.text())
        self.titleSize = int(self.titleSizeW.text())
        self.sectionSize = int(self.sectionSizeW.text())
        self.subsectionSize = int(self.subsectionSizeW.text())
        self.nodeWidth = int(self.nodeWidthW.text())
        self.zoomChanges1 = float(self.zoomChanges1W.text())
        self.zoomChanges2 = float(self.zoomChanges2W.text())
        if(self.layoutComboBox.currentIndex() == 0):
            self.layoutName = "preset"
            print("layout","preset",self.layoutComboBox.currentIndex())
        else:
            self.layoutName = "dagre"
            print("layout","dagre",self.layoutComboBox.currentIndex())

    def updateDisplayedOptions(self):
        self.displayMainTextCheckbox.setChecked(self.displayMainText)
        self.fixedNodesCheckbox.setChecked(self.fixedNodes)
        self.textSizeW.setText(str(self.textSize))
        self.summarySizeW.setText(str(self.summarySize))
        self.titleSizeW.setText(str(self.titleSize))
        self.sectionSizeW.setText(str(self.sectionSize))
        self.subsectionSizeW.setText(str(self.subsectionSize))
        self.nodeWidthW.setText(str(self.nodeWidth))
        self.zoomChanges1W.setText(str(self.zoomChanges1))
        self.zoomChanges2W.setText(str(self.zoomChanges2))
        
        if self.layoutName == "preset":
            self.layoutComboBox.setCurrentIndex(0)
        else:
            self.layoutComboBox.setCurrentIndex(1)
            


    def getFolder(self):
        self.buildFolder = QFileDialog.getExistingDirectory(self,"Choose Directory","C:\\")
        self.buildFolderLabel.setText("current build folder:\n" + self.buildFolder)
        if os.path.isfile(self.buildFolder+"/graph_save.html"):
            self.browser.setUrl(QUrl(self.buildFolder+"/graph_save.html"))
        if os.path.isfile(self.buildFolder+"/config.js"):
            print("found config.js, extracting values.")
            with open(self.buildFolder+"/config.js","r") as f:
                string = f.read()
                context = js2py.EvalJs() 
                context.execute(string)
                print("context",context,context.display_main_text)
                self.displayMainText = context.display_main_text
                self.fixedNodes = not context.move_nodes
                self.nodeWidth = context.nodeWidth
                self.zoomChanges1 =  context.zoomLevelsChanges[0]
                self.zoomChanges2 =  context.zoomLevelsChanges[1]
                self.textSize = context.fontsSize[0]
                self.summarySize = context.fontsSize[1]
                self.titleSize = context.fontsSize[2]
                self.sectionSize = context.fontSizeSection["section"]
                self.subsectionSize = context.fontSizeSection["subsection"]
                #self.
                self.updateDisplayedOptions()
                

    def generateJSConfig(self):
        JSstr = "var move_nodes = "
        if self.fixedNodes:
            JSstr += "false;\n"
        else:
            JSstr+= "true;\n"
        JSstr += "var display_main_text = "
        if self.displayMainText:
            JSstr += "true;\n"
        else:
            JSstr+= "false;\n"
        JSstr += "var zoomLevelsChanges = [" + str(self.zoomChanges1) + "," + str(self.zoomChanges2) + "];\n"
        JSstr += "var fontsSize = [" + str(self.textSize) + "," +str(self.summarySize) + "," + str(self.titleSize) + "];\n"
        JSstr += "var nodeWidth = " + str(self.nodeWidth) + ";\n"
        JSstr += "var fontSizeSection = {section:" + str(self.sectionSize) + ",subsection:" + str(self.summarySize) + "};\n"
        JSstr += "var layout_name = '" + self.layoutName + "';\n"
        return JSstr

    def _downloadRequested(self,item): # QWebEngineDownloadItem
        print('downloading to', self.buildFolder)
        print(type(item))
        os.remove(self.buildFolder + "/graph_with_pos.txt") 
        item.setDownloadDirectory(self.buildFolder)
        item.setDownloadFileName("graph_with_pos.txt")
        item.accept()

    def buildGraph(self):
        dic = {"texFile":self.tex,"buildFolder":self.buildFolder}
        json_string = json.dumps(dic)
        print(json_string,dic)
        with open('init.json', 'w') as outfile:
            json.dump(json_string, outfile)
        
        #self.browser.setUrl(QUrl("https://www.lemonde.fr"))
        if self.tex == "":
            print("no tex file selected")
            return
        if self.buildFolder == "":
            print("no build folder selected")
            return
        
        print("building graph")
        oldGraph = ""
        if os.path.isfile(self.buildFolder + "/graph_with_pos.txt"):
            print("found existing graph, importing positions")
            oldGraph = self.buildFolder + "/graph_with_pos.txt"

        print("A")
        gg.getCyGraph(self.tex,oldGraph,self.buildFolder + "/" + "graph_with_pos.txt")
        print("B")
        destination = copytree("basehtml/", self.buildFolder) 
        print("C")
        self.getDisplayOptions()
        strJS = self.generateJSConfig()
        with open(self.buildFolder+"/config.js", 'w') as f:
            f.write(strJS)
        print("D")
        self.browser.setUrl(QUrl.fromLocalFile(self.buildFolder+"/graph_save.html"))
        print("E=",self.buildFolder+"/graph_save.html")

        self.consoleLog.setText(messageStr)
        

app = QApplication(sys.argv)
window = MainWindow()
window.showMaximized()
app.exec()
