# -*- coding: utf-8 -*-
"""
Created on Wed Dec  9 12:40:59 2020

@author: Ogg
"""

import generateGraph as gg
import os
import shutil
import bs4

## How to use this script: set the following variables:

#tex file
texFileName = "examples/DavisNotes/DavisBookNotes.tex"

#where the html files will be generated
outputFolder = "site"

#if this is set to true, the script will create another www folder that with the URL configured for your website
website = True
url = "augustin-chevallier.fr/testGraph/"

#If you have a graph with saved positions and you want to update it, use this:
oldGraph = "graph_with_pos.txt"
#otherwise use uncomment the following:
#oldGraph = ""




## no need to look at what follows

if not os.path.exists(outputFolder):
    os.makedirs(outputFolder)


gg.getCyGraph(texFileName,outputFolder + "/" + "jsongraph.txt",oldGraph,outputFolder + "/" + "graph_with_pos.txt")

print(os.getcwd())

def copytree(src, dst, symlinks=False, ignore=None):
    for item in os.listdir(src):
        s = os.path.join(src, item)
        d = os.path.join(dst, item)
        if os.path.isdir(s):
            shutil.copytree(s, d, symlinks, ignore)
        else:
            shutil.copy2(s, d)

destination = copytree("basehtml/", outputFolder) 

if website:
    print("Creating additional files for website")
    outputFolder = outputFolder + "/www"
    if not os.path.exists(outputFolder):
        os.makedirs(outputFolder)
    destination = copytree("basehtml/", outputFolder) 

    # load the file
    with open(outputFolder + "/graph.html") as inf:
        txt = inf.read()
        soup = bs4.BeautifulSoup(txt)


    css = soup.find('link', {"rel":"stylesheet"})
    css["href"] = url  + css["href"]

    js = soup.find('script', {"src":"graph_with_pos.txt"})
    js["src"] = url + js["src"]

    js = soup.find('script', {"src":"config.js"})
    js["src"] = url + js["src"]

    js = soup.find('script', {"src":"displaygraph.js"})
    js["src"] = url + js["src"]

    # save the file again
    with open(outputFolder + "/graph.html", "w") as outf:
        outf.write(str(soup))

print("What to do next: \n 1/ open the graph_dagree.html file in the output folder \n 2/ Change the node positions\n 3/ Save them (button on top)\n 4/ Copy the saved file from your download folder to the output folder (and eventually the website folder)\n 5/ Open graph.html, you should see the graph \n 6/ Optional: open config.js and set move_nodes to false to prevent node from moving\n 7/ Optional: upload the www folder to your website.")
