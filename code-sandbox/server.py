#!/usr/bin/env python3
"""
Code Sandbox HTTP Server
Wraps code-sandbox-mcp tools as HTTP endpoints for LibreChat integration
"""

import asyncio
import subprocess
import tempfile
import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import uvicorn

app = FastAPI(title="Code Sandbox API", version="1.0.0")

class CodeRequest(BaseModel):
    code: str
    language: str = "python"  # python or javascript
    timeout: int = 30

class CodeResponse(BaseModel):
    success: bool
    output: str
    error: Optional[str] = None
    execution_time: float

# Security limits
MAX_EXECUTION_TIME = 60  # seconds
MAX_OUTPUT_SIZE = 100000  # characters

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "code-sandbox"}

@app.post("/execute", response_model=CodeResponse)
async def execute_code(request: CodeRequest):
    """Execute code in a sandboxed environment"""
    import time
    start_time = time.time()

    try:
        # Create temporary file
        suffix = ".py" if request.language == "python" else ".js"
        with tempfile.NamedTemporaryFile(mode='w', suffix=suffix, delete=False) as f:
            f.write(request.code)
            temp_file = f.name

        try:
            # Determine command based on language
            if request.language == "python":
                cmd = ["python3", "-u", temp_file]
            elif request.language == "javascript":
                cmd = ["node", temp_file]
            else:
                raise HTTPException(status_code=400, detail=f"Unsupported language: {request.language}")

            # Execute with timeout
            timeout = min(request.timeout, MAX_EXECUTION_TIME)
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=timeout,
                env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"}
            )

            output = result.stdout[:MAX_OUTPUT_SIZE]
            error = result.stderr[:MAX_OUTPUT_SIZE] if result.stderr else None

            execution_time = time.time() - start_time

            return CodeResponse(
                success=result.returncode == 0,
                output=output,
                error=error,
                execution_time=execution_time
            )

        finally:
            # Clean up temp file
            os.unlink(temp_file)

    except subprocess.TimeoutExpired:
        return CodeResponse(
            success=False,
            output="",
            error=f"Execution timed out after {timeout} seconds",
            execution_time=time.time() - start_time
        )
    except Exception as e:
        return CodeResponse(
            success=False,
            output="",
            error=str(e),
            execution_time=time.time() - start_time
        )

@app.get("/info")
async def info():
    """Get information about supported languages and limits"""
    return {
        "supported_languages": ["python", "javascript"],
        "max_execution_time": MAX_EXECUTION_TIME,
        "max_output_size": MAX_OUTPUT_SIZE,
        "python_version": subprocess.run(["python3", "--version"], capture_output=True, text=True).stdout.strip(),
        "node_version": subprocess.run(["node", "--version"], capture_output=True, text=True).stdout.strip() if os.path.exists("/usr/bin/node") else "not installed"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
