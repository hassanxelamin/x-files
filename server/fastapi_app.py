from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse  # Add this line
from pydantic import BaseModel
from typing import List
from generate_knowledge_graph import extract_graph_data, visualize_graph
import asyncio

app = FastAPI()

# CORS setup for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update for deployed frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextRequest(BaseModel):
    text: str

@app.post("/graph/json")
async def get_graph_data(request: TextRequest):
    try:
        graph_documents = await extract_graph_data(request.text)
        # Convert graph documents to a serializable format
        result = []
        for doc in graph_documents:
            nodes = [{"id": node.id, "type": node.type, "properties": node.properties} 
                    for node in doc.nodes]
            relationships = [{
                "source": rel.source.id,
                "target": rel.target.id,
                "type": rel.type,
                "properties": rel.properties
            } for rel in doc.relationships]
            result.append({
                "nodes": nodes,
                "relationships": relationships
            })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/graph/html")
async def get_graph_html(request: TextRequest):
    try:
        graph_documents = await extract_graph_data(request.text)
        net = visualize_graph(graph_documents)
        html_content = net.generate_html()
        return HTMLResponse(content=html_content, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("fastapi_app:app", host="0.0.0.0", port=8000, reload=True)
