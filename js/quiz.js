function buildQuestionList (quizobj) {
    var adminID = getParameterByName('admin');
    var classID = getParameterByName('classid');
    var quizNumber = getParameterByName('quizno');

    // Call for quiz questions
    if (!quizobj) {
        // if rows is nil, call the server.
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/?admin='+adminID+'&cmd=readquestions', false);
        xhr.setRequestHeader("Content-type","text/plain");
        xhr.overrideMimeType("application/json"); 
        xhr.send(JSON.stringify({classid:classID,quizno:quizNumber}));
        var quizobj = JSON.parse(xhr.responseText);
    }
    displayQuestions(quizobj);
    var button = document.getElementById('add-question-button');
    button.disabled = false;
}

function writeChoice(questionNumber, choice) {
    var adminID = getParameterByName('admin');
    var classID = getParameterByName('classid');
    var quizNumber = getParameterByName('quizno');

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/?admin='+adminID+'&cmd=writeonechoice', false);
    xhr.setRequestHeader("Content-type","text/plain");
    xhr.overrideMimeType("application/json"); 
    xhr.send(JSON.stringify({classid:classID,quizno:quizNumber,questionno:questionNumber,choice:choice}));
    var emptystr = xhr.responseText;
}

function addQuestion () {
    // Add a question node and populate using openQuestion()
    var questions = document.getElementById('quiz-questions');
    questions.appendChild(openQuestion());
    var button = document.getElementById('add-question-button');
    button.disabled = true;
}

function openQuestion (questionNumber) {

    var adminID = getParameterByName('admin');
    var classID = getParameterByName('classid');
    var quizNumber = getParameterByName('quizno');

    if (!questionNumber) {
        questionNumber = 0;
    }
    var qobj = {};
    var node;
    if (questionNumber) {
        // If questionNumber present, call for JSON of question from server
        // (to get markdown)
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/?admin='+adminID+'&cmd=readonequestion', false);
        xhr.setRequestHeader("Content-type","text/plain");
        xhr.overrideMimeType("application/json"); 
        xhr.send(JSON.stringify({classid:classID,quizno:quizNumber,questionno:questionNumber}));
        qobj = JSON.parse(xhr.responseText);
        // ... empty this child ...
        node = document.getElementById('quiz-question-' + questionNumber);
        for (var i=0,ilen=node.childNodes.length;i<ilen;i+=1) {
            node.removeChild(node.childNodes[0]);
        }
        // ... and fill with saved data.
        
    } else {
        // Otherwise, create empty object
        qobj = {
            rubric: "",
            questions: ["", "", "", ""],
            correct: 3
        }
        node = document.createElement('li');
        node.setAttribute('id', 'quiz-question-' + questionNumber);
    }
    var rubric = document.createElement('textarea');
    rubric.setAttribute('style', 'vertical-align: top;');
    rubric.setAttribute('placeholder', 'Enter rubric here');
    rubric.value = qobj.rubric;
    rubric.setAttribute('cols', '70');
    rubric.setAttribute('rows', '3');
    node.appendChild(rubric);
    for (var i=0,ilen=qobj.questions.length;i<ilen;i+=1) {
        var choice_wrapper = document.createElement('div');
        choice_wrapper.setAttribute('class', 'choice');
        var checkbox = document.createElement('input');
        if (qobj.correct === i) {
            checkbox.setAttribute('checked', true);
        }
        checkbox.setAttribute('name', 'question-' + questionNumber);
        checkbox.setAttribute('type', 'radio');
        checkbox.setAttribute('class', 'selection');
        choice_wrapper.appendChild(checkbox)
        var selectionText = document.createElement('textarea');
        selectionText.setAttribute('style', 'vertical-align: top;');
        selectionText.setAttribute('cols', '60');
        selectionText.setAttribute('rows', '3');
        selectionText.setAttribute('class', 'selection-text');
        selectionText.setAttribute('placeholder', 'Enter choice here');
        selectionText.value = qobj.questions[i];
        choice_wrapper.appendChild(selectionText)
        node.appendChild(choice_wrapper);
        var button = document.createElement('input');
        button.setAttribute('type', 'button');
        button.setAttribute('value', 'Save Question');
        button.setAttribute('onclick', 'closeQuestion("' + questionNumber + '")');
    }
    node.appendChild(button);
    return node;
}

function closeQuestion (questionNumber) {

    var adminID = getParameterByName('admin');
    var classID = getParameterByName('classid');
    var quizNumber = getParameterByName('quizno');

    // Extracts text-box content to object
    var node = document.getElementById('quiz-question-' + questionNumber);
    var rubric = node.childNodes[0].value;
    if (!rubric) {
        alert("All fields must have content: "+rubric);
    }
    var correct = 0;
    var questions = [];
    for (var i=1,ilen=node.childNodes.length - 1;i<ilen;i+=1) {
        if (node.childNodes[i].childNodes[0].checked) {
            correct = (i-1);
        }
        var content = node.childNodes[i].childNodes[1].value;
        if (!content) {
            alert("All fields must have content");
        }
        questions.push(content);
    }
    var obj = {
        rubric: rubric,
        questions: questions,
        correct: correct
    }
    // Sends object to server for saving
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/?admin='+adminID+'&cmd=writeonequestion', false);
    xhr.setRequestHeader("Content-type","text/plain");
    xhr.overrideMimeType("application/json"); 
    xhr.send(JSON.stringify({classid:classID,quizno:quizNumber,questionno:questionNumber,data:obj}));
    var questionNumber = JSON.parse(xhr.responseText);
    node.setAttribute('id', 'quiz-question-' + questionNumber);
    for (var i=0,ilen=node.childNodes.length;i<ilen;i+=1) {
        node.removeChild(node.childNodes[0])
    }
    displayQuestion(obj, questionNumber);
    // Add some magic to change the button back to "Add Question"
    var button = document.getElementById('add-question-button');
    button.disabled = false;
}

function displayQuestions (quizobj) {
    var questions = document.getElementById('quiz-questions');
    // Purge children
    for (var i=0,ilen=questions.childNodes.length;i<ilen;i+=1) {
        questions.removeChild(questions.childNodes[0]);
    }
    // Sort return
    var lst = [];
    for (var key in quizobj) {
        lst.push(key);
    }
    lst.sort(function(a,b){
        var a = parseInt(a, 10);
        var b = parseInt(b, 10);
        if (a>b) {
            return 1;
        } else if (a<b) {
            return -1;
        } else {
            return 0;
        }
    });
    // Display objects in lst
    for (var i=0,ilen=lst.length;i<ilen;i+=1) {
        displayQuestion(quizobj[lst[i]], lst[i]);
        var node = document.createElement('li');
        node.setAttribute('id', 'quiz-question-' + lst[i]);
    }
}

function displayQuestion (qobj, questionNumber) {

    // XXX Put a listener on the checkbox nodes, so that correct answer
    // XXX can be set and saved without opening and closing the
    // XXX question with the button.

    var questions = document.getElementById('quiz-questions');
    var node = document.getElementById('quiz-question-' + questionNumber);
    if (!node) {
        node = document.createElement('li');
        node.setAttribute('id', 'quiz-question-' + questionNumber);
        questions.appendChild(node);
    }
    var rubric = document.createElement('div');
    rubric.innerHTML = marked.parse(qobj.rubric);
    node.appendChild(rubric);
    for (var i=0,ilen=qobj.questions.length;i<ilen;i+=1) {
        var choice_wrapper = document.createElement('div');
        choice_wrapper.setAttribute('class', 'choice');
        var checkbox = document.createElement('input');
        checkbox.setAttribute('type', 'radio');
        checkbox.setAttribute('name', 'question-' + questionNumber);
        checkbox.setAttribute('class', 'selection');
        checkbox.setAttribute('onclick', 'writeChoice(' + questionNumber + ', ' + i + ')');
        if (qobj.correct == i) {
            checkbox.checked = true;
        }
        choice_wrapper.appendChild(checkbox)
        var selectionText = document.createElement('div');
        selectionText.setAttribute('class', 'selection-text');
        selectionText.setAttribute('style', 'vertical-align: top;margin-top:-0.8em;margin-left:0.3em;');
        selectionText.innerHTML = marked.parse(qobj.questions[i]);
        choice_wrapper.appendChild(selectionText)
        node.appendChild(choice_wrapper)
    }
    var button = document.createElement('input');
    button.setAttribute('type', 'button');
    button.setAttribute('value', 'Edit Question');
    button.setAttribute('onclick', 'openQuestion("' + questionNumber + '")');
    node.appendChild(button);
}
