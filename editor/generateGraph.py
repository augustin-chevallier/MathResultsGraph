#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import time
import pypandoc
from bs4 import BeautifulSoup
import json
import random
import string
from packaging import version

import pathlib


######################################################################################################
# we check the pando version since old version don't really work
try:
    pandoc_version = pypandoc.get_pandoc_version()
except Exception as e:
    dir = os.getcwd()
    pypandoc.download_pandoc(targetfolder=dir)

pandoc_version = pypandoc.get_pandoc_version()
pandoc_good_version = "2.14"

pandoc_take_parent = False

if version.parse(pandoc_version) < version.parse(pandoc_good_version):
    print("WARNING: Pandoc version detected is old. Activating a fallback mode.\n The graph should be displayed, but the node names will not be pretty. If nodes are empty (but the titles), go in generateHTML.py and comment line 23 (using a #).")
    print("Pandoc version ", pandoc_version, " requires >", pandoc_good_version)
    pandoc_take_parent = True
else:
    print("Pandoc version ", pandoc_version, " is suffisently recent.")
######################################################################################################

os.getcwd()
os.listdir()

######################################################################################################
# Define what kind of nodes we are looking for, i.e. \begin{nodeType} ... \end{nodeType}

######################################################################################################
# We are creating nodes for section and subsections
partitionNames = ['\section','\subsection']

######################################################################################################

def findProp(text,index,nextNode,propName):
    """
    Find a property of a node (for example, it's label)
    --> Parameters :
    ----------------
    text : str
        Text containing the node
    index : int
        Where to start reading the text
    nextNode : int
        Index of the start of the next node
    propName: str
        Name of the property we are looking for
    --> Output :
    ------------
        String containing asked property"""
    propLen = len(propName) + 1
    propPosStart = text.find(propName,index)
    if propPosStart == -1 or propPosStart >= nextNode:
        return ""
    
    next = propPosStart + propLen
    acc = 1
    while acc > 0:
        next = min(text.find("}",next),text.find("{",next))
        if text[next] == "{":
            acc += 1
        else:
            acc -= 1
        next += 1
        print(text[next],text[next+1],text[next-1])
    


    propPosEnd = next-1#text.find("}",propPosStart)
    prop = text[propPosStart+propLen:propPosEnd]
    print(prop)
    return prop

def findNodeInfo(text,index,nextNode):
    """
    Extract informations from a node
    --> Parameters :
    ----------------
    text : str
        Text containing the node
    index : int
        Where to start reading the text
    nextNode : int
        Index of the start of the next node
    --> Output :
    ------------
        JSON structure containing the label, rank; and a list of dependencies
    """
    label = findProp(text,index,nextNode,"\\label")
    if label == "": #if no label, assign random label
        print("no label for node :", text[index:(index+100)])
        print("node will be ignored")
        #label = get_random_string(10)
        #print("assigning random label :",label)

    depends = findProp(text,index,nextNode,"\\depends").split(",")
    if depends == [""]:
        depends = []
    weakdepends = findProp(text,index,nextNode,"\\weakdepends").split(",")
    if weakdepends == [""]:
        weakdepends = []        
    rank = findProp(text,index,nextNode,"\\rank")

    summary = findProp(text,index,nextNode,"\\summary")
    mainText = findProp(text,index,nextNode,"\\mainText")

    hasSummary = (summary != "")

    if rank == "":
        rank = "0"
    return {"label": label,"depends": depends,"weakdepends": weakdepends, "rank": rank, "summary": summary, "mainText": mainText, "hasSummary": hasSummary}

def findPartitions(text,partitionName,parentLabel,node_type_set,parentIndex):
    """
    Find all partition in a given text
    --> Parameters :
    ----------------
    text : str
        Text containing the partition
    partitionName : str
        What kind of partition are we looking for (i.e. section, subsection,etc)
    parentLabel: str
        Label of the partition upper in the hierarchy
    --> Output :
    ------------
        List of nodes, where each node is a partition (i.e. a section, subsection,etc)"""
    n = text.find(partitionName)
    nodes = []
    while n!=-1:

        n1 = n + len(partitionName) + 1
        
        #we don't want to find the infos from another node
        nextNode = -1
        for partName in partitionNames:
            nextNode_ = text.find(partName,n1)
            if nextNode_ != -1 and nextNode < nextNode:
                nextNode = nextNode_
        for nodeName in node_type_set:
            nextNode_ = text.find("\\begin{"+nodeName+"}",n1)
            if nextNode_ != -1:
                if nextNode_ < nextNode or nextNode == -1:
                    nextNode = nextNode_            
        if nextNode == -1:
            nextNode = len(text)          
        info = findNodeInfo(text,n,nextNode)
        n = text.find(partitionName,n1)
        nn = n
        if nn == -1:
            nn=len(text)
        content = text[n1+2:nn]
        if info["label"] != "":
            node = {"type": partitionName[1:],"content": content,"parentLabel": parentLabel,"strIndex": n1}
            node.update(info)
            nodes.append(node)
    return nodes


def findAllPartitions(text,node_type_set):
    """
    Find a hierachical partition of the tex file in section/subsection/etc
    --> Parameters :
    ----------------
    text : str
        Text containing the partition
    --> Output :
    ------------
        List of nodes, where each node is a partition (i.e. a section, subsection,etc)"""
    partitions = []
        
    for i in range(len(partitionNames)):
        name = partitionNames[i]
        partitions.append([])
        if i == 0:
            listSections = findPartitions(text,name,"",node_type_set,0)
            partitions[i] += listSections
        else:
            for elem in partitions[i-1]:
                elemLabel = elem["label"]
                L = findPartitions(elem["content"],name,elemLabel,node_type_set,elem["strIndex"])
                partitions[i] = partitions[i] + L
                if L != []:
                    n = elem["content"].find(name)
                    elem["content"] = elem["content"][0:n]
                    
    return partitions
                

def findNode(text,typeName,index,parentLabel,partitionIndex):
    """
    Find the first node of a given type starting at an index in the text in a given section/subsection/etc. The parentLabel is the label of the section/subsection/...
    --> Parameters :
    ----------------
    text : str
        Text containing the node
    typeName : str
        What kind of node (theorem, proposition,etc)
    index : int
        At what position in the text do we start looking
    parentLabel: str
        Label of the section/subsection/...
    --> Output :
    ------------
        A Node"""
    typeLen = len(typeName)+8
    posStart = text.find('\\begin{'+typeName+'}',index)
    if posStart == -1:
        return ({},-1)
    else:
        posEnd = text.find('\\end{'+ typeName + '}',posStart) 
        hasTitle = (text[posStart+typeLen] == "[")
        #print("hasTitle", hasTitle,text[posStart+typeLen])
        content = text[posStart+typeLen:posEnd]
        info = findNodeInfo(text,posStart,posEnd)
        node = {"type": typeName,"content": content, "parentLabel": parentLabel, "hasTitle": hasTitle, "strIndex": partitionIndex+posStart}
        node.update(info)
        return (node,posEnd)

def findNodes(text,typeName,parentLabel,partitionIndex):
    """
    Find nodes of a given type in a given section/subsection/etc. The parentLabel is the label of the section/subsection/...
    --> Parameters :
    ----------------
    text : str
        Text containing the node
    typeName : str
        What kind of node (theorem, proposition,etc)
    parentLabel: str
        Label of the section/subsection/...
    --> Output :
    ------------
        A list of nodes"""
    nodeList = []
    index = 0
    node, index = findNode(text,typeName,0,parentLabel,partitionIndex)
    while index != -1:
        if node["label"] != "":
            nodeList.append(node)
        node, index = findNode(text,typeName,index,parentLabel,partitionIndex)
    return nodeList

def findNodesAllTypes(text,parentLabel,node_types_set,partitionIndex):
    """
    Find all nodes in a given section/subsection/etc. The parentLabel is the label of the section/subsection/...
    --> Parameters :
    ----------------
    text : str
        Text containing the node
    parentLabel: str
        Label of the section/subsection/...
    --> Output :
    ------------
        A list of nodes"""
    nodeList = []
    for name in node_types_set:
        nodeList = nodeList + findNodes(text,name,parentLabel,partitionIndex)
    print(nodeList)
    return nodeList


def findAllNodes(partition,node_types_set):
    """Returns a list of all node in the partition. The partition is a decomposition of the .tex document in section/subsetction/etc. 
    It attach the node to the relevant section/subsection/whatever)
    --> Parameters :
    ----------------
    partition : hierachical tree
    --> Output :
    ------------
        A list of nodes"""
    nodes = []
    for i in range(len(partition)):
        for j in range(len(partition[i])):
            nodes += findNodesAllTypes(partition[i][j]["content"],partition[i][j]["label"],node_types_set,partition[i][j]["strIndex"])
    return nodes


def summaryTex(full_text,nodeL):
    full_text = full_text.replace("\\newcommand{\\summary}[1]{}","\\newcommand{\\summary}[1]{#1}")
    full_text = full_text.replace("\\newcommand{\\mainText}[1]{#1}","\\newcommand{\\mainText}[1]{}")
    return full_text


def find_parentesis(s):
    toret = {}
    pstack = []

    open_index = -1
    close_index = -1

    for i, c in enumerate(s):
        if c == '(':
            pstack.append(i)
            if open_index == -1:
                open_index = i
        elif c == ')':
            if len(pstack) == 0:
                raise ValueError("No matching closing parens at: " + str(i))
            if len(pstack) == 1:
                close_index = i
            toret[pstack.pop()] = i
        if close_index != -1:
            break

    if len(pstack) > 0:
        raise ValueError("No matching opening parens at: " + str(pstack.pop()))

    return (open_index,close_index)

def getTitle(htmlText):
    p = find_parentesis(htmlText)
    #print(p)
    #print(htmlText[(p[0]+1):(p[1])])
    return htmlText[(p[0]+1):(p[1])]
    #title = htmlText[parentesis]

def texToHtml(full_text,partition,nodeL):
    """
    Convert latex to html using pandoc, and save the results in our graph
    --> Parameters :
    ----------------
    full_text : str
        latex text
    partition : 
        Partition of the Latex file
    nodeL: list 
        List of nodes extracted from the latex
    --> Output :
    ------------
        None"""
    htmlText = pypandoc.convert_text(full_text,'html5', format = 'tex', extra_args=['--mathml',])    
    htmlTextSummary = pypandoc.convert_text(summaryTex(full_text,nodeL),'html5', format = 'tex', extra_args=['--mathml',])
    #print(htmlText)
    html = BeautifulSoup(htmlText)
    htmlSummary = BeautifulSoup(htmlTextSummary)
    for i in range(len(partition)):
        for j in range(len(partition[i])):
            partition[i][j].update({"html": str(html.find(id = partition[i][j]["label"]))})
            
    for i in range(len(nodeL)):
        if pandoc_take_parent:
            nodeL[i].update({"html": str(html.find(id = nodeL[i]["label"]).parent)})
            nodeL[i].update({"htmlSummary": str(htmlSummary.find(id = nodeL[i]["label"]).parent)})
        else:
            nodeL[i].update({"html": str(html.find(id = nodeL[i]["label"]))})
            nodeL[i].update({"htmlSummary": str(htmlSummary.find(id = nodeL[i]["label"]))})
            titleHTML = ""
            hasTitle = False
            if nodeL[i]["hasTitle"]:
                titleHTML = getTitle(str(html.find(id = nodeL[i]["label"])))
                hasTitle = True
            nodeL[i].update({"htmlTitle": titleHTML})
            nodeL[i].update({"hasTitle": hasTitle})
    return htmlText



def getNode(label,nodeList):
    """
    Get a node with a given label from the list
    --> Parameters :
    ----------------
    label : str
        Label of the node
    nodeList : list
        List of nodes
    --> Output :
    ------------
        A node"""
    for node in nodeList:
        if node["label"] == label:
            return node
    
    raise ValueError("Error: node not found. Label: " + str(label))


def getNodeSection(node,fullNodeList):
    print("parent",node["parentLabel"])
    if node["parentLabel"] == "":
        return ""
    parent = getNode(node["parentLabel"],fullNodeList)
    print(parent["type"],partitionNames[0],parent["type"] == partitionNames[0])
    if parent["type"] == "section":
        return node["parentLabel"]
    else:
        return getNodeSection(parent,fullNodeList)

def getEdgeVisibility(source,target,fullNodeList):
    sourceSection = getNodeSection(source,fullNodeList)
    targetSection = getNodeSection(target,fullNodeList)
    print("SS",sourceSection,targetSection)
    if sourceSection == targetSection:
        return 1
    else:
        return 0


def toCytoscapeGraph(fullNodeList):
    """
    Create a graph that can be read by Cytoscape (the graph displaying library) in JSON format
    --> Parameters :
    ----------------
    fullNodeList : list
        List containing all the nodes (inclusing nodes associated with partition)
    --> Output :
    ------------
        A JSON structure"""
    cyEdges = []
    cyNodes = []
    for node in fullNodeList:
        if node["depends"] != []:
            for label in node["depends"]:
                source = getNode(label,fullNodeList)
                if source is None:
                    print("Wrong label \"", label,"\"  in depends for node: ", node["label"])
                else:
                    visibility = getEdgeVisibility(source,node,fullNodeList)
                    data = {"id": node["label"] + source["label"], "source": source["label"], "target": node["label"], "type":"strong", "visibility": visibility}
                    cyEdge = {"data": data}
                    cyEdges.append(cyEdge)

        if node["weakdepends"] != []:
            for label in node["weakdepends"]:
                source = getNode(label,fullNodeList)
                if source is None:
                    print("Wrong label \"", label,"\"  in depends for node: ", node["label"])
                else:
                    data = {"id": node["label"] + source["label"], "source": source["label"], "target": node["label"], "type":"weak"}
                    cyEdge = {"data": data}
                    cyEdges.append(cyEdge)
                
        if "\\" + node["type"] not in partitionNames:
            data = {"id": node["label"], "name": node["type"], "text": node["html"], 
                "parent": node["parentLabel"], "rank": node["rank"], "html_name": node["label"], "summary": node["htmlSummary"], "hasSummary": node["hasSummary"],
                "hasTitle": node["hasTitle"], "title": node["htmlTitle"],"display_order":node["display_order"],"latexMainText":node["mainText"]}
            cyNode = {"group": "nodes", "data": data, "classes": "l0"}
            cyNodes.append(cyNode)
        else:
            data = {"id": node["label"], "name": node["type"], "text": "", 
                "parent": node["parentLabel"], "rank": node["rank"], "html_name": node["label"],"hasSummary": False, "hasTitle": False,"display_order":node["display_order"]}
            cyNode = {"group": "nodes", "data": data, "classes": "l0"}
            cyNodes.append(cyNode)
            
            dataTitle = {"id": "title" + node["label"], "name": node["type"]+"Title", "text": node["html"], 
                "parent": node["label"], "rank": node["rank"], "html_name": node["label"], "hasSummary": False, "hasTitle": False,"display_order":node["display_order"]}
            cyNodeTitle = {"group": "nodes", "data": dataTitle, "classes": "l0"}
            cyNodes.append(cyNodeTitle)
    cy = cyNodes + cyEdges
    
    return cy



def find_all(a_str, sub):
    start = 0
    L = []
    while True:
        start = a_str.find(sub, start)
        if start == -1: return L
        L.append(start)
        start += len(sub) # use start += 1 to find overlapping matches

def loadLatexFile(texFile):

    print(texFile)
    print("folder",pathlib.Path(texFile).parent)
    folder = pathlib.Path(texFile).parent

    with open(texFile, "r",encoding='utf-8') as text_file:
        full_text = text_file.read()
    
    includes_begin = find_all(full_text,"\\include{") 
    includes_end = []
    included_files = []
    
    for index in includes_begin:
        end = full_text.find("}",index)
        includes_end.append(end)
        filename = full_text[index+len("\\include{"):end] + ".tex"
        filepath = folder / filename
        filepath = filepath.resolve()
        included_files.append(filepath)

    ###

    input_begin = find_all(full_text,"\\input{") 
    print(type(input_begin))
    input_end = []
    input_files = []
    
    for index in input_begin:
        end = full_text.find("}",index)
        input_end.append(end)
        filename = full_text[index+len("\\input{"):end] + ".tex"
        filepath = folder / filename
        filepath = filepath.resolve()
        input_files.append(filepath)

    for i in reversed(range(len(input_files))):
        #copy and past in reverse order
        with open(input_files[i], "r",encoding='utf-8') as text_file:
            text_to_include = text_file.read()
        full_text = full_text[0:input_begin[i]] + text_to_include + full_text[input_end[i]+1:len(full_text)]
        print(full_text)
        
    return full_text

def getNodeTypes(str):

    node_types_set = {"theorem","proposition","definition","lemma","remark","corollary","assumption","exercise"}

    with open('defaultStyle.json') as json_file:
        style_dict = json.load(json_file)
    #style_dict={}

    nodes_def = find_all(str,"\\defineNode{")

    for index in nodes_def:
        end = str.find("}",index)
        node_name = str[index+len("\\defineNode{"):end]
        node_types_set.add(node_name)
        style_begin = str.find("{",end)
        style_end = str.find("}",style_begin)
        node_style_str = "{" + str[style_begin+1:style_end] +"}"
        node_style = json.loads(node_style_str)
        #print("style",node_style)
        style_dict[node_name] = {"nodeType":node_name,"nodeStyle":node_style}

    print(node_types_set)
    print(style_dict)    

    return style_dict,node_types_set

def getCyGraph(texFile,oldGraph = "",outFileWithPos = ""):
    """
    Parse a tex file and save the associated cytoscape graph in a JSON file
    --> Parameters :
    ----------------
    texFile : str
        Name of the .tex file to parse
    outFile : str
        Name of the output file
    oldGraph : str
        Name of the file of a previously generated graph. Extract positions, and only positions from this graph
    --> Output :
    ------------
        None"""


    #loadLatexFile(texFile)
    #with open(texFile, "r",encoding='utf-8') as text_file:
    #    full_text = text_file.read()
    
    full_text = loadLatexFile(texFile)
    d = full_text.find("\\begin{document}") 
    header = full_text[0:d]
    style_dict, node_types_set = getNodeTypes(header)
    text = full_text[d+16:]
    
    
    partition = findAllPartitions(text,node_types_set)
    
    nodeL = findAllNodes(partition,node_types_set)
    
    htmlText = texToHtml(full_text,partition,nodeL)
    f = open("tex.html", "wt",encoding="utf-8")
    n = f.write(htmlText)
    f.close()
    
    #set up node ordering
    def get_partition(name):  #help function
        for i in range(len(partition)):
            for p in partition[i]:
                if p["label"] == parentLabel:
                    #print("p",p)
                    return p

    print("===============================================")
    node_number = 0
    #first, sort nodes
    nodeL.sort(key=lambda n: n["strIndex"])
    for node in nodeL:
        print("node name",node["label"],node_number,node["strIndex"])
        node["display_order"] = node_number
        parentLabel = node["parentLabel"]
        parent = get_partition(parentLabel)
        while(parent):
            if not ("display_order" in parent):
                parent["display_order"] = node_number
            parentLabel = parent["parentLabel"]
            parent = get_partition(parentLabel)
        node_number += 1
    for i in range(len(partition)):
        for p in partition[i]:
            if not ("display_order" in p):
                p["display_order"] = node_number 


    fullNodeList = []
    fullNodeList += nodeL
    for i in range(len(partition)):
        fullNodeList += partition[i]
    

    cyGraph = toCytoscapeGraph(fullNodeList)


    if oldGraph != "":
        with open(oldGraph,"r",encoding="utf-8") as json_file:
            data = json_file.read()
            #data = data[21:-1]
            data = json.loads(data)
            for elem in data["graph"]:
                if "position" in elem:
                    label = elem["data"]["id"]
                    for elem2 in cyGraph:
                        if "data" in elem2:
                            if elem2["data"]["id"] == label:
                                elem2.update({'position' : elem["position"]})
                if "classes" in elem:
                    if elem["classes"] == "edgebendediting-hasbendpoints":
                        label = elem["data"]["id"]
                        for elem2 in cyGraph:
                            if "data" in elem2:
                                if elem2["data"]["id"] == label:
                                    elem2.update({"classes" : elem["classes"]})
                                    elem2["data"].update({"cyedgebendeditingWeights":elem["data"]["cyedgebendeditingWeights"]})
                                    elem2["data"].update({"cyedgebendeditingDistances":elem["data"]["cyedgebendeditingDistances"]})
                    if elem["classes"] == "edgecontrolediting-hascontrolpoints":
                        label = elem["data"]["id"]
                        for elem2 in cyGraph:
                            if "data" in elem2:
                                if elem2["data"]["id"] == label:
                                    elem2.update({"classes" : elem["classes"]})
                                    elem2["data"].update({"cyedgecontroleditingWeights":elem["data"]["cyedgecontroleditingWeights"]})
                                    elem2["data"].update({"cyedgecontroleditingDistances":elem["data"]["cyedgecontroleditingDistances"]})

    graphWithStyle = {"graph":cyGraph,"style":style_dict,"full_text":htmlText}
    json_object = json.dumps(graphWithStyle,indent=4) 
    f = open(outFileWithPos, "wt",encoding="utf-8")
    n = f.write(str(json_object))
    f.close()



def editProp(text,propName,propVal,nodeStart,nextNode,labelPos):

    propLen = len(propName) + 1
    propPosStart = text.find(propName,nodeStart)
    if propPosStart == -1 or propPosStart >= nextNode:
        return text[0:labelPos] + "\n\\" + propName + "{" + propVal + "}\n" + text[labelPos:]
    
    next = propPosStart + propLen
    acc = 1
    while acc > 0:
        next = min(text.find("}",next),text.find("{",next))
        if text[next] == "{":
            acc += 1
        else:
            acc -= 1
        next += 1

    propPosEnd = next-1

    return text[0:propPosStart] + propVal + text[propPosEnd:]

#list to modify format: (nodeName,propName,propVal)
def editNodes(texStr,modifs):

    full_text = texStr
    d = full_text.find("\\begin{document}") 
    header = full_text[0:d]
    style_dict, node_types_set = getNodeTypes(header)
    text = full_text[d+16:]
    

    for (nodeName,propName,propVal) in modifs:
        pos = text.find("\label{"+nodeName+"}",0)
        if pos != -1:
            nodeStart = -1
            for nodeType in node_types_set:
                nodeStart = max(nodeStart,text.rfind("\\begin{"+nodeType+"}",0,pos))
            for partitionType in partitionNames:
                nodeStart = max(nodeStart,text.rfind(partitionType,0,pos))
            
            if nodeStart != -1:
                nextNode = len(text)
                for nodeType in node_types_set:
                    nextNode = min(nodeStart,text.find("\\begin{"+nodeType+"}",pos))
                for partitionType in partitionNames:
                    nextNode = min(nodeStart,text.find(partitionType,pos))

                text = editProp(text,propName,propVal,nodeStart,nextNode,pos + 8 + len(nodeName))
    
    return full_text[:d+16] + text


#small test

#full_text = loadLatexFile("coursProba(1).tex")
#modifs = [("rem:IntProb","position","20,20"),("rem:IntProb","rank","2"),("subsec:Marg","position","20,20")]

#str = editNodes(full_text,modifs)
#with open("text.txt", "w",encoding='utf-8') as text_file:
#        text_file.write(str)