import os
import shutil
import sys
import generateGraph as gg


if(len(sys.argv) < 3):
    print("not enough arguments! Can't generate graph")
    sys.exit()

texFile = sys.argv[1]
buildFolder = sys.argv[2]
oldGraph = ""
if(len(sys.argv) == 4):
    oldGraph = sys.argv[3]
print('Argument List:', str(sys.argv))

gg.getCyGraph(texFile,oldGraph,buildFolder + "/" + "graph_with_pos.txt")