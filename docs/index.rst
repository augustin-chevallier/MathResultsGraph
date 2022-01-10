.. Math Graph Results documentation master file, created by
   sphinx-quickstart on Sun Jan  9 17:42:03 2022.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.


Installation
############

.. toctree::
   :maxdepth: 1
   :caption: Contents:


Prerequisite
------------

install Pandoc : https://pandoc.org/installing.html


Windows
-------

Select the latest release on https://github.com/augustin-chevallier/MathResultsGraph/releases and download the 
win64-MathGraphResult.zip file. 
Extract files to the folder of your choice. No extra steps are required, to launch the software, open the file
TexToResultGraph.exe.

Linux & MacOS
-------------

You will need a valid python install. First, install all the required dependencies beside pandoc, which must be installed beforehand.

.. code-block:: bash

   pip install pypandoc js2py PyQt5 packaging bs4 PyQtWebEngine

Select the latest release on https://github.com/augustin-chevallier/MathResultsGraph/releases and download the source code.
To launch the software, decompress the file and go inside the folder, and launch the python script:

.. code-block:: bash

   python TexToResultGraph.py



Quickstart: Annotating a tex file 
#################################

.. toctree::
   :maxdepth: 1
   :caption: Contents:

Preparing your tex file
-----------------------

Add the following on your .tex file:

.. code-block::

   \newcommand{\rank}[1]{}
   \newcommand{\depends}[1]{}
   \newcommand{\weakdepends}[1]{}
   \newcommand{\summary}[1]{}
   \newcommand{\mainText}[1]{#1}


Adding a node
-------------

Supported nodes:

*  theorem

*  definition

*  proposition

*  lemma

*  remark

*  corollary


Nodes annotations:

*  label: required. If there is no label, the node is not added.

*  depends: optional. A list of labels separated by commas, for example:

*  weakdepends: optional. A list of labels separated by commas.
   The weak dependencies will only be displayed when the use clicks on the node.

*  title: optional. Using the usual latex notation [title].

*  summary: optional. A summary to be displayed in the node.

*  mainText: the main text of the node.

Example (assuming def1 and def2 labels refers to other nodes):

.. code-block:: latex

   \begin{proposition}[title of the proposition]
      \label{prop}
      \depends{def1,def2}  
      \summary{summary of proposition}
      \mainText{main text of proposition}
   \end{proposition}



Adding section and subsections
--------------------------------
Sections and subsections will be displayed in the graph, and nodes will automatically be added to them.

Warning: section and subsections need to have labels!

Remark 2: it is possible to create a dependency on a whole section / subsection using its label.

Example: Creation of Section 1 with two subsections 1 and 2.

.. code-block:: latex

   \section{Section 1}
   \label{sec:sec1}

      \subsection{Subsection 1}
      \label{subsec:sub1}

      \subsection{Subsection 2}
      \label{subsec:sub2}


Build the graph from the tex file
#################################

First start
-----------

Launch TexToResultGraph. The following screen should appear. 

#.  Click on button “Open .tex file” and select the tex file you want to display as a graph. The selected file should appear/update under the button.

#.  Click on button “select build directory” and select the folder where you want the graph to be saved. The selected folder should appear/update under the button.

#.  Click on button “Build/update graph from tex”, a graph corresponding to the tex file is ploted. This might take a few seconds.


Move nodes
----------

You can now move nodes to your liking by dragging them. When nodes are in a suitable position, hit the "save positions" button on the top right corner.

On the first start, all your nodes will be in the same place, making it hard to move them. To help you start, you can select the 
"dagre" layout instead of the "preset" layout in the layout option. This will place nodes according to a tree structure. Note however that this 
layout do not use saved node positions, and is hence only suitable for the first start.


Add nodes & update your tex
---------------------------

If you have updated your tex and want to update the graph, simply hit the “Build/update graph from tex” button. 
Saved node positions will be kept.



Display the graph
#################

To display the graph, simply open the graph_split.html file that was created in your build folder. Note that it works best with Firefox.
