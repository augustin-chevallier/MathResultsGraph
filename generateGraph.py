#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sun Nov 15 16:45:13 2020

@author: marieelisabethchevallier
"""

import os
import time
import pypandoc
from bs4 import BeautifulSoup
import json
import random
import string

os.getcwd()
#os.chdir('/Users/marieelisabethchevallier/Doc/grapheAugustin')
os.listdir()

texFileName = "manu.tex"#DukeSingular_9-9-15-1.tex"

pandoc_take_parent = False

nodeTypeListDefault = ["theorem","proposition","definition","lemma","remark","corollary"]

useTypeConversion = False
if useTypeConversion:
    nodeTypeList = ["theo","prop","defi","lemme","remarque","corollaire"]
    nodeTypeListConversion = {"theo":"theorem","lemme":"lemma",
                          "corollaire":"proposition","remarque":"remark","defi":"definition","prop":"proposition"}
else:
    nodeTypeList = nodeTypeListDefault

partitionNames = ['\section','\subsection']

def get_random_string(length):
    letters = string.ascii_lowercase
    result_str = ''.join(random.choice(letters) for i in range(length))
    return result_str

def findProp(text,index,nextNode,propName):
    propLen = len(propName) + 1
    propPosStart = text.find(propName,index)
    if propPosStart == -1 or propPosStart >= nextNode:
        return ""
    propPosEnd = text.find("}",propPosStart)
    prop = text[propPosStart+propLen:propPosEnd]
    return prop

def findNodeInfo(text,index,nextNode):
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
    if rank == "":
        rank = "0"
    return {"label": label,"depends": depends,"rank": rank}

def findPartitions(text,partitionName,parentLabel):
    n = text.find(partitionName)
    nodes = []
    while n!=-1:
        #print(text[n:len(text)])
        #print("printed")
        n1 = n + len(partitionName) + 1
        #n1 = text.find('}\n',n)
        #title = text[n+len(partitionName)+1:n1]
        
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
    nodeList = []
    index = 0
    node, index = findNode(text,typeName,0,parentLabel)
    while index != -1:
        if node["label"] != "":
            nodeList.append(node)
        node, index = findNode(text,typeName,index,parentLabel)
    return nodeList

def findNodesAllTypes(text,parentLabel):
    nodeList = []
    for name in nodeTypeList:
        nodeList = nodeList + findNodes(text,name,parentLabel)
    return nodeList


def findAllNodes(partition):
    nodes = []
    for i in range(len(partition)):
        for j in range(len(partition[i])):
            nodes += findNodesAllTypes(partition[i][j]["content"],partition[i][j]["label"])
    return nodes




def texToHtml(full_text,partition,nodeL):
    htmlText = pypandoc.convert_text(full_text,'html5', format = 'tex', extra_args=['--mathjax',])    
    #print(htmlText)
    html = BeautifulSoup(htmlText)
    for i in range(len(partition)):
        for j in range(len(partition[i])):
            partition[i][j].update({"html": str(html.find(id = partition[i][j]["label"]))})
            
    for i in range(len(nodeL)):
        if pandoc_take_parent:
            nodeL[i].update({"html": str(html.find(id = nodeL[i]["label"]).parent)})
        else:
            nodeL[i].update({"html": str(html.find(id = nodeL[i]["label"]))})



def getNode(label,nodeList):
    for node in nodeList:
        if node["label"] == label:
            return node
    
    print("Error: node not found. Label: ",label)

def toCytoscapeGraph(fullNodeList):
    
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
                "parent": node["parentLabel"], "rank": node["rank"], "html_name": node["label"]}
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


def getCyGraph(texFile,outFile):
    
    with open(texFile, "r",encoding='utf-8') as text_file:
        full_text = text_file.read()
    
    d = full_text.find("\\begin{document}") 
    text = full_text[d+16:]
    
    
    partition = findAllPartitions(text)
    #print("partitions", partition[1])
    #print(partition[0])
    #print("\n partitions \n")
    #for p in partition[1]:
    #    print("label :", p["label"])
    #print("\n end partition \n")
    
    nodeL = findAllNodes(partition)
    #print("nodeList\n",nodeL)
    
    texToHtml(full_text,partition,nodeL)
    #print("\n  partitions HTML \n", partition)
    #print("\n nodeList\n",nodeL)
    
    
    fullNodeList = []
    fullNodeList += nodeL
    for i in range(len(partition)):
        fullNodeList += partition[i]
    
    #print("\n full \n",fullNodeList)

    cyGraph = toCytoscapeGraph(fullNodeList)
    #print("\n cyGraph \n",str(cyGraph))
    #for node in cyGraph:
        #print("id:",node["data"]["id"])
        #print("type:",node["data"]["name"])
        #print("type:",node["data"]["text"][0:100])
        #print("html name",node["data"]["html_name"])
    
    f = open(outFile, "wt")
    n = f.write("var graph = " + str(cyGraph) + ";")
    f.close()

getCyGraph(texFileName,"jsongraph.txt")

#print("\n JSON \n",json.dumps(nodeL))
#print(partitions[0])
#print(partitions[1])

#exit()
#
#def recherche(text,indice,nom):
#    text1=text[indice:]
#    n1=text1.find(nom)
#    text11=text[n1:]
#    nn1=text11.find('}')
#    contenu=text[n1+7:nn1]
#    return contenu
#
#    
#            
#noeud1=[]        
#
#n=essai.find('\\begin{')
#print(n)
#while n!=-1:
#    p=1
#    while essai[n+p]!='}':
#        p+=7
#    nom=essai[n+7:n+p]
#    label=recherche(essai,n+p,'label')
#    depend=recherche(essai,n+p,'depends')
#    rang=recherche(essai,n+p,'rank')
#    fin=essai.find('\\end',)
#    noeud=[nom,label,depend,rang,essai[n:fin]]
#    print(noeud)
#    noeud1.append(noeud)
#    essai=essai[:n]+essai[n+fin:]
#    n=essai.find('\begin{')
#    
#noeud1[0]    

        

    
