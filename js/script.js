let formQuestions = [];

function togglePreview() {
    const previewSection = document.getElementById('previewSection');
    const submitButton = document.querySelector('.submit-btn');
    const isPreviewVisible = previewSection.style.display === 'block';
    
    // If preview is visible, hide it
    if (isPreviewVisible) {
        previewSection.style.display = 'none';
        submitButton.style.display = 'none';
    } else {
        // Hide modify view if it's open
        hideModifyView();
        // Show preview and submit button
        previewSection.style.display = 'block';
        submitButton.style.display = 'block';
        // Set title back to Form Preview
        document.querySelector('#previewSection h2').textContent = 'Form Preview';
        renderPreview();
    }
}

function addOption() {
    const optionsContainer = document.getElementById("optionInputs");
    const optionCount = optionsContainer.getElementsByClassName("optionInput").length + 1;
    const newOption = document.createElement("input");
    newOption.type = "text";
    newOption.className = "optionInput";
    newOption.placeholder = `Option ${optionCount}`;
    optionsContainer.appendChild(newOption);
}

function updateValidations() {
    const type = document.getElementById('questionType').value;
    const validationContainer = document.getElementById('validationInputs');
    validationContainer.innerHTML = ''; // Clear previous validations

    // Display validations only for relevant question types
    if (type === 'text') {
        validationContainer.innerHTML += `
            <input type="number" id="minChars" placeholder="Min characters">
            <input type="number" id="maxChars" placeholder="Max characters">
        `;
    } else if (type === 'date') {
        validationContainer.innerHTML += `
            <input type="date" id="minDate" placeholder="Start date">
            <input type="date" id="maxDate" placeholder="End date">
        `;
    } else if (type === 'number') {
        validationContainer.innerHTML += `
            <input type="number" id="minValue" placeholder="Min value">
            <input type="number" id="maxValue" placeholder="Max value">
        `;
    }
}

function showValidationInputs() {
    const questionType = document.getElementById('questionType').value;
    const validationsContainer = document.getElementById('validationsContainer');
    const textValidation = document.getElementById('textValidation');
    const dateValidation = document.getElementById('dateValidation');
    const numberValidation = document.getElementById('numberValidation');
    const optionsValidation = document.getElementById('optionsValidation');

    // First hide everything
    validationsContainer.style.display = 'none';
    textValidation.style.display = 'none';
    dateValidation.style.display = 'none';
    numberValidation.style.display = 'none';
    optionsValidation.style.display = 'none';

    // If no type is selected, return early
    if (!questionType) return;

    // Show the validations container
    validationsContainer.style.display = 'block';

    // Show appropriate validation section based on type
    switch(questionType) {
        case 'text':
            textValidation.style.display = 'block';
            break;
        case 'date':
            dateValidation.style.display = 'block';
            break;
        case 'number':
            numberValidation.style.display = 'block';
            setupRealTimeValidation();
            break;
        case 'radio':
        case 'checkbox':
            optionsValidation.style.display = 'block';
            break;
    }

    console.log('Question type:', questionType); // Debug log
    console.log('Validation container display:', validationsContainer.style.display); // Debug log
}

function addQuestion() {
    const questionText = document.getElementById('questionText').value;
    const questionType = document.getElementById('questionType').value;
    const isRequired = document.getElementById('isRequired').checked;
    const options = [];
    const validations = {};

    if (!questionText || !questionType) {
        alert('Please fill in all required fields');
        return;
    }

    // Handle options for radio and checkbox
    if (['radio', 'checkbox'].includes(questionType)) {
        const optionElements = document.querySelectorAll('#optionInputs input');
        optionElements.forEach(input => {
            if (input.value) options.push(input.value);
        });

        if (options.length < 2) {
            alert('Please add at least 2 options');
            return;
        }
    }

    // Handle validations based on type
    switch(questionType) {
        case 'text':
            const maxChars = document.getElementById('maxChars').value;
            if (maxChars) validations.maxChars = maxChars;
            break;
        case 'date':
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            if (startDate) validations.minDate = startDate;
            if (endDate) validations.maxDate = endDate;
            break;
        case 'number':
            const minValue = document.getElementById('minValue').value;
            const maxValue = document.getElementById('maxValue').value;
            if (minValue) validations.minValue = minValue;
            if (maxValue) validations.maxValue = maxValue;
            
            // Add validation check
            if (minValue && maxValue && parseFloat(minValue) >= parseFloat(maxValue)) {
                alert('Maximum value must be greater than minimum value');
                return;
            }
            break;
    }

    formQuestions.push({
        questionText,
        questionType,
        isRequired,
        options,
        validations
    });

    // Show success message
    alert('Question added successfully!');

    clearInputs();
    showValidationInputs();
    if (document.getElementById('previewSection').style.display === 'block') {
        renderPreview();
    }
}

function renderPreview() {
    const previewForm = document.getElementById('previewForm');
    previewForm.innerHTML = '';

    // Check if form is empty
    if (formQuestions.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-form-message';
        emptyMessage.innerHTML = 'No questions added yet. Add some questions to preview your form!';
        previewForm.appendChild(emptyMessage);
        return;
    }

    formQuestions.forEach((question, index) => {
        const fieldset = document.createElement('div');
        fieldset.className = 'preview-question';

        const label = document.createElement('label');
        label.innerHTML = `${index + 1}. ${question.questionText}${question.isRequired ? '<span style="color: red">*</span>' : ''}`;
        fieldset.appendChild(label);

        let input;
        switch (question.questionType) {
            case 'text':
                input = `<input type="text" 
                    id="q${index}" 
                    ${question.validations.maxChars ? `maxlength="${question.validations.maxChars}"` : ''} 
                    ${question.isRequired ? 'required' : ''}>
                    <div class="error-message" id="error_q${index}"></div>`;
                break;
            case 'radio':
                input = `<div class="radio-group">` + 
                    question.options.map(option => `
                        <label class="radio-inline">
                            <input type="radio" name="q${index}" id="q${index}_${option}" value="${option}" ${question.isRequired ? 'required' : ''}>
                            ${option}
                        </label>
                    `).join('') + 
                    `</div><div class="error-message" id="error_q${index}"></div>`;
                break;
            case 'checkbox':
                input = `<div class="checkbox-group">` + 
                    question.options.map(option => `
                        <label class="checkbox-inline">
                            <input type="checkbox" name="q${index}" id="q${index}_${option}" value="${option}">
                            ${option}
                        </label>
                    `).join('') + 
                    `</div><div class="error-message" id="error_q${index}"></div>`;
                break;
            case 'date':
                input = `<input type="date" 
                    id="q${index}"
                    ${question.validations.minDate ? `min="${question.validations.minDate}"` : ''}
                    ${question.validations.maxDate ? `max="${question.validations.maxDate}"` : ''}
                    ${question.isRequired ? 'required' : ''}>
                    <div class="error-message" id="error_q${index}"></div>`;
                break;
            case 'number':
                input = `<input type="number" 
                    id="q${index}"
                    ${question.validations.minValue ? `min="${question.validations.minValue}"` : ''}
                    ${question.validations.maxValue ? `max="${question.validations.maxValue}"` : ''}
                    ${question.isRequired ? 'required' : ''}>
                    <div class="error-message" id="error_q${index}"></div>`;
                break;
        }

        fieldset.innerHTML += input;
        previewForm.appendChild(fieldset);
    });
}

function resetForm() {
    formQuestions = [];
    document.getElementById('previewForm').innerHTML = '';
    clearInputs();
    updateValidations();
    toggleOptionsContainer();
    alert('Form reset successfully!');
}

function clearInputs() {
    document.getElementById('questionText').value = '';
    document.getElementById('questionType').selectedIndex = 0;
    document.getElementById('isRequired').checked = false;
    document.getElementById('optionInputs').innerHTML = '';
    document.getElementById('maxChars').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('minValue').value = '';
    document.getElementById('maxValue').value = '';
    showValidationInputs();
}

function toggleOptionsContainer() {
    const questionType = document.getElementById('questionType').value;
    const optionsValidation = document.getElementById('optionsValidation');
    optionsValidation.style.display = ['radio', 'checkbox'].includes(questionType) ? 'block' : 'none';
}

// Make sure the event listener is properly set up
document.addEventListener('DOMContentLoaded', () => {
    const questionTypeSelect = document.getElementById('questionType');
    questionTypeSelect.addEventListener('change', showValidationInputs);
    
    // Initialize the state
    showValidationInputs();
});

// Hide validation inputs by default on page load
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('validationInputs').innerHTML = '';
});

// Add this new function for real-time validation
function setupRealTimeValidation() {
    const minValueInput = document.getElementById('minValue');
    const maxValueInput = document.getElementById('maxValue');
    
    function validateNumberInput(input, min, max) {
        const value = parseFloat(input.value);
        const tooltip = input.parentElement.querySelector('.tooltip-error');
        
        // Remove existing tooltip if it exists
        if (tooltip) {
            tooltip.remove();
        }
        
        // Remove invalid class
        input.classList.remove('invalid');
        
        if (input.value === '') return; // Skip validation if empty
        
        let errorMessage = null;
        
        if (min !== null && value < min) {
            errorMessage = `Value must be at least ${min}`;
        } else if (max !== null && value > max) {
            errorMessage = `Value must not exceed ${max}`;
        }
        
        if (errorMessage) {
            // Add invalid class
            input.classList.add('invalid');
            
            // Create and show tooltip
            const tooltipDiv = document.createElement('div');
            tooltipDiv.className = 'tooltip-error';
            tooltipDiv.textContent = errorMessage;
            input.parentElement.appendChild(tooltipDiv);
            
            // Auto-remove tooltip after 3 seconds
            setTimeout(() => {
                tooltipDiv.remove();
            }, 3000);
        }
    }
    
    // Add event listeners for real-time validation
    const numberValidation = document.getElementById('numberValidation');
    const inputs = numberValidation.querySelectorAll('input[type="number"]');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            const min = minValueInput.value ? parseFloat(minValueInput.value) : null;
            const max = maxValueInput.value ? parseFloat(maxValueInput.value) : null;
            validateNumberInput(this, min, max);
        });
    });
}

function validateForm(event) {
    event.preventDefault();
    let isValid = true;
    
    // Reset all error messages
    document.querySelectorAll('.error-message').forEach(error => {
        error.style.display = 'none';
    });
    document.querySelectorAll('input').forEach(input => {
        input.classList.remove('input-error');
    });

    formQuestions.forEach((question, index) => {
        const errorElement = document.getElementById(`error_q${index}`);
        let inputElement;

        switch(question.questionType) {
            case 'radio':
                const radioInputs = document.querySelectorAll(`input[name="q${index}"]`);
                const radioSelected = Array.from(radioInputs).some(input => input.checked);
                if (question.isRequired && !radioSelected) {
                    errorElement.textContent = 'Please select an option';
                    errorElement.style.display = 'block';
                    radioInputs.forEach(input => input.classList.add('input-error'));
                    isValid = false;
                }
                break;

            case 'checkbox':
                const checkboxInputs = document.querySelectorAll(`input[name="q${index}"]`);
                const checkboxSelected = Array.from(checkboxInputs).some(input => input.checked);
                if (question.isRequired && !checkboxSelected) {
                    errorElement.textContent = 'Please select at least one option';
                    errorElement.style.display = 'block';
                    checkboxInputs.forEach(input => input.classList.add('input-error'));
                    isValid = false;
                }
                break;

            default:
                inputElement = document.getElementById(`q${index}`);
                if (!inputElement) return; // Using continue here would skip across function boundaries which is not allowed

                // Required field validation
                if (question.isRequired && !inputElement.value) {
                    errorElement.textContent = 'This field is required';
                    errorElement.style.display = 'block';
                    inputElement.classList.add('input-error');
                    isValid = false;
                }

                // Type-specific validations
                if (inputElement.value) {
                    switch(question.questionType) {
                        case 'number':
                            const value = Number(inputElement.value);
                            if (question.validations.minValue && value < Number(question.validations.minValue)) {
                                errorElement.textContent = `Value must be at least ${question.validations.minValue}`;
                                errorElement.style.display = 'block';
                                inputElement.classList.add('input-error');
                                isValid = false;
                            }
                            if (question.validations.maxValue && value > Number(question.validations.maxValue)) {
                                errorElement.textContent = `Value must not exceed ${question.validations.maxValue}`;
                                errorElement.style.display = 'block';
                                inputElement.classList.add('input-error');
                                isValid = false;
                            }
                            break;

                        case 'date':
                            const dateValue = new Date(inputElement.value);
                            if (question.validations.minDate && dateValue < new Date(question.validations.minDate)) {
                                errorElement.textContent = `Date must be after ${question.validations.minDate}`;
                                errorElement.style.display = 'block';
                                inputElement.classList.add('input-error');
                                isValid = false;
                            }
                            if (question.validations.maxDate && dateValue > new Date(question.validations.maxDate)) {
                                errorElement.textContent = `Date must be before ${question.validations.maxDate}`;
                                errorElement.style.display = 'block';
                                inputElement.classList.add('input-error');
                                isValid = false;
                            }
                            break;
                    }
                }
                break;
        }
    });

    if (isValid) {
        alert('Form submitted successfully!');
    }
}

function toggleModifyForm() {
    const previewSection = document.getElementById('previewSection');
    const submitButton = document.querySelector('.submit-btn');
    const isModifyView = previewSection.classList.contains('modify-mode');
    
    if (isModifyView) {
        // Hide modify view
        hideModifyView();
        // Show submit button again
        submitButton.style.display = 'block';
    } else {
        // Hide regular preview if it's showing
        if (previewSection.style.display === 'block') {
            previewSection.style.display = 'none';
        }
        // Show modify view
        previewSection.style.display = 'block';
        previewSection.classList.add('modify-mode');
        // Hide submit button
        submitButton.style.display = 'none';
        renderModifyView();
    }
}

function hideModifyView() {
    const previewSection = document.getElementById('previewSection');
    previewSection.style.display = 'none';
    previewSection.classList.remove('modify-mode');
}

function renderModifyView() {
    const previewForm = document.getElementById('previewForm');
    previewForm.innerHTML = '';
    
    // Update the title
    document.querySelector('#previewSection h2').textContent = 'Modify Form';

    formQuestions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'preview-question modify-question';
        
        // Create edit controls
        const controls = document.createElement('div');
        controls.className = 'question-controls';
        
        // Edit input
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.value = question.questionText;
        editInput.className = 'edit-question-input';
        editInput.onchange = (e) => updateQuestionText(index, e.target.value);
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Remove';
        deleteBtn.className = 'btn danger delete-btn';
        deleteBtn.onclick = () => deleteQuestion(index);
        
        controls.appendChild(editInput);
        controls.appendChild(deleteBtn);
        questionDiv.appendChild(controls);

        // Add the original question preview below the controls
        const previewDiv = document.createElement('div');
        previewDiv.className = 'question-preview';
        
        let input;
        switch (question.questionType) {
            case 'text':
                input = `<input type="text" disabled placeholder="Text input">`;
                break;
            case 'radio':
                input = `<div class="radio-group">` + 
                    question.options.map(option => `
                        <label class="radio-inline">
                            <input type="radio" disabled>
                            ${option}
                        </label>
                    `).join('') + `</div>`;
                break;
            case 'checkbox':
                input = `<div class="checkbox-group">` + 
                    question.options.map(option => `
                        <label class="checkbox-inline">
                            <input type="checkbox" disabled>
                            ${option}
                        </label>
                    `).join('') + `</div>`;
                break;
            case 'date':
                input = `<input type="date" disabled>`;
                break;
            case 'number':
                input = `<input type="number" disabled>`;
                break;
        }
        
        previewDiv.innerHTML = input;
        questionDiv.appendChild(previewDiv);
        previewForm.appendChild(questionDiv);
    });
}

function updateQuestionText(index, newText) {
    formQuestions[index].questionText = newText;
}

function deleteQuestion(index) {
    if (confirm('Are you sure you want to delete this question?')) {
        formQuestions.splice(index, 1);
        renderModifyView();
    }
}

