import os
import ast

def analyze_directory(directory):
    issues = []
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.py') and 'migrations' not in root and 'venv' not in root:
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        tree = ast.parse(f.read(), filename=file_path)
                    
                    for node in ast.walk(tree):
                        # Empty functions/methods or functions that just return Response({})
                        if isinstance(node, ast.FunctionDef):
                            if len(node.body) == 1 and isinstance(node.body[0], ast.Pass):
                                issues.append(f"{file_path}: Function '{node.name}' is implemented as 'pass'.")
                            
                            # Check for missing docstrings
                            if not ast.get_docstring(node) and not node.name.startswith('__'):
                                pass # Too noisy, ignore for now
                        
                        # Find TODOs in comments (Need tokenizer, skip for ast)
                        
                        # Find try-except with 'pass'
                        if isinstance(node, ast.ExceptHandler):
                            if len(node.body) == 1 and isinstance(node.body[0], ast.Pass):
                                issues.append(f"{file_path}: Line {node.lineno}: Empty except block (silenced exception).")

                        # Empty classes
                        if isinstance(node, ast.ClassDef):
                            if len(node.body) == 1 and isinstance(node.body[0], ast.Pass):
                                issues.append(f"{file_path}: Class '{node.name}' is empty (pass).")

                except Exception as e:
                    issues.append(f"{file_path}: Parse error - {str(e)}")
                    
    return issues

if __name__ == '__main__':
    project_dir = 'apps'
    found_issues = analyze_directory(project_dir)
    with open('analysis_report.txt', 'w') as f:
        for issue in found_issues:
            f.write(issue + '\n')
    print(f"Found {len(found_issues)} issues. Written to analysis_report.txt")
