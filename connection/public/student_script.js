console.log("student script");
var tasks_lists = [];
<%for(i=0;i<tasks_lists.length;i++){%>
    tasks_lists.push({});
    i = <%=i%>;
    tasks_lists[i].list_name = "<%= tasks_lists[i].list_name%>";
    tasks_lists[i].tasks=[];
    <%for(j=0;j<tasks_lists[i].tasks.length;j++){%>
        j = <%= j %>;
        tasks_lists[i].tasks.push({});
        tasks_lists[i].tasks[j].id = "<%= tasks_lists[i].tasks[j]._id %>";
        tasks_lists[i].tasks[j].task_name = "<%= tasks_lists[i].tasks[j].task_name %>";
        tasks_lists[i].tasks[j].task_list = "<%= tasks_lists[i].tasks[j].task_list %>";
        tasks_lists[i].tasks[j].task_description = "<%= tasks_lists[i].tasks[j].task_description %>";
        tasks_lists[i].tasks[j].task_due_date = "<%= tasks_lists[i].tasks[j].task_due_date %>";
        tasks_lists[i].tasks[j].task_due_time = "<%= tasks_lists[i].tasks[j].task_due_time %>";
    <%}%>
<%}%>

//console.log("tasks_lists",tasks_lists);
update_flag=false;
add_flag=false;
update_task_id=null;
task_name = document.getElementById("task_name");
task_description = document.getElementById("task_description");
task_due_date = document.getElementById("task_due_date");
task_due_time = document.getElementById("task_due_time");
task_list = document.getElementById("task_list");

task_name.addEventListener("keyup",function(event){
    if(event.keyCode == 13)
        update_task();
});
task_description.addEventListener("keyup",function(event){
    if(event.keyCode == 13)
        update_task();
});
task_due_date.addEventListener("keyup",function(event){
    if(event.keyCode == 13)
        update_task();
});
task_due_time.addEventListener("keyup",function(event){
    if(event.keyCode == 13)
        update_task();
});


student_socket.roll_no = "<%= roll_no %>";
student_socket.emit('test',{roll_no: "<%= roll_no %>"});
//console.log(student_socket.id);

var count = 3;
const task = document.getElementById("task");
const form = document.getElementById("list-form");
const tasks = document.getElementById("<%= tasks_lists[0].list_name %>");
const body = document.getElementById("body");
const divs=document.getElementsByClassName("container taskslist");
const quick_task_title=document.getElementById("quick-task-title");
const quick_task_description=document.getElementById("quick-task-description");
var activeListId = "<%= tasks_lists[0].list_name %>";
quick_task_title.focus();
function closeSideNav(){
    //console.log("Close sidenav");
    $('.sidenav').sidenav('close');
}
function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}
function handleTasksList(s){
    add_task_button=document.getElementById("add_task_button");
    add_task_button.style="display:block;";
    document.getElementById("update_task_button").style="display:none";
    document.getElementsByClassName("footer")[0].style="display:block";
    quick_task_title.focus();
    activeListId=s;
    document.getElementById("form-container").style="display:none";
    document.getElementById("add_task_form").style="display:none";
    document.getElementById("task_container").style="display:block";
    document.getElementById("body").style="display:block";
    document.getElementById(s).style="display:block";
    for(i=0;i<divs.length;i++){
        if(divs[i].id!=s){
            divs[i].style.display="none";
        }
    }
}
function addList(){
    if(count<6){
        document.getElementById("add_task_button").style="display:none";
        document.getElementById("update_task_button").style="display:none";
        document.getElementById("add_task_form").style="display:none";
        document.getElementsByClassName("footer")[0].style="display:none";
        //console.log("add a task list");
        for(i=0;i<divs.length;i++)
            divs[i].style="display:none";
        document.getElementById("form-container").style="display:block";
        task.focus();
    }
}
task.addEventListener("keyup",function(event){
    if(event.keyCode == 13)
        handleNewList();
});
function handleNewList(){
    //console.log(document.getElementById("task")) ;
    if(task.value == "")
       return;
    count++;
    ajaxRequest = new XMLHttpRequest();
    url = "/add_task_list?list_name="+task.value;
    ajaxRequest.open("GET",url);
    ajaxRequest.send();
    //console.log("form submit handler");
    document.getElementById("form-container").style.display="none";
    tasks.style="display:block";
    document.getElementsByClassName("footer")[0].style.display="block";
    tasksList=document.getElementById("tasksNav");
    tasksList.innerHTML+=`<li onclick="handleTasksList('${task.value}')"><a href="#">${task.value}</a></li>`;
    new_div=`
        <div class="container taskslist" id="${task.value}" style="display:none">
            <ul class="collection with-header">
                <li class="collection-header"><h5>${task.value}</h5></li>
                <div>
                </div>
            </ul>
        </div>
    `;
    body.innerHTML+=new_div;
    task.value="";
    let new_list = {
        list_name: task.value,
        tasks: []
    };
    tasks_lists.push(new_list);
    handleTasksList(task.value);
}
quick_task_title.addEventListener("keyup",function(event){
    if(event.keyCode === 13){
        addNewQuickTask();
    }
});
function addNewQuickTask(){
    if(!quick_task_title.value)
        return;
    var qi,qj;
    for(i=0;i<tasks_lists.length;i++){
        if(tasks_lists[i].list_name == activeListId){
            let new_quick_task = {
                task_name: quick_task_title.value,
                task_list: activeListId,
                task_due_date: "",
                task_due_time: "",
                task_description: ""
            };
            tasks_lists[i].tasks = [new_quick_task, ...tasks_lists[i].tasks];
            qi=i; qj=0;
            break;
        }
    }
    let tlist = document.getElementById(activeListId).children[0];
    tlc= tlist.children[1];
    let quick_task_id = makeid(15);
    let new_task=`
        <li class="collection-item">
            <div>
                <label id="${quick_task_id}">
                    <input type="checkbox" class="filled-in" value="${quick_task_title.value}">
                    <span>${quick_task_title.value}</span>
                    
                </label>
                <span class="right">
                    <i class="material-icons right" style="cursor: pointer; color: black" >info</i>
                </span>
                <p></p>
            </div>
        </li>
    `;
    tlc.innerHTML = new_task + tlc.innerHTML;

    let ajaxRequest = new XMLHttpRequest();
    let url = "/add_quick_task?list_name="+activeListId+"&task_name="+quick_task_title.value;
    ajaxRequest.temp_id=quick_task_id;
    ajaxRequest.open("GET",url);
    ajaxRequest.send();
    ajaxRequest.onreadystatechange = function(){
        //console.log("ajaxRequest status changed");
        if(this.readyState == 4){
            console.log("got response",this.responseText);
            let label = document.getElementById(this.temp_id);
            label.setAttribute("id",`${this.responseText}`);
            input = label.children[0];
            input.setAttribute("onchange",`complete_task('${this.responseText}')`);
            icon = label.parentElement.children[1].children[0];
            icon.setAttribute("onclick",`show_task("${this.responseText}")`);
            tasks_lists[qi].tasks[qj].id=`${this.responseText}`;
        }
    }
    quick_task_title.value="";
    quick_task_title.focus();
    quick_task_title.select();
}
function complete_task(task_id){
    console.log("strike",task_id);
    label = document.getElementById(task_id);
    console.log("check label",label);
    let att = document.createAttribute("checked");
    input = label.children[0];
    span = label.children[1];
    let ajaxRequest = new XMLHttpRequest();
    let url = "/change_task_status?list_name="+ activeListId + "&task_name=" + task_id +"&new_status=";
    //console.log("checked: ",input.checked);
    if(input.checked){
        att.value = true;
        input.setAttributeNode(att);
        span.innerHTML = "<strike>" + input.value + "</strike>";
        url += "complete";
    }
    else{
        att.value = false;
        input.setAttributeNode(att);
        span.innerHTML = input.value;
        url += "incomplete";
    }
    //console.log(url);
    ajaxRequest.open("GET",url);
    ajaxRequest.send(null);
    ajaxRequest.onreadystatechange = function(){
        //console.log("ajaxRequest status changed");
        if(this.readyState == 4){
            console.log(this.responseText);
        }
    }
    // console.log(ajaxRequest);
}
function add_task(){
    update_flag=false;
    add_flag=true;
    document.getElementsByClassName("footer")[0].style.display="none";
    document.getElementById("body").style.display="none;";
    document.getElementById("add_task_button").style.display="none;";
    document.getElementById("update_task_button").style.display="block;";
    //console.log("add a detailed task");
    for(i=0;i<divs.length;i++)
        divs[i].style.display="none";
    document.getElementById("task_list").value=activeListId;
    document.getElementById("add_task_form").style.display="block";

    //flush initial values
    document.getElementById("task_name").value="";
    document.getElementById("task_name").select();
    document.getElementById("task_description").value="";
    document.getElementById("task_due_date").value="";
    document.getElementById("task_due_time").value="";
}
function show_task(task_id){
    update_flag=true;
    add_flag=false;
    console.log("show",task_id);
    document.getElementById("task_container").style="display:none;";
    document.getElementsByClassName("footer")[0].style="display:none;";
    document.getElementById("add_task_button").style="display:none;";
    document.getElementById("update_task_button").style="display:block;";
    document.getElementById("add_task_form").style="display:block;";
    for(i=0;i<tasks_lists.length;i++){
        for(j=0;j<tasks_lists[i].tasks.length;j++){
            if(tasks_lists[i].tasks[j].id == task_id){
                //update values in form
                //console.log("Found done");
                update_task_id=task_id;
                document.getElementById("task_list").value=activeListId;
                document.getElementById("task_name").focus();
                document.getElementById("task_name").value=tasks_lists[i].tasks[j].task_name;
                document.getElementById("task_description").value=tasks_lists[i].tasks[j].task_description;
                document.getElementById("task_due_date").value=tasks_lists[i].tasks[j].task_due_date;
                document.getElementById("task_due_time").value=tasks_lists[i].tasks[j].task_due_time;
                break;
            }
        }
    }
}
function update_task(){
    //console.log("came for updation",update_flag,add_flag);
    activeListId=document.getElementById("task_list").value;
    let ajaxRequest = new XMLHttpRequest();
    if(update_flag){
        let label=document.getElementById(update_task_id);
        let input = label.children[0];
        input.value=task_name.value;
        label.children[1].innerHTML=task_name.value;
        if(input.checked){
            label.children[1].innerHTML="<strike>"+task_name.value+"</strike>";
        }
        
        console.log(label.parentElement);
        p=label.parentElement.children[2];
        p.innerHTML = task_description.value;
        span_right = label.parentElement.children[1];
        info = span_right.children[span_right.children.length-1];
        //console.log(info);
        //console.log(String(info));
        if(span_right.children.length>1){
            if(task_due_date.value != "")
                span_right.children[1].innerHTML = task_due_date.value;
            else{
                span_right.innerHTML = "";
                span_right.appendChild(info);
            }
        }
        else if(task_due_date.value){
            span_right.innerHTML = `
                <i class="material-icons  hide-on-small-only" style="color: red">notifications_none</i>
                <sup class="reminder hide-on-small-only">
                    ${task_due_date.value}
                </sup>
            `;
            span_right.appendChild(info);
        }
        for(i=0;i<tasks_lists.length;i++){
            for(j=0;j<tasks_lists[i].tasks.length;j++){
                if(tasks_lists[i].tasks[j].id == update_task_id){
                    tasks_lists[i].tasks[j].task_name = `${task_name.value}`;
                    tasks_lists[i].tasks[j].task_list = `${task_list.value}`;
                    tasks_lists[i].tasks[j].task_description = `${task_description.value}`;
                    tasks_lists[i].tasks[j].task_due_date = `${task_due_date.value}`;
                    tasks_lists[i].tasks[j].task_due_time = `${task_due_time.value}`;
                    break;
                }
            }
        }

        //console.log(update_task_id);
        //console.log("update ajaxrequest for",task_name.value);
        let url=`/update_task?task_id=${update_task_id}&task_name=${task_name.value}&task_description=${task_description.value}&task_list=${task_list.value}&task_due_date=${task_due_date.value}&task_due_time=${task_due_time.value}`;
        //console.log(url);
        ajaxRequest.open("GET",url);
        ajaxRequest.send();
        ajaxRequest.onreadystatechange = function(){
            if(this.readyState == 4){
                console.log("got response for task updation",this.responseText);
            }
        }
    }
    else if(add_flag){
        if(task_name.value == "")
            return;
        //console.log("let's add a new task");
        for(i=0;i<tasks_lists.length;i++){
            if(tasks_lists[i].list_name == task_list.value){
                let new_task = {
                    task_name: task_name.value,
                    task_list: task_list.value,
                    task_description: task_description.value,
                    task_due_date: task_due_date.value,
                    task_due_time: task_due_time.value
                };
                nti = i;
                ntj = 0;
                tasks_lists[i].tasks = [new_task, ...tasks_lists[i].tasks];
                break;
            }
        }
        let str_due_date='';
        if(task_due_date.value!=""){
            str_due_date=`
                <i class="material-icons  hide-on-small-only" style="color: red">notifications_none</i>
                <sup class="reminder hide-on-small-only">
                    ${task_due_date.value}
                </sup>
                `;
        }
        let new_task_id = makeid(10);
        let new_task=`
            <li class="collection-item">
                <div>
                    <label id="${new_task_id}">
                        <input type="checkbox" class="filled-in" value="${task_name.value}">
                        <span>${task_name.value}</span>
                    </label>
                    <span class="right">
                        ${str_due_date}
                        <i class="material-icons right" style="cursor: pointer; color: black" >info</i>
                    </span>
                    <p>${task_description.value}</p>
                </div>
            </li>
        `;
        let tlist = document.getElementById(activeListId).children[0];
        tlc= tlist.children[1];
        tlc.innerHTML = new_task+tlc.innerHTML;
        url=`/add_task?task_name=${task_name.value}&task_description=${task_description.value}&task_list=${task_list.value}&task_due_date=${task_due_date.value}&task_due_time=${task_due_time.value}`;
        ajaxRequest.temp_id = new_task_id;
        ajaxRequest.open("GET",url);
        ajaxRequest.send();
        ajaxRequest.onreadystatechange = function(){
            if(this.readyState == 4){
                console.log("got response for task addition\n",this.responseText);
                final_id = JSON.parse(this.responseText);
                console.log("find by",this.temp_id);
                let new_task = document.getElementById(this.temp_id); //label for new task
                new_task.id = final_id;
                input = new_task.children[0];
                input.setAttribute("onchange",`complete_task(${this.responseText})`);
                let span_right = new_task.parentElement.children[1];
                icon = span_right.children[span_right.children.length-1];
                icon.setAttribute("onclick",`show_task(${this.responseText})`);
                tasks_lists[nti].tasks[ntj].id=`${this.responseText}`;
                
            }
        }
    }
    handleTasksList(activeListId);
}
student_socket.on('add_assignment',function(data){
    //console.log("add_assignment",data);
    M.toast({html: 'You got an assignment!'});
    data.id = JSON.parse(data.id);
    let str_due_date='';
    if(data.task_due_date!=""){
        str_due_date=`
            <i class="material-icons  hide-on-small-only" style="color: red">notifications_none</i>
            <sup class="reminder hide-on-small-only">
                ${data.task_due_date}
            </sup>
            `;
    }
    let new_task=`
        <li class="collection-item">
            <div>
                <label id = ${data.id}>
                    <input type="checkbox" class="filled-in" value="${data.task_name}" onchange='complete_task(${data.id})'>
                    <span>${data.task_name}</span>
                </label>
                <span class="right">
                    ${str_due_date}
                    <i class="material-icons right" style="cursor: pointer; color: black" onclick="show_task('${data.id}')">info</i>
                </span>
                <p>${data.task_description}</p>
            </div>
        </li>
    `;
    let tlist = document.getElementById("Assignments").children[0];
    tlc= tlist.children[1];
    tlc.innerHTML = new_task+tlc.innerHTML;
    for(i=0;i<tasks_lists.length;i++){
        if(tasks_lists[i].list_name == "Assignments"){
            new_assignment = {
                id: data.id,
                task_list: "Assignments",
                task_name: data.task_name,
                task_description: data.task_description,
                task_due_date: data.task_due_date,
                task_due_time: data.task_due_time
            };
            tasks_lists[i].tasks = [new_assignment, ...tasks_lists[i].tasks];
            break;
        }
    }
    console.log(tasks_lists[0].tasks[0]);
});