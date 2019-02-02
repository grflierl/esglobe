/**
 * ES Globe Sphere Code
 */
var emitter = new EventEmitter();
var sph = {
    rot: rot,
    rotStop: rotStop,
    tilt: tilt,
    orient: orient,
    show: show,
    skip: 1,
    sphereClick: null,
    sphereDrag: null,
    mouseDown: null,
    mouseUp: null,
    url: url,
    res: res,
    getcanvas: getcanvas,
    putcanvas: putcanvas,
    reload: reload,
    reloadEarth: reloadEarth,
    stop: stopSphere,
    latlon2xy: latlon2xy,
    getCurrentLatLon: getCurrentLatLon,
    xy2latlon: xy2latlon,
    pause:pauseSphere,
    notify:null,
    reset: resetSphere,
    emitter: emitter,
    plugins: {},
    im: "earth2048.jpg",
    baseurl: "/esglobe/",
    position:[8,8],
    sz:950,
    w:450,
    scalefac:1.06
};

if(typeof args != "undefined") {
  for (nm in args) {
    r=args[nm];
    if (r[0]=="[") r=eval(r);
    sph[nm]=r;
      console.log(nm+" "+r);  
  }
}

var esglobe = {
    sz: 900,
    w: 450,
    scalefac: 1.06,
    res: [2048, 1024],
    image: 'graphics/earth2048.jpg'
};

sph.res = esglobe.res;

var disableDrag = false;

var sz = sph.sz;
var w = esglobe.w;
var scalefac=esglobe.scalefac;
var res = esglobe.res;


var url = rebase(sph.im);

//var sph;

var movie=false;
var playing=true;
var mp4=false;
var vid;

var pi=3.1415926536;
var radtodeg=180.0/pi;
//var res=[1024,512];

var theta=pi;
var phi=0;
var rottheta=0;
var rotphi=0;

var simg;
var pg=false;

var sphereok=false;
var nSphere=0;
var currentFrame=0;

var currentLatLon = [0, 0];

function rebase(nm){
    if(nm.startsWith("<")){
        if(nm.indexOf("#") >= 0){
            nm="/esglobe/s.php"+sph.baseurl+"scripts/"+nm.substr(1);
        } else {
            nm="/esglobe/s0.php"+sph.baseurl+"scripts/"+nm.substr(1);
        };
        console.log("rebase -> "+nm);
    }else if(nm.startsWith("@")){
        nm="/esglobe/ht.php/"+nm.substr(1);
    } else if(nm.startsWith("/")) {
        // do nothing, just pass through;
    } else if(!nm.startsWith("/")){
        nm=sph.baseurl+"graphics/"+nm;
    }
//    console.log("rebase -> "+nm);
    return nm;
}

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

function convfn(fn,fnum){
    if(movie){
        p=fn.indexOf("#");
        z="0000";
        ns=fnum.toString();
        if (ns.length < 4) ns=z.substr(0,4-ns.length)+ns;
        nm=fn.substr(0,p)+ns+fn.substr(p+1);
    } else {
        nm=fn;
    };
    return nm;
}

function drawSphere(){
   if(mp4){
        texture(vid);
    } else {
        texture(pg);
    }
    rotateX(phi);
    rotateY(theta);
    ellipsoid(w,w,w,40,24);
    theta += rottheta;
}

function checkSphere(im){
//    simg=im;
    //    pg.image(simg,0,0,simg.width,simg.height,0,0,res[0],res[1]);
    pg.image(im,0,0,im.width,im.height,0,0,res[0],res[1]);
    nSphere += skp;
    if(sph.notify)sph.notify(true);
    if(!movie) playing=false;
}

function stopSphere(){
    // console.log("stop "+imgnum+"\n");
    sphereok=true;
    playing=false;
    movie=false;
    mp4=false;
    if(vid)vid.stop();
    if(sph.notify)sph.notify(false);
}

// get an image with callback to draw it
function loadSphere(j) {
    imgnum=j+1;
    skp=sph.skip;
    // console.log(convfn(url,j+1));
    if(j==0 || movie){
        loadImage(convfn(url,j+1), checkSphere, stopSphere);
    }
}

function resetSphere() {
    show(esglobe.image)
}

var x0=0;
var y0=0;
var x00=0;
var y00=0;
var x_p=0;
var y_p=0;

function dragInSphere(mx,my){
    var xz = mouse2xz(mx,my);
    if (xz[0]*xz[0]+xz[1]*xz[1]>1) return;
    if(sph.sphereDrag){
        var latlon = xy2latlon(xz);
        var r = sph.sphereDrag(xz,latlon);
        if (!r) return;
    }

    if (disableDrag) return;
    theta += 0.005*(mx-x0);
    phi += 0.005*(my-y0);
    rottheta=0;
    rotphi=0;
    x0=mx;
    y0=my;
    return;
}

function clickInSphere(mx,my){
    xz=mouse2xz(mx,my);
    if (xz[0]*xz[0]+xz[1]*xz[1]<=1) {
        var latlon = xy2latlon(xz);
        currentLatLon = latlon;
        emitter.emit('esglobe:sphereClick', { latlon: currentLatLon });
        if(sph.sphereClick){
            latlon = xy2latlon(xz);
            sph.sphereClick(xz,latlon);
        }
    }
    return false;
}

function mouse2xz(mx,my){
    xt = scalefac*(mx - sz / 2) / (sz / 2 - 20);
    zt = scalefac*(sz / 2 - my) / (sz / 2 - 20);
//    xt=(mx-sz/2)*2/sz;
//    zt=(sz/2-my)*2/sz;
//    console.log(mx+","+my+" =>  "+xt+","+zt);
    return [xt,zt];
}
function latlon2xy(latlon){
    currentLatLon = latlon;
    lat=latlon[0];
    lon=latlon[1];
    if(lon<-180) lon +=360;
    if(lon>180) lon -=360;
//    return [(float(lon)+180)/360.0*res[0],(90-float(lat))/180.0*res[1]];
    return [Math.round(10.0*(lon+180.0)/360.0*sph.res[0])/10.0,
        Math.round(10.0*(90.0-lat)/180.0*sph.res[1])/10.0];
}
function xy2latlon(xz){
    xt=xz[0];
    zt=xz[1];
    yt=-sqrt(abs(1-xt*xt-zt*zt));
    zn=-yt*sin(phi)+zt*cos(phi);
    yt=yt*cos(phi)+zt*sin(phi)
    xn=-xt*cos(theta)-yt*sin(theta);
    yn=xt*sin(theta)-yt*cos(theta);
    lat=radtodeg*asin(zn);
    lon=radtodeg*atan2(xn,-yn);
    return [lat,lon];
}

function mousePressed(){
    x00=x0=mouseX;
    y00=y0=mouseY;
    xz=mouse2xz(x0,y0);
    emitter.emit('esglobe:mousePressed', { xy: [mouseX, mouseY], xz, latlon: xy2latlon(xz) });
    if(sph.mouseDown){
        sph.mouseDown(xz, xy2latlon(xz));
    }
    return false;
}

function setDrag(flag) {
    disableDrag = !flag;
}

function mouseDragged(){
    var msx = mouseX;
    var msy = mouseY;
    emitter.emit('esglobe:mouseDragged', { xy: [msx, msy] });
    dragInSphere(msx,msy);
    return false;
}

function mouseReleased(){
    var msx = mouseX;
    var msy = mouseY;
    emitter.emit('esglobe:mouseReleased', { xy: [msx, msy] });

    if(sph.mouseUp){
        var r=sph.mouseUp([msx,msy],xy2latlon([msx,msy]));
        if(!r)return;
    }
    if ((msx-x00)*(msx-x00)+(msy-y00)*(msy-y00)>16) return false;
    clickInSphere(msx,msy);
    return false;
}

var maincanvas;

function myevent(e){
    alert(e.type);
}

function setup(){
    maincanvas = createCanvas(sz, sz, WEBGL);
    maincanvas.parent('canvas-container');
    ortho(-width/2,width/2,-height/2,height/2,-1000,1000);
    pg = createGraphics(res[0],res[1]);
    loadSphere(0);
}

function draw(){
    if(nSphere <= currentFrame) return;
    drawSphere();
    if(movie){
        currentFrame += sph.skip;
        loadSphere(currentFrame);
    }
}

function rot(f){
    rottheta += f;
}

function rotStop(){
    rottheta = 0;
}

function tilt(f){
    phi +=f;
}
function orient(lat,lon){
    rottheta=0;
    theta=(180-lon)*pi/180;
    phi=lat*pi/180;
}
function show(fn){
    if (typeof fn === 'undefined') return;
    url=rebase(fn);
    if (url.slice(-3) == "mp4" || url.slice(-4) == "webm"){
        console.log("video "+url);
        vid = createVideo([url]);

        vid.hide();
        vid.paused=false;
        vid.play();
        mp4=true;
        return;
    }
    mp4=false;
    playing=false;

    if(url.indexOf("#") >= 0)
        movie=true;
    else
        movie=false;
    currentFrame=0;
    loadSphere(0);
    playing=true;

}

function getcanvas(c){
    if(!pg) return false;
    return pg.elt;
}

function getCurrentLatLon() {
    return currentLatLon;
}

function putcanvas(c){
    context=pg.elt.getContext('2d');
    pg.elt.width=c.width;
    pg.elt.height=c.height;
    context.drawImage(c, 0, 0);
};

function reload(c){
    pg = createGraphics(res[0],res[1]);
    loadSphere(0);
}

function reloadEarth(){
    url=rebase(sph.im);
    loadSphere(0);
}

function stop(){
    stopSphere();
}

function pauseSphere(){
    playing = !playing;
    if(vid){
        if(vid.paused) vid.play(); else vid.pause();
        vid.paused= !vid.paused
    }
}

function reload(c){
    pg = createGraphics(2048,1024);
    loadSphere(0);
}

