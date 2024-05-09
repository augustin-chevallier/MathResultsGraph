from fastapi import FastAPI, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import generateGraph as gg
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles



app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:8000",
    "http://localhost:9001",
    "http://localhost:9000",  # Replace this with the actual URL of your Vue.js frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET","POST"],
    allow_headers=["*"],
)

#app.mount("/", StaticFiles(directory="dist/spa/",html=True), name="static")

#@app.get("/")
#async def root():
#    return {"message": "Hello World"}


def get_file_tree(root_dir,relpath="",level = 0):
    file_tree = []
    if level > 1:
        return file_tree

    
    for name in os.listdir(root_dir):
        path = os.path.join(root_dir, name)
        is_dir = os.path.isdir(path)

        node = {"label": relpath + name, "path":relpath, "filename": name, "isDirectory": is_dir}

        if is_dir:
            child = get_file_tree(path,relpath + name + '/',level+1)
            node["children"] = child.copy()

        file_tree.append(node)
    #print(file_tree)
    return file_tree


@app.get("/list_files")
async def list_files():
    root_dir = "."  # Root directory to start listing from, adjust as needed
    return {"files": get_file_tree(root_dir)}


# Function to read a text file from the server
def read_text_file(file_path):
    try:
        with open(file_path, "r") as file:
            file_content = file.read()
        return file_content
    except FileNotFoundError:
        return None
    except Exception as e:
        print(f"Error reading file: {e}")
        return None

class FileRequest(BaseModel):
    filepath: str

@app.post("/file")
async def get_file_content(file: FileRequest):
    #file_path = os.path.join(".", file_name)  # Assuming files are in the current directory
    file_content = read_text_file(file.filepath)
    if file_content is not None:
        return Response(content=file_content, media_type="text/plain")
    else:
        return {"error": "File not found or unable to read"}


class FileContent(BaseModel):
    filename: str
    content: str

@app.post("/save")
async def save_file(file_content: FileContent):
    #print(file_content.filename)
    try:
        with open(file_content.filename, 'w') as f:
            f.write(file_content.content)
        return {"message": "File saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")


@app.get("/process/{fileName}")
async def process_and_get_file(fileName: str):

    #fileName = request.form['fileName']
    print(fileName)
    graph_file_name = "graph_with_pos"+fileName+".txt"

    #text_file = open(fileName, "wb")
    #text_file.write(session["files"][fileName])
    #text_file.close()

    oldGraph = ""
    #if graph_file_name in session["files"]:
    #    oldGraph = "_" + graph_file_name
    #    text_file = open(oldGraph, "wb")
    #    text_file.write(session["files"][graph_file_name])
    #    text_file.close()

    if os.path.exists(graph_file_name):
        oldGraph = graph_file_name
    
    try:
        gg.getCyGraph(fileName,oldGraph,graph_file_name)
    except Exception as err:
        error_msg = err.args[0]
        print("Error:", error_msg)
        return {"graph": "","graph_fileName":graph_file_name,"error":error_msg}
    print(graph_file_name)

    res = open(graph_file_name,"rb").read()
    #session["files"][graph_file_name] = res

    #if os.path.exists(graph_file_name):
    #    os.remove(graph_file_name)
    #if oldGraph != "" and os.path.exists(oldGraph):
    #    os.remove(oldGraph)
    return {"graph":res.decode("utf-8"),"graph_fileName":graph_file_name,"error":""}


app.mount("/", StaticFiles(directory="dist/spa/",html=True), name="static")

if __name__=="__main__":
    uvicorn.run(app, host='localhost', port=8000)


