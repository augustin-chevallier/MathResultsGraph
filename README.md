# MathResultsGraph

Set of tools to extract a graph of mathematical results from a .tex file, and display said graph in a Browser. 
Note that Firefox and Safari have better support of mathamatical notations and hence work better than Chrome and Edge.

This is very much a Work in Progress and feel free to contact me for any question.

## Example:
http://www.emmanuelchevallier.eu/graphSite/graph.html

## Anotating the .tex file
Add at the begining of your tex file the following:
``` 
\newcommand{\rank}[1]{}
\newcommand{\depends}[1]{}
``` 

### Nodes
A node will be generated for each section, subsection, theorem, definition, remark, proposition of the .tex that is given a latex label. 

### Edges
To specify a dependency relation between two results, add
``` 
\depends{label-to-parent-node}
``` 
in the child node (inside \begin{theorem/definition/...}\end{theorem/definition/...})

## Generating the graph
use the Python script generateGraph.py

## Displaying the graph
Open graph.html or graph_dagree.html. Note that you may need to change adresses (for now) if you are hosting the graph remotely. 

## Moving nodes
open the file config.js and change the value of move_nodes to true or false.

Use the graph_dagree.html as a base to move nodes around, save the position, and then open it in graph.html

# Installation
Download the source code from github (click on code, download as .zip).

## Dependency: Pandoc
Instructions can be found here: https://pandoc.org/installing.html .

**WARNING: If you are using annaconda, do not install the annaconda version, as it is not up to date.**

This software is incompatible with older versions of Pandoc. It is working with version 2.14.1. If you cannot install a newer version of Pandoc and still want to use this software, change line 23 of generateGraph.py pandoc_take_parent = False to pandoc_take_parent = True. This will allow the graph to be built and mostly displayed, but it will not look as it should.

## Dependencies: others
``` 
pip install bs4
pip install pypandoc
``` 

# Usage
1.    Open generateHTML.py in your favorite text editor
2.    Modify the variable texFileName to your tex file
3.  If you want to generate a page for a website, set
    ``` 
    website = True
    ``` 
    and change the url variable
4.    Run the script using
``` 
python3 generateHTML.py
``` 
5.    Go to the output folder
6.    Open graph_dagree.html with your web browser
7.    Adjust the nodes positions to your liking
8.    Hit the save button
9.    Locate the file graph_with_pos.txt which should be in your download folder, and copy it in the output directory
10.   Open graph.html, you should see the graph with the positions you saved
11.   Optional: open config.js and change
``` 
var move_nodes = true;
``` 
to
``` 
var move_nodes = false;
``` 
to prevent nodes from moving