// title: bold in menu, no action
// show: put onto globe
// link: replace page
// js: <a href='javascript:[stuff]'>
// raw: <a [stuff]>
menu={
    "Home":["home"],
    "Images and movies": ["title"],
    "Global solar resources": ["show","global_solar_resources.png"],
    "Fukushima radiation release": ["js",'sph.orient(20,180);sph.show("fukushima.mp4")'],
    "Interactive": ["title"],
    "Find positions": ["link","/esglobe/where"],
    "Drawing": ["link","/esglobe/draw/index.php"],
    "Atmospheric Climatology": ["esglobe_module", "climatology"]
};
//for(j=1;j<4;j++)menu["ps-"+j]=["raw","href='pset-"+j+".pdf' target='pdf'"];
