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



######################################################################################################
# we check the pando version since old version don't really work
pandoc_version = pypandoc.get_pandoc_version()
pandoc_good_version = "2.14"

pandoc_take_parent = False

if version.parse(pandoc_version) < version.parse(pandoc_good_version):
    print("WARNING: Pandoc version detected is old. Activating a fallback mode.\n The graph should be displayed, but the node names will not be pretty. If nodes are empty (but the titles), go in generateHTML.py and comment line 23 (using a #).")
    pandoc_take_parent = True
else:
    print("Pandoc version ", pandoc_version, " is suffisently recent.")
######################################################################################################

os.getcwd()
os.listdir()

######################################################################################################
# Define what kind of nodes we are looking for, i.e. \begin{nodeType} ... \end{nodeType}

nodeTypeListDefault = ["theorem","proposition","definition","lemma","remark","corollary"]

useTypeConversion = False
if useTypeConversion:
    nodeTypeList = ["theo","prop","defi","lemme","remarque","corollaire"]
    nodeTypeListConversion = {"theo":"theorem","lemme":"lemma",
                          "corollaire":"proposition","remarque":"remark","defi":"definition","prop":"proposition"}
else:
    nodeTypeList = nodeTypeListDefault

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
    propPosEnd = text.find("}",propPosStart)
    prop = text[propPosStart+propLen:propPosEnd]
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
    rank = findProp(text,index,nextNode,"\\rank")

    summary = findProp(text,index,nextNode,"\\summary")
    mainText = findProp(text,index,nextNode,"\\mainText")

    if rank == "":
        rank = "0"
    return {"label": label,"depends": depends,"rank": rank, "summary": summary, "mainText": mainText}

def findPartitions(text,partitionName,parentLabel):
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
        for nodeName in nodeTypeList:
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
            node = {"type": partitionName[1:],"content": content,"parentLabel": parentLabel}
            node.update(info)
            nodes.append(node)
    return nodes


def findAllPartitions(text):
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
            listSections = findPartitions(text,name,"")
            partitions[i] += listSections
        else:
            for elem in partitions[i-1]:
                elemLabel = elem["label"]
                L = findPartitions(elem["content"],name,elemLabel)
                partitions[i] = partitions[i] + L
                if L != []:
                    n = elem["content"].find(name)
                    elem["content"] = elem["content"][0:n]
                    
    return partitions
                

def findNode(text,typeName,index,parentLabel):
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
        content = text[posStart+typeLen:posEnd]
        info = findNodeInfo(text,posStart,posEnd)
        node = {"type": typeName,"content": content, "parentLabel": parentLabel}
        if useTypeConversion:
            node["type"] = nodeTypeListConversion[typeName]
        node.update(info)
        return (node,posEnd)

def findNodes(text,typeName,parentLabel):
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
    node, index = findNode(text,typeName,0,parentLabel)
    while index != -1:
        if node["label"] != "":
            nodeList.append(node)
        node, index = findNode(text,typeName,index,parentLabel)
    return nodeList

def findNodesAllTypes(text,parentLabel):
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
    for name in nodeTypeList:
        nodeList = nodeList + findNodes(text,name,parentLabel)
    return nodeList


def findAllNodes(partition):
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
            nodes += findNodesAllTypes(partition[i][j]["content"],partition[i][j]["label"])
    return nodes


def summaryTex(full_text,nodeL):
    full_text = full_text.replace("\\newcommand{\\summary}[1]{}","\\newcommand{\\summary}[1]{#1}")
    full_text = full_text.replace("\\newcommand{\\mainText}[1]{#1}","\\newcommand{\\mainText}[1]{}")
    return full_text


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
    
    print("Error: node not found. Label: ",label)

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
                data = {"id": node["label"] + source["label"], "source": source["label"], "target": node["label"]}
                cyEdge = {"data": data}
                cyEdges.append(cyEdge)
                
        if "\\" + node["type"] not in partitionNames:
            data = {"id": node["label"], "name": node["type"], "text": node["html"], 
                "parent": node["parentLabel"], "rank": node["rank"], "html_name": node["label"], "summary": node["htmlSummary"]}
            cyNode = {"group": "nodes", "data": data, "classes": "l0"}
            cyNodes.append(cyNode)
        else:
            data = {"id": node["label"], "name": node["type"], "text": "", 
                "parent": node["parentLabel"], "rank": node["rank"], "html_name": node["label"]}
            cyNode = {"group": "nodes", "data": data, "classes": "l0"}
            cyNodes.append(cyNode)
            
            dataTitle = {"id": "title" + node["label"], "name": node["type"]+"Title", "text": node["html"], 
                "parent": node["label"], "rank": node["rank"], "html_name": node["label"]}
            cyNodeTitle = {"group": "nodes", "data": dataTitle, "classes": "l0"}
            cyNodes.append(cyNodeTitle)
    cy = cyNodes + cyEdges
    
    return cy


def getCyGraph(texFile,outFile,oldGraph = "",outFileWithPos = ""):
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
    with open(texFile, "r",encoding='utf-8') as text_file:
        full_text = text_file.read()
    
    d = full_text.find("\\begin{document}") 
    text = full_text[d+16:]
    
    
    partition = findAllPartitions(text)
    
    nodeL = findAllNodes(partition)
    
    htmlText = texToHtml(full_text,partition,nodeL)
    f = open("tex.html", "wt",encoding="utf-8")
    n = f.write(htmlText)
    f.close()
    
    fullNodeList = []
    fullNodeList += nodeL
    for i in range(len(partition)):
        fullNodeList += partition[i]
    

    cyGraph = toCytoscapeGraph(fullNodeList)


    json_object = json.dumps(cyGraph) 

    f = open(outFile, "wt",encoding="utf-8")
    n = f.write("var graph = " + str(json_object) + ";")
    f.close()

    if oldGraph != "":
        with open(oldGraph,"r",encoding="utf-8") as json_file:
            data = json_file.read()
            data = data[12:-1]
            data = json.loads(data)
            for elem in data:
                if "position" in elem:
                    label = elem["data"]["id"]
                    for elem2 in cyGraph:
                        if "data" in elem2:
                            if elem2["data"]["id"] == label:
                                elem2.update({'position' : elem["position"]})
        json_object = json.dumps(cyGraph) 
        f = open(outFileWithPos, "wt",encoding="utf-8")
        n = f.write("var graph = " + str(json_object) + ";")
        f.close()