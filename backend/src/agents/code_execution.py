import asyncio
from typing import Dict, Any, Optional
import structlog
from e2b import Sandbox

logger = structlog.get_logger()

class CodeExecutionAgent:
    """
    Code execution agent using E2B sandbox
    
    - Executes code in secure sandboxed environment
    - Supports multiple programming languages
    - Returns execution results with stdout/stderr
    - Handles timeouts and errors gracefully
    """
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.supported_languages = {
            'python': 'python3',
            'javascript': 'node',
            'typescript': 'ts-node',
            'bash': 'bash',
            'rust': 'rustc',
        }
    
    async def execute(
        self,
        code: str,
        language: str,
        timeout: int = 30
    ) -> Dict[str, Any]:
        """
        Execute code in E2B sandbox
        
        Args:
            code: Code to execute
            language: Programming language
            timeout: Execution timeout in seconds
            
        Returns:
            {
                "success": bool,
                "stdout": str,
                "stderr": str,
                "exit_code": int,
                "execution_time": float,
                "error": str (if any)
            }
        """
        try:
            # Validate language
            if language not in self.supported_languages:
                return {
                    "success": False,
                    "error": f"Unsupported language: {language}",
                    "stdout": "",
                    "stderr": "",
                    "exit_code": -1,
                    "execution_time": 0.0
                }
            
            # Create sandbox
            sandbox = await Sandbox.create(api_key=self.api_key)
            
            try:
                # Prepare execution command
                command = self._build_command(code, language)
                
                # Execute code
                start_time = asyncio.get_event_loop().time()
                
                proc = await sandbox.process.start(
                    cmd=command,
                    timeout=timeout
                )
                
                # Wait for completion
                await proc.wait()
                
                execution_time = asyncio.get_event_loop().time() - start_time
                
                # Get output
                stdout = await proc.stdout
                stderr = await proc.stderr
                exit_code = proc.exit_code
                
                result = {
                    "success": exit_code == 0,
                    "stdout": stdout,
                    "stderr": stderr,
                    "exit_code": exit_code,
                    "execution_time": execution_time,
                    "language": language
                }
                
                logger.info(
                    "code_executed",
                    language=language,
                    exit_code=exit_code,
                    execution_time=execution_time
                )
                
                return result
                
            finally:
                # Clean up sandbox
                await sandbox.close()
                
        except asyncio.TimeoutError:
            return {
                "success": False,
                "error": f"Execution timed out after {timeout} seconds",
                "stdout": "",
                "stderr": "Timeout error",
                "exit_code": -1,
                "execution_time": timeout
            }
        except Exception as e:
            logger.error("code_execution_failed", error=str(e))
            return {
                "success": False,
                "error": str(e),
                "stdout": "",
                "stderr": str(e),
                "exit_code": -1,
                "execution_time": 0.0
            }
    
    def _build_command(self, code: str, language: str) -> str:
        """Build execution command for language"""
        executor = self.supported_languages[language]
        
        if language == 'python':
            return f"echo '{code}' | python3"
        elif language == 'javascript':
            return f"echo '{code}' | node"
        elif language == 'typescript':
            return f"echo '{code}' | ts-node"
        elif language == 'bash':
            return code
        elif language == 'rust':
            return f"echo '{code}' > temp.rs && rustc temp.rs -o temp && ./temp"
        else:
            return f"echo '{code}' | {executor}"
    
    async def validate_code(self, code: str, language: str) -> Dict[str, Any]:
        """
        Validate code syntax without execution
        
        Returns:
            {
                "valid": bool,
                "error": str (if invalid)
            }
        """
        try:
            if language == 'python':
                # Python syntax check
                result = await self.execute(
                    f"python3 -m py_compile -c '{code}'",
                    'bash',
                    timeout=10
                )
                return {
                    "valid": result["success"],
                    "error": result["stderr"] if not result["success"] else None
                }
            elif language == 'javascript':
                # JavaScript syntax check with node
                result = await self.execute(
                    f"node -c '{code}'",
                    'bash',
                    timeout=10
                )
                return {
                    "valid": result["success"],
                    "error": result["stderr"] if not result["success"] else None
                }
            else:
                # For other languages, just return valid
                return {"valid": True, "error": None}
                
        except Exception as e:
            return {"valid": False, "error": str(e)}
    
    def get_supported_languages(self) -> list[str]:
        """Get list of supported programming languages"""
        return list(self.supported_languages.keys())
