// CSV Dictionary Parsing (Meetei Mayek)
function parseDictionary(csvText) {
    const dict = {};
    const lines = csvText.split(/\r?\n/);
    for (let line of lines) {
        const [key, values] = line.split(',');
        if (key && values) {
            dict[key.trim()] = values.trim().split('|').map(v => v.trim());
        }
    }
    return dict;
}

// Replace repeated words and highlight
function replaceText() {
    let text = document.getElementById('inputText').value;
    const defaultWord = document.getElementById('defaultWord').value;
    const dictText = document.getElementById('customDict').value;

    if (!text) {
        document.getElementById('highlightedOutput').innerHTML = "";
        return;
    }

    const words = text.split(/\s+/);
    if (words.length > 50000) {
        alert("Text exceeds 50,000 words!");
        return;
    }

    const customDict = parseDictionary(dictText);
    const repeatCount = {};

    // Regex to detect repeated words
    text = text.replace(/\b(\S+)\b(?:\s+\1\b)+/gu, function(match, p1) {
        const wordsArr = match.split(/\s+/);

        for (let i = 1; i < wordsArr.length; i++) {
            repeatCount[p1] = (repeatCount[p1] || 0) + 1;
            if (customDict[p1]) {
                const replacements = customDict[p1];
                const index = (repeatCount[p1] - 1) % replacements.length;
                wordsArr[i] = `<span class="replaced">${replacements[index]}</span>`;
            } else if (defaultWord) {
                wordsArr[i] = `<span class="replaced">${defaultWord}</span>`;
            } else {
                wordsArr[i] = wordsArr[i];
            }
        }
        return wordsArr.join(' ');
    });

    document.getElementById('highlightedOutput').innerHTML = text;
}

// Input TXT file upload
document.getElementById('inputFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        document.getElementById('inputText').value = evt.target.result;
        replaceText();
    };
    reader.readAsText(file, "UTF-8");
});

// Dictionary CSV upload
document.getElementById('dictFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        document.getElementById('customDict').value = evt.target.result;
        replaceText();
    };
    reader.readAsText(file, "UTF-8");
});

// Auto replace on paste
document.getElementById('inputText').addEventListener('paste', function() {
    setTimeout(replaceText, 50);
});

// Live updates if dictionary or default word changes
document.getElementById('customDict').addEventListener('input', replaceText);
document.getElementById('defaultWord').addEventListener('input', replaceText);

// Copy output (strip HTML)
function copyOutput() {
    const text = document.getElementById('highlightedOutput').innerText;
    navigator.clipboard.writeText(text).then(() => {
        alert("Output copied!");
    });
}

// Download output as TXT
function downloadOutput() {
    const text = document.getElementById('highlightedOutput').innerText;
    if (!text) {
        alert("No output to download!");
        return;
    }
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "replaced_text_mni.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
