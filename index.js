let mainTrigger = document.getElementsByClassName("triggerx");
let secondaryTriggers = document.getElementsByClassName("triggerx2");

[...mainTrigger, ...secondaryTriggers].forEach(el=>{
    el.addEventListener("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        console.log("[CLICKED]; Is 'triggerx'?",el.classList.contains("triggerx"));
        startx();
    })
});
let allLinks = document.getElementsByTagName('a');
// console.log([...allLinks]);
// let footerLinks = document.querySelectorAll(".e1y6mxju10 a");
// console.log([...footerLinks]);
// [...allLinks, ...footerLinks].forEach(link=>{
[...allLinks].forEach(link=>{
    try {
        link.addEventListener("click", function(e){
            let isTriggerx = e.target.classList.contains("triggerx");
            let isTriggerx2 = e.target.classList.contains("triggerx2");
            if(!(isTriggerx || isTriggerx2)){
                console.log(`${isTriggerx} && ${isTriggerx2}`);
                e.preventDefault();
                e.stopPropagation();       
            }
        })
    } catch (error) {
        console.log(error);   
    }
})
