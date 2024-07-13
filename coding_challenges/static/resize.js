// resize.js

const handle = document.querySelector('.resize-handle');
const leftPanel = document.querySelector('.challenge-details');
const rightPanel = document.querySelector('.code-editor');
let isResizing = false;

handle.addEventListener('mousedown', (e) => {
    isResizing = true;
    document.addEventListener('mousemove', resizePanels);
    document.addEventListener('mouseup', stopResizing);
});

function resizePanels(e) {
    if (!isResizing) return;

    const containerWidth = document.querySelector('.container').clientWidth;
    let newLeftWidth = e.clientX / containerWidth * 100;
    let newRightWidth = 100 - newLeftWidth - 0.5; // Adjust for the handle width

    // Set minimum and maximum widths for left and right panels
    const minLeftWidth = 20; // Minimum width for left panel in percentage
    const maxLeftWidth = 80; // Maximum width for left panel in percentage
    const minRightWidth = 20; // Minimum width for right panel in percentage

    if (newLeftWidth < minLeftWidth) newLeftWidth = minLeftWidth;
    if (newLeftWidth > maxLeftWidth) newLeftWidth = maxLeftWidth;

    newRightWidth = 100 - newLeftWidth - 0.5;

    if (newRightWidth < minRightWidth) {
        newRightWidth = minRightWidth;
        newLeftWidth = 100 - newRightWidth - 0.5;
    }

    leftPanel.style.flex = `0 0 ${newLeftWidth}%`;
    rightPanel.style.flex = `0 0 ${newRightWidth}%`;

    // Refresh the CodeMirror instance to adjust its size
    if (window.codeMirrorInstance) {
        window.codeMirrorInstance.refresh();
    }
}

function stopResizing() {
    isResizing = false;
    document.removeEventListener('mousemove', resizePanels);
    document.removeEventListener('mouseup', stopResizing);
}
// JavaScript for Submit Button Interaction
const submitBtn = document.getElementById('submit-btn');
const submitMsg = document.getElementById('submit-msg');

document.addEventListener('DOMContentLoaded', (event) => {
    // Initialize CodeMirror
    window.codeMirrorInstance = CodeMirror.fromTextArea(document.getElementById('code-editor'), {
        lineNumbers: true,
        mode: 'javascript',  // Default mode
        theme: 'material-darker',
        autoCloseBrackets: true,
        matchBrackets: true,
        tabSize: 4,
        indentUnit: 4,
        indentWithTabs: true,
    });

    // Syntax highlighting based on language selection
    const languageSelect = document.getElementById('language-select');
    languageSelect.addEventListener('change', (e) => {
        const selectedLanguage = e.target.value;
        const mode = selectedLanguage === 'python' ? 'python' : 'javascript'; // Adjust for other languages
        CodeMirror.autoLoadMode(window.codeMirrorInstance, mode);
        window.codeMirrorInstance.setOption('mode', mode);
    });

    // Run button functionality (example)
    const runBtn = document.getElementById('run-btn');
    runBtn.addEventListener('click', async () => {
        const code = window.codeMirrorInstance.getValue();
        try {
            const result = await executeCode(code); // Implement executeCode function for running code
            document.getElementById('editor-output').textContent = result;
        } catch (error) {
            console.error('Error running code:', error);
            document.getElementById('editor-output').textContent = 'An error occurred while running the code.';
        }
    });

    // Submit button functionality (example)
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        // Example: Simulate loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        // Example: Perform actual form submission via AJAX
        const formData = new FormData(document.getElementById('code-form'));
        try {
            const response = await fetch('/submit-code', {
                method: 'POST',
                body: formData
            });
            if (response.ok) {
                submitMsg.textContent = 'Code submitted successfully!';
                submitMsg.style.color = 'green';
            } else {
                submitMsg.textContent = 'Submission failed. Please try again.';
                submitMsg.style.color = 'red';
            }
        } catch (error) {
            console.error('Error submitting code:', error);
            submitMsg.textContent = 'An error occurred. Please try again later.';
            submitMsg.style.color = 'red';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Code';
        }
    });
});
