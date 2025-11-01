#!/usr/bin/env python3
"""Remove Top Programs section and filter programs with count < 20"""
import re

with open('src/index.html', 'r') as f:
    content = f.read()

# Remove Top Programs HTML section (7 lines total)
content = re.sub(
    r'            <!-- Top Programs Section -->\s*\n            <div class="top-programs-section">\s*\n                <div class="top-programs-title">Top Programs</div>\s*\n                <div class="top-programs-list" id="topProgramsList">\s*\n                    <!-- Programs will be populated by JavaScript -->\s*\n                </div>\s*\n            </div>\s*\n\s*\n',
    '',
    content
)

# Remove updateTopPrograms() function call
content = re.sub(r'\s*updateTopPrograms\(\);\s*\n', '\n', content)

# Remove entire updateTopPrograms function definition
content = re.sub(
    r'\s*// Update Top Programs section\s*\n\s*function updateTopPrograms\(\) \{.*?\}\s*\n',
    '',
    content,
    flags=re.DOTALL
)

# Update program filter comment if not already updated
if 'filter out programs with counts under 20' not in content:
    content = content.replace(
        '// Populate program filter',
        '// Populate program filter - filter out programs with counts under 20'
    )

# Update program filter to add count >= 20 filter (only if not already present)
pattern = r'(Object\.entries\(programs\))(\s*\n\s*\.sort)'
if '.filter(([program, count]) => count >= 20)' not in content:
    content = re.sub(
        pattern,
        r'\1.filter(([program, count]) => count >= 20)\2',
        content
    )

with open('src/index.html', 'w') as f:
    f.write(content)

print("Done! Removed Top Programs section and filtered programs with count < 20")

