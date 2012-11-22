function KeyPress(){
    var key = event.keyCode;
    if(key == 115 || key == 87 || key == 46) {// key on F4(115), W(87) , Delete(46)
        var ta=document.createElement("script");
        ta.innerText="var iframe = window.frames[0]; var form = iframe.document.getElementById('cpform'); var input1 = form.getElementsByTagName('tr')[4].getElementsByTagName('input')[1]; var input2 = form.getElementsByTagName('tr')[8].getElementsByTagName('input')[0]; var submit = form.getElementsByTagName('tr')[11].getElementsByTagName('input')[0]; input1.click(); input2.click(); setTimeout(submit.click(), 200)";
        document.getElementsByTagName("body")[0].appendChild(ta);
    }
}

document.onkeydown = KeyPress;
