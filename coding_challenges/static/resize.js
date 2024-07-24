document.addEventListener('DOMContentLoaded', () => {
    const handle = document.querySelector('.resize-handle');
    const leftPanel = document.querySelector('.challenge-details');
    const rightPanel = document.querySelector('.code-editor');
    let isResizing = false;

    if (handle) {
        handle.addEventListener('mousedown', (e) => {
            isResizing = true;
            document.addEventListener('mousemove', resizePanels);
            document.addEventListener('mouseup', stopResizing);
        });
    }

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

    // Initialize CodeMirror
    window.codeMirrorInstance = CodeMirror.fromTextArea(document.getElementById('code-editor'), {
        lineNumbers: true,
        mode: 'python',  // Default mode
        theme: 'dracula',
        autoCloseBrackets: true,
        matchBrackets: true,
        tabSize: 4,
        indentUnit: 4,
        indentWithTabs: true,
    });

    // Syntax highlighting based on language selection
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            const selectedLanguage = e.target.value;
            const mode = selectedLanguage === '71' ? 'python' : selectedLanguage === '63' ? 'javascript' : 'text/x-java';
            window.codeMirrorInstance.setOption('mode', mode);
        });
    }

    // Run button functionality
    const runBtn = document.getElementById('run-btn');
    if (runBtn) {
        runBtn.addEventListener('click', async () => {
            const code = window.codeMirrorInstance.getValue();
            try {
                const challengeId = window.location.pathname.split('/')[2];  // Extract challenge_id from URL
                const result = await executeCode(code, challengeId); // Pass challengeId to executeCode function
                displayResults(result); 
            } catch (error) {
                console.error('Error running code:', error);
                document.getElementById('editor-output').textContent = 'An error occurred while running the code.';
            }
        });
    }
});

async function executeCode(code, challengeId) {
    const languageId = document.getElementById('language-select').value;

    try {
        const response = await fetch('execute_code/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            body: JSON.stringify({
                code: code,
                language_id: languageId
            }),
        });

        const text = await response.text(); // Read response as text
        console.log('Raw response text:', text);

        // Check if response is valid JSON
        let resultArray;
        try {
            resultArray = JSON.parse(text); // Assuming the response is JSON array
        } catch (e) {
            console.error('Failed to parse JSON:', e);
            return { error: 'An error occurred while parsing the response.' };
        }

        console.log('Parsed response:', resultArray);
        return resultArray;
    } catch (error) {
        console.error('Error running code:', error);
        return { error: 'An error occurred while running the code.' };
    }
}

function displayResults(result) {
    const output = document.getElementById('editor-output');
    output.innerHTML = '';  // Clear previous content

    // Handle cases where there's an error in the result
    if (result.error) {
        output.textContent = result.error;
        return;
    }

    // Check if result contains test case results
    if (result.results && Array.isArray(result.results)) {
        result.results.forEach((testCase, index) => {
            const testCaseElement = document.createElement('div');
            testCaseElement.className = 'test-case';

            testCaseElement.innerHTML = `
                <div class="test-case-header">
                    <h3>Test Case ${index + 1}</h3>
                </div>
                <div class="test-case-content">
                    <p><strong>Input:</strong> <pre>${testCase.input}</pre></p>
                    <p><strong>Expected Output:</strong> <pre>${testCase.expected_output}</pre></p>
                    <p><strong>Actual Output:</strong> <pre>${testCase.actual_output || 'No output'}</pre></p>
                    <p><strong>Status:</strong> <span class="${testCase.passed ? 'test-passed' : 'test-failed'}">${testCase.passed ? 'Passed' : 'Failed'}</span></p>
                </div>
            `;
            output.appendChild(testCaseElement);
        });
    } else {
        output.textContent = 'No test case results found.';
    }

    // Display overall status
    const overallStatus = document.createElement('div');
    overallStatus.className = 'overall-status';
    overallStatus.textContent = result.all_passed ? 'All test cases passed!' : 'Some test cases failed.';
    overallStatus.classList.add(result.all_passed ? 'status-pass' : 'status-fail');
    output.appendChild(overallStatus);
}
