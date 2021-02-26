# MathResultsGraph

Set of tools to extract a graph of mathematical results from a .tex file, and display said graph in a Browser. 
Note that Firefox and Safari have better support of mathamatical notations and hence work better than Chrome and Edge.

This is very much a Work in Progress and feel free to contact me for any question.

## Generating the graph
use the Python script generateGraph.py

## Displaying the graph
copy the generated file jsongraph.txt to the baseHtml folder, and open graph.html or graph_dagree.html. Note that you may need to change adresses (for now) if you are hosting the graph remotely. 

## Moving nodes
open the file config.js and change the value of move_nodes to true or false.

Use the graph_dagree.html as a base to move nodes around, save the position, and then open it in graph.html