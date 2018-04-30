<!DOCTYPE html>
<html>
<head>
<script src="FileSaver.min.js"></script>
<script>
  var sph=parent.sph;

Color="red";
x0=0;
y0=0;
Linewidth=2;
Linestyle="Freehand";
Mousedown=false;
textmode=false;
textcontent='';
Font="sans-serif";
Fontsize="25";
Fontweight="";
Fontslant="";
Brushtype="Pencil";
Opacity=1;
Orient=true;
drawlist=[];
currentlist=[];
//onlineflag=sph.online != null;
xy0=[];

var canvas=null;
var ctx=null;
var canvas_copy=null;

var brushimg = new Image();
brushimg.src = 'http:brush2.png';

function getAjax(url, success) {
  var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new
  ActiveXObject('Microsoft.XMLHTTP'); 
  xhr.open('GET', url);
  xhr.onreadystatechange = function() {
    if (xhr.readyState>3 && xhr.status==200) success(xhr.responseText);
  }; 
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.send();
  return xhr;
}

function cloneCanvas(oldCanvas) {
    //create a new canvas
    var newCanvas = document.createElement('canvas');
    var context = newCanvas.getContext('2d');

    //set dimensions
    newCanvas.width = oldCanvas.width;
    newCanvas.height = oldCanvas.height;

    //apply the old canvas to the new one
    context.drawImage(oldCanvas, 0, 0);

    //return the new canvas
    return newCanvas;
}

function drawPencil(xp,yp,x,y){
    ctx.lineWidth=Linewidth;
    ctx.beginPath();
    ctx.moveTo(xp,yp);
    ctx.lineTo(x,y);
    ctx.stroke();
}

function drawFlatBrush(xp,yp,x,y){
    ctx.lineWidth=Linewidth;
    ctx.beginPath();
    ctx.moveTo(xp,yp);
    ctx.lineTo(x,y);
    ctx.moveTo(xp-1.0*Linewidth,yp-1.0*Linewidth);
    ctx.lineTo(x-1.0*Linewidth,y-1.0*Linewidth);
    ctx.moveTo(xp-0.5*Linewidth,yp-0.5*Linewidth);
    ctx.lineTo(x-0.5*Linewidth,y-0.5*Linewidth);
    ctx.moveTo(xp+1.0*Linewidth,yp+1.0*Linewidth);
    ctx.lineTo(x+1.0*Linewidth,y+1.0*Linewidth);
    ctx.moveTo(xp+0.5*Linewidth,yp+0.5*Linewidth);
    ctx.lineTo(x+0.5*Linewidth,y+0.5*Linewidth);
    ctx.stroke();
}

function drawRoundBrush(xp,yp,x,y){
    bw=brushimg.width/2.0;
    d=Math.sqrt((x-xp)*(x-xp)+(y-yp)*(y-yp));
    dx=(x-xp)/(d+(d==0));
    dy=(y-yp)/(d+(d==0));
    for (i=0;i<d;i++)
	ctx.drawImage(brushimg,xp+i*dx-bw,yp+i*dy-bw);
}

function drawAirbrush(xp,yp,x,y){
}

brushes={Pencil:drawPencil,Flat_Brush:drawFlatBrush,Round_Brush:drawRoundBrush,
	 Airbrush:drawAirbrush};

Brush=drawPencil;

function setbrush(){
    b=getid('brush');
    if (b == "import") return;
    Brush=brushes[b];
    Brushtype=b;
}

function setcolor(col){
    document.getElementById('numcol').innerHTML=col;
    Color=col;
}

function getid(id){
// alert('getid: '+id);
  return document.getElementById(id).value;
}

function textstart(){
//    console.log('start text');
    Mousedown=false;
    textmode=true;
}

function puttext(text,x,y,font,color,opacity){
//    console.log("puttext "+color+" "+y);
    ctx.fillStyle=color;
    ctx.globalAlpha=opacity;
    ctx.font=font;
    ctx.fillText(text,x,y);
}

function placetext(latlon){
    xy=sph.latlon2xy(latlon);
    font=Fontslant+" "+Fontweight+" "+Fontsize+"px "+Font;
    puttext(getid("textbox"),xy[0],xy[1],font,Color,Opacity);
    currentlist=[
	["Text",font,Color,xy[0],xy[1],Opacity],
	[getid("textbox")]];
    drawlist.push(currentlist);
    showdrawlist();
    textmode=false;
//    if(onlineflag)savepng();
}

function showdrawlist(){
    document.getElementById("drawlist").value=JSON.stringify(drawlist);
}

function redrawText(d){
//    console.log(d[0]);
    puttext(d[1],d[0][3],d[0][4],d[0][1],d[0][2],d[0][5]);
}

function redrawFreehand(d){
//    console.log(d[0]);
    Linewidth=1.0*d[0][1];
    ctx.strokeStyle=d[0][2];
    brush=brushes[d[0][3]];
    ctx.globalAlpha=[d[0][4]];
    ctx.beginPath();
    for(n1=1;n1<d.length;n1++)
	if(d[n1][0]<0){
	    xp=d[n1][1];
	    yp=d[n1][2];
	} else{
	    x=d[n1][0];
	    y=d[n1][1];
	    brush(xp,yp,x,y);
	    xp=x;
	    yp=y;
	};
}

function redraw(){
    sph.putcanvas(canvas_copy);
    canvas=sph.getcanvas();
    ctx=canvas.getContext("2d");
    ctx.lineJoin = ctx.lineCap = 'round';
    ctx.globalAlpha=1;
    linewidthsv=Linewidth;
//    ctx.drawImage(img,0,0);
    for(n=0;n<drawlist.length;n++){
	d=drawlist[n];
	dispfun[d[0][0]](d);
    };
//    if(onlineflag)savepng();
    Linewidth=linewidthsv;
}


dispfun={Text:redrawText,Freehand:redrawFreehand};

function adddrawlist(){
  var txt=getid("drawlist");
  if (txt.length>0){
      var dl2=JSON.parse(txt.trim());
    drawlist=drawlist.concat(dl2);
    showdrawlist();
    redraw();
  };
}

function undo(){
    drawlist.pop();
    showdrawlist();
    redraw();
}


var x_p=0;
var y_p=0;
function dodrag(xy,latlon){
    if (Orient) return true;
//    console.log("dragging "+latlon);
    ctx.lineWidth=Linewidth;
    ctx.strokeStyle=Color;
//    copyText("m2lat",lat);
//    copyText("m2lon",lon);
    xy=sph.latlon2xy(latlon);
    x=xy[0];
    y=xy[1];
    if(!Mousedown){
	Mousedown=true;
	textmode=false;
	x_p=x;
	y_p=y;
	ctx.lineWidth=Linewidth;
	ctx.strokeStyle=Color;
	ctx.globalAlpha=Opacity;
	ctx.beginPath();
//	ctx.moveTo(x,y);
	currentlist=[[Linestyle,Linewidth,Color,Brushtype,Opacity],[-1,x,y]];
	return false;
    };
    r0=sph.res[0];
    if (Math.abs(x_p-x)<0.75*r0) {
	Brush(x_p,y_p,x,y);
  } else {
	dx=r0-Math.abs(x_p-x);
	if(x < 0.25*r0) {
	    ym=(y_p-y)*x/dx+y;
	    Brush(x_p,y_p,r0-1,ym);
	    currentlist.push([r0-1,ym]);
	    Brush(0,ym,x,y);
	    currentlist.push([-1,0,ym]);
	} else {
	    ym=(y-y_p)*x_p/dx+y_p;
	    Brush(x_p,y_p,0,ym);
	    currentlist.push([0,ym]);
	    Brush(r0-1,ym,x,y);
	    currentlist.push([-1,r0-1,ym]);
	};
//	console.log(x0+","+y0+" -> "+x+","+y)
    };
    currentlist.push([x,y]);
    x_p=x;
    y_p=y;
    return false;
}

function mouseup(xy,latlon){
    if(Mousedown){
	Mousedown=false;
	drawlist.push(currentlist);
	showdrawlist();
//	if(onlineflag)savepng();
    };
    return true;
}

function mousedown(xy,latlon){
  xy0=xy;
}

function putImage(cn,imgn) {
    canvas = document.getElementById(cn);
    ctx = canvas.getContext("2d");
    var img = document.getElementById(imgn);
    ctx.drawImage(img,0,0);
    ctx.lineJoin = ctx.lineCap = 'round';
}

function doclick(xy,latlon){
    if(xy[0] > -100){
	if(textmode) placetext(latlon);
	return true;
    };
//    Orient = !Orient;
//    d=document.getElementById("actionstatus");
//    if(Orient)d.innerHTML="Orienting sphere";
//    else d.innerHTML="Drawing";
}

function swapaction(orfl){
   Orient= orfl;
    if (Orient) {
document.getElementById("actionorienting").style['background-color']="#8f8";	
document.getElementById("actiondrawing").style['background-color']="#f88";	
    } else {
document.getElementById("actionorienting").style['background-color']="#f88";	
document.getElementById("actiondrawing").style['background-color']="#8f8";	
    if(!canvas)startCanvas();
    };
}
function savepng(){
    canvas.toBlob(function(blob) {
	saveAs(blob, "drawimage.png");
    });
}

function startCanvas(){
    console.log("startCanvas");
    console.log(sph);
    canvas=sph.getcanvas();
    canvas_copy=cloneCanvas(canvas);
    ctx=canvas.getContext("2d");
    ctx.lineJoin = ctx.lineCap = 'round';
}

function init(){
//    sph=parent.getsph(location);
//    console.log("init0");
//    console.log(sph);
//    canvas=sph.getcanvas();
//    canvas_copy=cloneCanvas(canvas);
//    ctx=canvas.getContext("2d");
//    ctx.lineJoin = ctx.lineCap = 'round';
    sph.sphereClick=doclick;
    sph.sphereDrag=dodrag;
    sph.mouseUp=mouseup;
    sph.mouseDown=mousedown;
    Mousedown=false;
    textmode=false;
    //    if(onlineflag)savepng();
    console.log("init");
    console.log(sph);
}
function finis(){
    sph.sphereClick=null;
    sph.sphereDrag=null;
    sph.mouseUp=null;
    sph.mouseDown=null;
    Mousedown=false;
    textmode=false;
//    sph.reload()
}
	      
var modalPage=null;
function modal(content){
    if(content){
	modalPage=document.getElementById(content);
	modalPage.style.display = "block";
    } else modalPage.style.display = "none";
}

function hexColorSel(c){
    modalPage.style.display = "none";
    document.getElementById("numcol").innerHTML=c;
    setcolor(c);
}

function saveit(){
//    if(onlineflag)
//	modal("saveModal");
//    else
	savepng();
}

</script>
</head>
<body onload='init()' onunload='finis()'>

<button id="actiondrawing" style="background-color:#f88;font-size:30px" 
onclick="swapaction(false)">
Draw on sphere</button>
<button id="actionorienting"
 style="background-color:#8f8;font-size:30px;margin-left:40px"
onclick="swapaction(true)" >
Orienting sphere</button>

<p>
<ul>
<li> Click on buttons above to switch modes between orienting and drawing.</li>
<li> For text, select the color and font information, activate the click
  and move the mouse to   the lower left corner where you want the text to
  start</li> 
<li> For freehand, just hold the mouse button down while you draw.</li>
<li> Other drawing modes are not implemented yet</li>
<li> "undo" removes the last line or line of text</li>
<li> Use the "Save png" button  to capture the final image
</ul>
</p>
 
<p>
<h4>Line or text color:</h4>
<button style="background:red" onclick="setcolor('#f00')">red</button>
<button style="background:yellow" onclick="setcolor('#ff0')">yellow</button>
<button style="background:green" onclick="setcolor('#0f0')">green</button>
<button style="background:cyan" onclick="setcolor('#0ff')">cyan</button>
<button style="background:blue" onclick="setcolor('#00f')">blue</button>
<button style="background:magenta" onclick="setcolor('#f0f')">magenta</button>
<button style="background:white" onclick="setcolor('#fff')">white</button>
<button style="background:black;color:white" onclick="setcolor('#000')">black</button>

<a href='javascript:modal("colorModal");colorinit()'>Hex RGB color code</a>
<span id='numcol'>#f00</span>
</p>
<div id="colorModal" style="display:none" height=500>
<?php require('color.php')?>
</div>
<p>
<h4>Drawing:</hr>
<!--
Style:&nbsp; <select id='linestyle' onchange="Linestyle=getid('linestyle')">
<option selected>Freehand
<option>Lines
<option>Great_circle
<option>Rectangle
<option>Line+arrow
<option>Circle
</select>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
-->
Line thickness:&nbsp;
<input id="linewidth" type="number" min="1" max="20" style="width:5"
onchange="Linewidth=getid('linewidth')" value="2"/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
Brush:&nbsp;
<select id="brush" onchange="setbrush()">
<option selected>Pencil
<option>Flat_Brush
<!--
<option>Round_Brush
<option>Airbrush
<option>import
-->
</select>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
Opacity:&nbsp;
<input id="opacity" style="width:5"
onchange="Opacity=getid('opacity')" value="1"/>
</p>

<hr/>
<p>
<h4>Text:</h4>
<textarea id="textbox" rows=5 columns=40>
</textarea><button onclick="textstart()">Place (lower left) at point where you click
</button><br/>
Size: <input id="fontsize" type="number" min="10" max="60" value="25"
 onchange="Fontsize=getid('fontsize')"/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<select id="font" onchange="Font=getid('font')">
<option>Times
<option>Verdana
<option>Arial
<option>serif
<option selected>sans-serif
</select>
&nbsp;<select id="fontweight" onchange="Fontweight=getid('fontweight')">
<option selected>
<option>bold
</select>
&nbsp;<select id="fontslant" onchange="Fontslant=getid('fontslant')">
<option selected>
<option>oblique
</select>
</p>

<hr/> <p> <button onclick='undo()'style='font-size:20px'>Undo</button>
<button onclick='saveit()' style='margin-left:20px;font-size:20px'>Save png</button> </p>
<div id="saveModal" style="display:none;background-color:#afa" height=500>
<?php require('saveinfo.php')?>
</div>

<hr/>

<p>
<form id="drawdata">
<textarea id="drawlist" rows="20" cols="120" name="drawlist">
</textarea>
</form>
<button onclick="adddrawlist();">Add to drawing list</button>
</p>


</body>
</html>
