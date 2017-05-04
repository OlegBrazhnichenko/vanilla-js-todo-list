const ENTER_CODE = 13;
const ESC_CODE = 27;

window.qs = function (selector, scope) {
    return (scope || document).querySelector(selector);
};

Object.prototype.hasClass  = function(className){
    if(!(this.className)){
        console.error(this+" is not an DOM element");
    }else{
        return this.classList.value.indexOf(className) >= 0;
    }
};

Object.prototype.removeClass = function(className){
    if(this.hasClass(className)){
        var reg = new RegExp('(\\s|^)'+className+'(\\s|$)');
        this.className=this.className.replace(reg,'');
    }
};

Object.prototype.addClass = function(className){
    if(!(this.hasClass(className))){
        this.className+= " " + className;
    }
};

//=========================================== VIEW ==============================================

var defaultTemplate
    =   '<div class="task {{CheckComplete}}" >'
    +       '<div class="view">'
    +          '<input type="checkbox" id="input{{Id}}" {{CheckComplete}} />'
    +          '<label for="input{{Id}}" onclick="handleCheckbox(event)"></label>'
    +          '<div class="taskName" id="task{{Id}}" ondblclick="startEdit(event, {{Id}})">{{Task}}</div>'
    +          '<div class="delete" onclick="deleteTask({{Id}})"><img src="../images/delete_cross.png" alt="delete"></div>'
    +       '</div>'
    +       '<input type="text" class="edit" id="edit{{Id}}" onkeydown="editHandler(event, {{Id}})" onfocusout="cancelEdit(event, {{Id}})" >'
    +   '</div>';


var htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#x27;',
    '`': '&#x60;'
};

var escapeHtmlChar = function (chr) {
    return htmlEscapes[chr];
};

var reUnescapedHtml = /[&<>"'`]/g;
var reHasUnescapedHtml = new RegExp(reUnescapedHtml.source);

var escape = function (string) {
    return (string && reHasUnescapedHtml.test(string))
        ? string.replace(reUnescapedHtml, escapeHtmlChar)
        : string;
};


function createView(data){
    var view = document.createElement('div');
    var params = ["Id","Task","CheckComplete"];
    var template = defaultTemplate;
    for(var k = 0; k < params.length; k++){
        template = template.replace(new RegExp("{{"+params[k]+"}}", "g"), escape(data[params[k]] || ""));
    }

    view.innerHTML = template;

    return view.firstChild;
}



//====================================== CONTROLLER ==================================================

window.onload = function(){

    getTasks();

    var taskInput = qs("#task");
    taskInput.addEventListener("keydown",function(event){
        if (taskInput.value.trim() !== "" && event.keyCode === ENTER_CODE){
            createNewTask(taskInput.value.trim());
            taskInput.value = "";
        }
    });
};

function handleCheckbox(event){
    var task = event.target.parentNode.parentNode;
    completeTask(task);
}

function completeTask(task){
    task.hasClass("checked") ? task.removeClass("checked") : task.addClass("checked");
    var id = event.target.getAttribute('for').replace("input","");
    var text = qs('#task'+id).innerHTML;
    var checkComplete = qs('#input'+id).checked;
    var reqData = {action : "update", id : id, task : text, checkComplete : !checkComplete};
    makeAjax(reqData);
}

function getTasks(){
    var reqData = {action : "getAll"};
    makeAjax(reqData, showTasks);
}

var showTasks = function showTasks(response){
    response = response ? response : [];
    console.log(response);

    for(var i = 0; i < response.length; i++){
        qs("#taskList").appendChild(createView(response[i]));
    }
};

function createNewTask(task){
    var reqData = {action : "create", task : task};
    makeAjax(reqData, showTasks);
}

function deleteTask(id){
    var reqData = {action : "delete", id : id};
    makeAjax(reqData, function(){
        var list = document.getElementById("taskList");
        list.removeChild(document.getElementById("task"+id).parentNode.parentNode);
    })
}


function startEdit(event, id){
    var elem = event.target;
    var editElem = qs("#edit"+id);

    elem.parentNode.style.display = "none";
    editElem.style.display = "block";

    editElem.focus();

    editElem.value = elem.innerHTML;
}

function editHandler(event, id){
    switch (event.keyCode){
        case ENTER_CODE :
            confirmEdit(event, id);
            break;
        case ESC_CODE :
            cancelEdit(event, id);
            break;
    }
}

function cancelEdit(event, id){
    endEdit(event, id);
}

function endEdit(event, id){
    var elem = qs("#task"+id);
    var editElem = qs("#edit"+id);

    editElem.style.display = "none";
    elem.parentNode.style.display = "block";
}

function confirmEdit(event, id){
    var newTask = qs("#edit"+id).value;
    var reqData = {action : "update",id : id, task : newTask};
    makeAjax(reqData, function(response){
        qs("#task"+id).innerHTML = newTask;
        endEdit(event, id);
    });
}


//===========================================  MODEL ===========================================
function makeAjax(reqData, callback){
    reqData.checkComplete = reqData.checkComplete ? "checked" : "";
    reqData.id = parseInt(reqData.id);
    reqData = JSON.stringify(reqData);
    console.log(reqData);
    send("POST","/post", reqData, callback);
}

function send(method, url, data, callback ) {
    if(!data){
        data = null
    }
    var request = new XMLHttpRequest();
    request.open(method, url, true);
    request.setRequestHeader("Content-type", "application/json");
    request.onreadystatechange = function () {
        if(request.readyState === XMLHttpRequest.DONE && request.status === 200) {
            if(callback !== undefined){
                callback(JSON.parse(request.responseText));
            }
        }
    };

    request.send(data)
}