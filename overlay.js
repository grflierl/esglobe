function overlay(id,idlist){
    if(!id){
	parent.document.getElementById("overlay").innerHTML="";
	return;
    };
//    console.log(id);
//    console.log(parent.document.getElementById("overlay"));
//    console.log(document.getElementById(id));
    parent.document.getElementById("overlay").innerHTML=
        document.getElementById(id).innerHTML;
    ret=[];
    for (j=0;j<idlist.length;j++){
	ret.push(parent.document.getElementById(idlist[j]));
    }
    return ret;
}
  
