#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { program } = require('commander');

// For terminal width detection
const os = require('os');
const child_process = require('child_process');

// Define the package version
const packageVersion = '1.0.0';

// Configure command-line options
program
  .name('tree-noter')
  .description('Format tree command output with aligned comments')
  .version(packageVersion)
  .argument('[file]', 'Input file containing tree output with comments (uses stdin if not specified)')
  .option('-o, --output <file>', 'Output file (uses stdout if not specified)')
  .option('-d, --decorator', 'Use decorator style instead of aligned style')
  .option('-s, --separator <value>', 'Separator for decorator style (default: -----)', '-----')
  .option('-g, --gap <width>', 'Gap between tree and comments', parseInt, 30)
  .option('-c, --comment-marker <marker>', 'Comment marker to look for', '#')
  .option('-w, --wrap', 'Enable comment wrapping for long comments')
  .option('-m, --max-width <width>', 'Maximum width for output including comments (auto-detects terminal width if not specified)', parseInt)
  .option('-i, --indent <spaces>', 'Spaces to indent wrapped comment lines', parseInt, 0);

program.addHelpText('after', `
Examples:
  # Format from stdin to stdout with default settings (aligned style)
  tree | tree-noter

  # Format from a file with a gap of 40 characters
  tree-noter tree-output.txt -g 40

  # Use decorator style with default separator (-----)
  tree-noter tree-output.txt -d

  # Use decorator style with custom separator
  tree-noter tree-output.txt -d -s " === "

  # Enable comment wrapping with max width
  tree-noter tree-output.txt -w -m 100

  # Save formatted output to a file
  tree-noter tree-output.txt -o formatted-tree.txt

Input Format:
  The input should be a tree command output with comments after the tree structure.
  Comments should be preceded by the comment marker (default: #).

  Example input:
  .
  ├── src # Source code directory
  │   └── index.js # Main entry point
  └── package.json # Project configuration
`);

// Parse command-line arguments
program.parse(process.argv);
const options = program.opts();
const inputFile = program.args[0];

// Get terminal width if max-width is not specified
function getTerminalWidth() {
  try {
    if (process.stdout.isTTY) {
      return process.stdout.columns;
    }
    
    // Try using stty command as fallback
    const sttyOutput = child_process.execSync('stty size', { stdio: ['pipe', 'pipe', 'ignore'] });
    const match = sttyOutput.toString().match(/\d+ (\d+)/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
  } catch (e) {
    // Fallback if we can't detect terminal width
  }
  
  // Default if we can't detect
  return 80;
}

// Set max width based on options or terminal size
const maxWidth = options.maxWidth || getTerminalWidth();

// Set up input and output streams
const inputStream = inputFile
  ? fs.createReadStream(inputFile)
  : process.stdin;

const outputStream = options.output
  ? fs.createWriteStream(options.output)
  : process.stdout;

// Word-wrap function for comments
function wrapComment(comment, maxLineLength, indent) {
  // Check if wrapping is disabled with --no-wrap
  if (!comment || !options.wrap) {
    return [comment];
  }
  
  const words = comment.split(/\s+/);
  const lines = [];
  let currentLine = '';
  
  words.forEach(word => {
    if (currentLine.length + word.length + 1 <= maxLineLength) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });
  
  if (currentLine) lines.push(currentLine);
  return lines;
}

// Process the tree output
async function processTreeOutput() {
  const rl = readline.createInterface({
    input: inputStream,
    crlfDelay: Infinity
  });

  // Analyze the structure first to determine tree depth
  const lines = [];
  let maxTreeWidth = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;
    
    // Find the comment marker position or use the end of the line
    const commentPos = line.indexOf(options.commentMarker);
    const treeContent = commentPos >= 0 ? line.substring(0, commentPos).trimEnd() : line;
    
    // Update the max width if this line is longer
    maxTreeWidth = Math.max(maxTreeWidth, treeContent.length);
    
    // Store the line for processing
    lines.push(line);
  }

  // Determine the alignment width (either fixed or based on content)
  const alignmentWidth = Math.max(options.gap, maxTreeWidth + 3);
  
  // Calculate available space for comments
  const commentMaxWidth = maxWidth - alignmentWidth - 1;
  
  // Process each line and format according to the selected style
  lines.forEach(line => {
    if (!line.trim()) {
      // Empty line handling
      outputStream.write('\n');
      return;
    }

    const commentPos = line.indexOf(options.commentMarker);
    if (commentPos < 0) {
      // No comment in this line
      outputStream.write(line + '\n');
      return;
    }

    const treeContent = line.substring(0, commentPos).trimEnd();
    let comment = line.substring(commentPos + options.commentMarker.length);
    
    // Handle comment wrapping for long comments
    const wrappedComment = wrapComment(comment.trim(), commentMaxWidth, options.indent);
    
    if (options.decorator) {
      // Decorator style with separator
      const decoratorChar = options.separator || '-----';
      
      // Calculate needed length for decorator
      const availableWidth = maxWidth - treeContent.length - wrappedComment[0].length - 3; // -3 for spaces
      
      // Generate decorator of appropriate length by repeating the pattern
      let decoratorPattern = '';
      if (decoratorChar.length === 1) {
        // Single character, just repeat it
        decoratorPattern = decoratorChar.repeat(availableWidth);
      } else {
        // Multi-character, repeat it until we reach the desired length
        const repeatCount = Math.ceil(availableWidth / decoratorChar.length);
        decoratorPattern = decoratorChar.repeat(repeatCount).substring(0, availableWidth);
      }
      
      // Ensure decorator has at least length of 1
      decoratorPattern = decoratorPattern || '-';
      
      // Right align the comment
      outputStream.write(`${treeContent} ${decoratorPattern} ${wrappedComment[0]}\n`);
      
      // Write any additional wrapped lines with proper indentation
      if (wrappedComment.length > 1) {
        const baseIndent = ' '.repeat(treeContent.length);
        const commentIndent = ' '.repeat(decoratorPattern.length + 1);
        
        for (let i = 1; i < wrappedComment.length; i++) {
          outputStream.write(`${baseIndent} ${commentIndent}${' '.repeat(options.indent)}${wrappedComment[i]}\n`);
        }
      }
    } else {
      // Aligned style - right align comments
      const padding = ' '.repeat(Math.max(0, alignmentWidth - treeContent.length));
      outputStream.write(`${treeContent}${padding}${wrappedComment[0]}\n`);
      
      // Write any additional wrapped lines with proper indentation
      if (wrappedComment.length > 1) {
        const padding = ' '.repeat(alignmentWidth);
        for (let i = 1; i < wrappedComment.length; i++) {
          outputStream.write(`${padding}${' '.repeat(options.indent)}${wrappedComment[i]}\n`);
        }
      }
    }
  });
}

// Handle potential errors
inputStream.on('error', (err) => {
  console.error(`Error reading input: ${err.message}`);
  process.exit(1);
});

outputStream.on('error', (err) => {
  console.error(`Error writing output: ${err.message}`);
  process.exit(1);
});

// Run the processing
processTreeOutput().catch(err => {
  console.error('Error processing tree output:', err);
  process.exit(1);
});
