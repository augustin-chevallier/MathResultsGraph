# -*- coding: utf-8 -*-
"""
Created on Wed Dec  9 12:40:59 2020

@author: Ogg
"""

import generateGraph as gg
import os

#where the html files will be generated
outputFolder = "site"

#if this is set to true, you should set the URL of the website
website = False
url = "augustin-chevallier.fr/testGraph/"

#tex file
texFileName = "examples\DavisNotes\DavisBookNotes.tex"

#move nodes
moveNodes = True


#os.mkdir(outputFolder)

gg.getCyGraph(texFileName,"jsongraph.txt")