let formQuestions = []; // Array to store questions and their configurations

function showValidationInputs() {
    const questionType = document.getElementById("questionType").value;
    const questionText = document.getElementById("questionInput").value;
    const isRequired = document.getElementById("isRequired").checked;
    const validationInputs = document.getElementById("validationInputs");

    if (!questionText) {
        alert("Please enter a question.");
        return;
    }

    // Clear previous validation inputs
    validationInputs.innerHTML = "";

    // Add validation inputs based on question type
    let validationHTML = `<div class="validation-container"><h3>Configure ${questionType} Question</h3>`;

    switch (questionType) {
        case "text":
            validationHTML += `
                <div class="validation-field">
                    <label>Max Length (Optional):</label>
                    <input type="number" id="textMaxLength" placeholder="Maximum Length">
                </div>
            `;
            break;

        case "multipleChoice":
            validationHTML += `
                <div class="validation-field">
                    <label>Options:</label>
                    <div id="optionsContainer">
                        <input type="text" class="optionInput" placeholder="Option 1">
                        <input type="text" class="optionInput" placeholder="Option 2">
                    </div>
                    <button type="button" onclick="addOption();">Add Option</button>
                </div>
            `;
            break;

        case "date":
            validationHTML += `
                <div class="validation-field">
                    <label>Date Range (Optional):</label>
                    <input type="date" id="dateMin" placeholder="Start Date">
                    <input type="date" id="dateMax" placeholder="End Date">
                </div>
            `;
            break;

        case "number":
            validationHTML += `
                <div class="validation-field">
                    <label>Min Value (Optional):</label>
                    <input type="number" id="numberMin" placeholder="Minimum Value">
                    <label>Max Value (Optional):</label>
                    <input type="number" id="numberMax" placeholder="Maximum Value">
                </div>
            `;
            break;
    }

    validationHTML += `</div>`;
    validationInputs.innerHTML = validationHTML;
    validationInputs.style.display = "block";
}

function addQuestion() {
    const questionInput = document.getElementById('questionInput').value;
    const questionType = document.getElementById('questionType').value;
    const isRequired = document.getElementById('isRequired') ? document.getElementById('isRequired').checked : false;
    const validationInputs = document.getElementById("validationInputs");
    const form = document.getElementById('dynamicForm');

    if (!questionInput) {
        alert('Please enter a question.');
        return;
    }

    let newQuestion;

    switch (questionType) {
        case 'text':
            newQuestion = `<label>${questionInput}</label><input type="text" name="${questionInput}"><br>`;
            break;
        case 'multipleChoice':
            newQuestion = `<label>${questionInput}</label><input type="radio" name="${questionInput}" value="Option 1"> Option 1<br><input type="radio" name="${questionInput}" value="Option 2"> Option 2<br>`;
            break;
        case 'checkbox':
            newQuestion = `<label>${questionInput}</label><input type="checkbox" name="${questionInput}" value="Option 1"> Option 1<br><input type="checkbox" name="${questionInput}" value="Option 2"> Option 2<br>`;
            break;
        case 'date':
            newQuestion = `<label>${questionInput}</label><input type="date" name="${questionInput}"><br>`;
            break;
        case 'number':
            newQuestion = `<label>${questionInput}</label><input type="number" name="${questionInput}"><br>`;
            break;
        default:
            newQuestion = '';
    }

    const questionId = `question-${Date.now()}`;
    const requiredCheckbox = `<label for="${questionId}-required">Required</label><input type="checkbox" id="${questionId}-required" onclick="toggleRequired('${questionId}')"><br>`;
    form.innerHTML += `<div id="${questionId}">${newQuestion}${requiredCheckbox}</div>`;

    // Add question to the formQuestions array
    formQuestions.push({
        questionText: questionInput,
        questionType,
        isRequired,
        validationData: {} // Add validation data if needed
    });

    // Save to localStorage and alert the user
    localStorage.setItem("formQuestions", JSON.stringify(formQuestions));
    alert("Question has been added to preview.");

    // Reset input fields and hide validation inputs
    document.getElementById('questionInput').value = '';
    document.getElementById('questionType').value = 'text';
    if (document.getElementById('isRequired')) {
        document.getElementById('isRequired').checked = false;
    }
    validationInputs.style.display = 'none';
}

function toggleRequired(questionId) {
    const questionDiv = document.getElementById(questionId);
    const inputField = questionDiv.querySelector('input[type="text"], input[type="radio"], input[type="checkbox"], input[type="date"], input[type="number"]');
    const requiredCheckbox = document.getElementById(`${questionId}-required`);

    if (requiredCheckbox.checked) {
        inputField.setAttribute('required', 'required');
    } else {
        inputField.removeAttribute('required');
    }
}

function showPreview() {
    if (formQuestions.length === 0) {
        alert("No questions added to the form.");
        return;
    }
    window.location.href = "preview.html";
}

function resetForm() {
    localStorage.removeItem("formQuestions");
    formQuestions = [];
    document.getElementById("resetFormBtn").style.display = "none";
}