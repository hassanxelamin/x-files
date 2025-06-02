from fastapi import FastAPI, Request, Form, File, UploadFile, HTTPException
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import uvicorn
import os
from typing import Optional
from generate_knowledge_graph import generate_knowledge_graph

# Initialize FastAPI app
app = FastAPI(title="Knowledge Graph API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your Next.js frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set up templates
templates = Jinja2Templates(directory="templates")

# Create necessary directories
os.makedirs("static", exist_ok=True)
os.makedirs("templates", exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# HTML template for the home page
index_html = """
<!DOCTYPE html>
<html>
<head>
    <title>Knowledge Graph Generator</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <style>
        .graph-container {
            width: 100%;
            height: 80vh;
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
            overflow: hidden;
        }
        iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
    </style>
</head>
<body class="bg-gray-100">
    <div class="min-h-screen">
        <header class="bg-white shadow">
            <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <h1 class="text-3xl font-bold text-gray-900">Knowledge Graph Generator</h1>
            </div>
        </header>
        <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div class="px-4 py-6 sm:px-0">
                <div class="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div class="px-4 py-5 sm:p-6">
                        <form id="graphForm" class="space-y-6" enctype="multipart/form-data">
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Input Method</label>
                                    <div class="mt-1 flex space-x-4">
                                        <div class="flex items-center">
                                            <input id="text-option" name="input-method" type="radio" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" value="text" checked>
                                            <label for="text-option" class="ml-2 block text-sm text-gray-700">Input Text</label>
                                        </div>
                                        <div class="flex items-center">
                                            <input id="file-option" name="input-method" type="radio" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" value="file">
                                            <label for="file-option" class="ml-2 block text-sm text-gray-700">Upload File</label>
                                        </div>
                                    </div>
                                </div>

                                <div id="text-input-container">
                                    <label for="text" class="block text-sm font-medium text-gray-700">Enter your text</label>
                                    <div class="mt-1">
                                        <textarea id="text" name="text" rows="10" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"></textarea>
                                    </div>
                                </div>

                                <div id="file-input-container" class="hidden">
                                    <label class="block text-sm font-medium text-gray-700">Upload text file</label>
                                    <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                        <div class="space-y-1 text-center">
                                            <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                            </svg>
                                            <div class="flex text-sm text-gray-600">
                                                <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                                    <span>Upload a file</span>
                                                    <input id="file-upload" name="file-upload" type="file" class="sr-only" accept=".txt">
                                                </label>
                                                <p class="pl-1">or drag and drop</p>
                                            </div>
                                            <p class="text-xs text-gray-500">TXT files only</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="flex justify-end">
                                <button type="submit" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    Generate Knowledge Graph
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div id="graph-container" class="mt-8 hidden">
                    <h2 class="text-lg font-medium text-gray-900 mb-4">Knowledge Graph</h2>
                    <div class="graph-container bg-white rounded-lg shadow">
                        <iframe id="graph-frame" src="" title="Knowledge Graph"></iframe>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script>
        // Toggle between text and file input
        document.getElementById('text-option').addEventListener('change', function() {
            document.getElementById('text-input-container').classList.remove('hidden');
            document.getElementById('file-input-container').classList.add('hidden');
        });

        document.getElementById('file-option').addEventListener('change', function() {
            document.getElementById('text-input-container').classList.add('hidden');
            document.getElementById('file-input-container').classList.remove('hidden');
        });

        // Handle form submission
        document.getElementById('graphForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData();
            const inputMethod = document.querySelector('input[name="input-method"]:checked').value;
            
            if (inputMethod === 'text') {
                const text = document.getElementById('text').value;
                if (!text.trim()) {
                    alert('Please enter some text');
                    return;
                }
                formData.append('text', text);
            } else {
                const fileInput = document.getElementById('file-upload');
                if (fileInput.files.length === 0) {
                    alert('Please select a file');
                    return;
                }
                formData.append('file', fileInput.files[0]);
            }

            try {
                const response = await fetch('/generate', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.detail || 'Failed to generate knowledge graph');
                }

                const result = await response.json();
                const graphFrame = document.getElementById('graph-frame');
                graphFrame.src = `/static/${result.filename}`;
                document.getElementById('graph-container').classList.remove('hidden');
                graphFrame.onload = () => {
                    // Scroll to the graph
                    graphFrame.scrollIntoView({ behavior: 'smooth' });
                };
            } catch (error) {
                console.error('Error:', error);
                alert(error.message);
            }
        });
    </script>
</body>
</html>
"""

# Create the template file if it doesn't exist
templates_path = Path("templates")
templates_path.mkdir(exist_ok=True)
with open(templates_path / "index.html", "w") as f:
    f.write(index_html)

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/generate", response_class=HTMLResponse)
async def generate_graph(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    try:
        print("Received request to /generate endpoint")
        
        if not text and (not file or file.filename == ''):
            raise HTTPException(status_code=400, detail="Either text or file must be provided")

        try:
            # Extract text
            if file:
                print(f"Processing file: {file.filename}")
                if not file.filename.endswith('.txt'):
                    raise HTTPException(status_code=400, detail="Only .txt files are supported")
                content = await file.read()
                text_content = content.decode('utf-8')
                print(f"Read {len(text_content)} characters from file")
            else:
                text_content = text
                print(f"Processing text input of length: {len(text_content) if text_content else 0}")

            # Generate the knowledge graph
            print("Generating knowledge graph...")
            net = await generate_knowledge_graph(text_content)
            
            if net is None:
                raise Exception("Failed to generate knowledge graph: generate_knowledge_graph returned None")
                
            print("Rendering graph to HTML...")
            html_content = net.generate_html()
            
            if not html_content:
                raise Exception("Failed to generate HTML content: generate_html() returned None or empty")
                
            print("Returning HTML response")
            return HTMLResponse(content=html_content, status_code=200)

        except Exception as e:
            print(f"Error in generate_graph: {str(e)}")
            print(f"Error type: {type(e).__name__}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Error generating graph: {str(e)}")
            
    except HTTPException as he:
        print(f"HTTP Exception: {he.detail}")
        raise
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("fastapi_app:app", host="0.0.0.0", port=8000, reload=True)
