#!/usr/bin/env python3
"""Remove Top Programs section and filter programs with count < 20"""

import re

with open('src/index.html', 'r') as f:
    lines = f.readlines()

# Remove Top Programs HTML section (lines 1487-1493, 0-indexed: 1486-1492)
# Actually, let's find it dynamically
new_lines = []
skip_next_few = False
skip_count = 0
in_top_programs_html = False

for i, line in enumerate(lines):
    # Check if we're entering the Top Programs HTML section
    if '<!-- Top Programs Section -->' in line:
        in_top_programs_html = True
        skip_next_few = True
        skip_count = 6  # Skip this line and the next 6 lines (7 total)
        continue
    
    if skip_next_few and skip_count > 0:
        skip_count -= 1
        continue
    
    skip_next_few = False
    
    # Remove updateTopPrograms() function call
    if line.strip() == '            updateTopPrograms();':
        continue
    
    # Remove updateTopPrograms() function definition
    if 'function updateTopPrograms()' in line:
        # Skip until we find the closing brace of this function
        in_function = True
        brace_count = 0
        skip_this_line = True
        for j in range(i, len(lines)):
            if j == i:
                continue
            for char in lines[j]:
                if char == '{':
                    brace_count += 1
                elif char == '}':
                    brace_count -= 1
                    if brace_count < 0:  # Closing brace found
                        # Skip this entire function block
                        skip_this_line = False
                        break
            if not skip_this_line:
                break
        # Skip the entire function
        if in_function:
            continue
    
    # Update program filter to add count >= 20 filter
    if '// Populate program filter' in line:
        # Check if already updated
        if 'filter out programs with counts under 20' not in line:
            line = line.replace('// Populate program filter', 
                              '// Populate program filter - filter out programs with counts under 20')
    
    if 'Object.entries(programs)' in line and '.filter' not in line:
        # Add filter before sort
        line = line.replace(
            'Object.entries(programs)',
            'Object.entries(programs).filter(([program, count]) => count >= 20)'
        )
    
    new_lines.append(line)

# Write back
with open('src/index.html', 'w') as f:
    f.writelines(new_lines)

print("Done! Removed Top Programs section and filtered programs with count < 20")

