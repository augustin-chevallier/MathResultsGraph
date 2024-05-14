from fastapi import FastAPI, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
import mimetypes


mimetypes.init()
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('image/svg+xml', '.svg')


app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:9053",
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


app.mount("/", StaticFiles(directory="dist/spa/",html=True), name="static")

if __name__=="__main__":
    uvicorn.run(app, host='localhost', port=9053)

