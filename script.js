// these are the selectors for different divs
const addbtn = document.querySelector(".add") ;
const removebtn = document.querySelector(".remove");
let modalele = document.querySelector(".modal");
let mainele = document.querySelector(".main") ;
let textarea = document.querySelector(".textarea");
let allprioritycolors = document.querySelectorAll(".priority-color"); 
const toolboxPriority = document.querySelectorAll(".toolbox .priority .color");
const submitBtn = document.getElementById("submitBtn");
// we need to change local storage for => new tickets , priority changes , task edit(text) , removing tickets
var allticketsArr = [] ;
let modalprioritycolor = "black";
let addflag = true ;
let removeflag = false ;
// lets update data when the page is reloaded
if(localStorage.getItem("jira-tickets")){
    // retrieve and display data
    allticketsArr = JSON.parse(localStorage.getItem("jira-tickets")) ;
    allticketsArr.forEach((ticketobj , idx) =>{
        generateTicket(ticketobj.text , ticketobj.colortag , ticketobj.id) ;
    })
}
// this is functionality of add button
addbtn.addEventListener("click" , e =>{
    // display modal
    if(addflag){
        modalele.style.display = "flex" ;
    }else{
        modalele.style.display = "none" ;
    }
    addflag = !addflag ;
});
removebtn.addEventListener("click" , e => {
    removeflag = !removeflag ;
    if(removeflag){
        removebtn.innerText = "✔" ;
    }else{
        removebtn.innerText = "x" ;
    }
});
submitBtn.addEventListener("click" , (e)=>{
    generateTicket(textarea.value , modalprioritycolor);
    modalele.style.display = "none" ;
    addflag = false ;
    textarea.value = "" ;
})
// listener for priority color setting
allprioritycolors.forEach((colorelement , idx) =>{
    colorelement.addEventListener("click" , e=>{
        allprioritycolors.forEach((colorele , idx) =>{
            colorele.classList.remove("border");
        })
        colorelement.classList.add("border");
        const color = colorelement.classList[1] ;
        modalprioritycolor = color ;
    })
})
for(let i = 0 ; i < toolboxPriority.length ;i++){
    toolboxPriority[i].addEventListener("click" , e =>{
        const currentColor = toolboxPriority[i].classList[1] ;
        let filteredtickets = allticketsArr.filter((ticketobj , idx) =>{
            return currentColor ===  ticketobj.colortag ;
        })
        // remove all tickets
        const alltickets = document.querySelectorAll(".ticket");
        for(let i = 0 ; i < alltickets.length ; i++){
            alltickets[i].remove() ;
        }
        // display filtered tickets
        filteredtickets.forEach((ticketobj ,idx ) =>{
            generateTicket(ticketobj.text , ticketobj.colortag , ticketobj.id) ;
        })
        // on double click display all the tickets
        toolboxPriority[i].addEventListener("dblclick" , e =>{
            // remove all tickets
            const alltickets = document.querySelectorAll(".ticket");
            for(let i = 0 ; i < alltickets.length ; i++){
                alltickets[i].remove() ;
            }
            // display all the tickets
            allticketsArr.forEach((ticketobj , idx) =>{
                generateTicket(ticketobj.text , ticketobj.colortag , ticketobj.id);
            })
        })
    });
}
// This function generates tickets as required
function generateTicket(text , colortag , ticketid){
    const id = ticketid || shortid() ;
    let newticket = document.createElement("div") ;
    newticket.classList.add("ticket");
    newticket.innerHTML = `
    <div class="colortag ${colortag}"></div>
    <div class="id" >#${id}</div>
    <div class="taskarea">${text}</div>  
    <div class="ticket-lock">
        <i class="fa-solid fa-lock closed lock"></i>
        <!-- <i class="fa-solid fa-lock-open open lock"></i> -->
    </div>
    `
    // create object of current ticket and add it to allticketsArr 
    if(!ticketid){ 
        allticketsArr.push({text , colortag , id});
        localStorage.setItem("jira-tickets" , JSON.stringify(allticketsArr)) ;
    }
    mainele.appendChild(newticket);
    
    handleRemoval(newticket , id) ;
    handlelock(newticket , id);
    handlePriorityChange(newticket , id);
}
function handleRemoval(ticket , id){
    ticket.addEventListener("click" , e=>{
        if(!removeflag) return ;
        ticket.remove();
        const ticketidx = getindexofticket(id) ;
        allticketsArr.splice(ticketidx , 1) ;
        localStorage.setItem("jira-tickets" , JSON.stringify(allticketsArr));
    }) 
}
function handlelock(ticket , id){
    const ticketidx = getindexofticket(id);
    const lock = ticket.querySelector(".lock") ;
    const taskarea = ticket.querySelector(".taskarea");
    lock.addEventListener("click" , e => {
        if(lock.classList.contains("fa-lock")){
            lock.classList.remove("fa-lock");
            lock.classList.add("fa-lock-open");
            taskarea.setAttribute("contenteditable" , "true");
        }else{
            lock.classList.remove("fa-lock-open");
            lock.classList.add("fa-lock");
            taskarea.setAttribute("contenteditable" , "false");
        }
        allticketsArr[ticketidx].text = taskarea.innerText ;
        // modify data in local storage
        localStorage.setItem("jira-tickets" , JSON.stringify(allticketsArr));
    });
}
function handlePriorityChange(ticket , id){
    const ticketidx = getindexofticket(id) ; // this is for local storage
    const colors = ["blue" , "coral" , "black" , "violet"];
    const colortag = ticket.querySelector(".colortag");
    colortag.addEventListener("click" , e=>{
        const currentColor = colortag.classList[1];
        let idx = (colors.indexOf(currentColor));
        idx = (idx + 1)% colors.length ;
        colortag.classList.remove(currentColor);
        colortag.classList.add(colors[idx]);
        // modify data in local storage
        allticketsArr[ticketidx].colortag = colors[idx];
        localStorage.setItem("jira-tickets" , JSON.stringify(allticketsArr));
    }) 
}
function getindexofticket(id){
    let ticketidx = allticketsArr.findIndex((ticketobj) =>{
        return ticketobj.id === id ;
    })
    return ticketidx ;
}
