window.onload = function () {

    var paper = Raphael("canvas");
    paper.customAttributes.wedge = function(x,y,r,a) {
        if( a >= 2*Math.PI ) a = 2*Math.PI*0.999999;
        return {path:[['M',x,y],['L',x,(y-r)],['A',r,r,0,(a>Math.PI?1:0),1,(x+r*Math.cos(a-0.5*Math.PI)),(y+r*Math.sin(a-0.5*Math.PI))],['L',x,y],['z']]};
    };

    var game = new Game(paper,'test');
    var level, beam, mirror, goal;

    level = new Level(game);
    level.beams.push(new Beam({x:100,y:100},0,1e5,Color.WHITE,1,0,0,level));
    level.mirrors.push(new Mirror('linear',{x:400,y:100},75,0,Math.PI/4,Color.WHITE,0,1,level));
    level.mirrors.push(new Mirror('linear',{x:300,y:250},75,0,Math.PI/4,Color.WHITE,0,0,level));
    level.mirrors.push(new Mirror('linear',{x:500,y:250},75,0,Math.PI/4,Color.WHITE,0,0,level));
    level.mirrors.push(new Mirror('linear',{x:500,y:350},75,0,3*Math.PI/4,Color.WHITE,0,0,level));
    level.goals.push(new Goal({x:300,y:350},15,1,Color.WHITE,level));

    level = new Level(game);
    level.beams.push(new Beam({x:100,y:100},0,1e5,Color.WHITE,1,0,0,level));
    level.mirrors.push(new Mirror('linear',{x:400,y:100},150,0,Math.PI/4,Color.WHITE,128,4,level));
    level.mirrors.push(new Mirror('linear',{x:200,y:300},50,0,Math.PI/2,Color.WHITE,0,0,level));
    level.mirrors.push(new Mirror('linear',{x:300,y:400},50,0,0,Color.WHITE,0,0,level));
    level.mirrors.push(new Mirror('linear',{x:400,y:250},50,0,Math.PI/6,Color.WHITE,0,0,level));
    level.goals.push(new Goal({x:400,y:300},15,1,Color.WHITE,level));

    level = new Level(game);
    level.beams.push(new Beam({x:100,y:300},0,1e5,Color.WHITE,1,0,2,level));
    level.mirrors.push(new Mirror('linear',{x:300,y:100},75,0,Math.PI/4,Color.WHITE,32,0,level));
    level.mirrors.push(new Mirror('linear',{x:300,y:350},75,0,Math.PI/4,Color.WHITE,32,0,level));
    level.goals.push(new Goal({x:450,y:350},15,1,Color.WHITE,level));

    level = new Level(game);
    level.beams.push(new Beam({x:320,y:100},0,1e5,Color.WHITE,1,0,0,level));
    level.mirrors.push(new Mirror('parabolic',{x:470,y:300},140,100,3*Math.PI/2,Color.WHITE,0,2,level));
    level.mirrors.push(new Mirror('parabolic',{x:180,y:300},140,100,Math.PI/2,Color.WHITE,0,2,level));
    level.mirrors.push(new Mirror('linear',{x:325,y:225},175,0,0,Color.WHITE,0,0,level));
    level.mirrors.push(new Mirror('linear',{x:325,y:275},175,0,0,Color.WHITE,0,0,level));
    level.goals.push(new Goal({x:320,y:200},15,1,Color.WHITE,level));
    level.goals.push(new Goal({x:320,y:300},15,1,Color.WHITE,level));
    
    level = new Level(game);
    for( var i=0; i<11; i++ ) 
        level.beams.push(new Beam({x:200,y:200},5*Math.PI/6+Math.PI/3*(i/10),1e5,Color.WHITE,1,0,0,level));
    level.mirrors.push(new Mirror('parabolic',{x:300,y:200},100,20,0,Color.WHITE,32,5,level));
    level.goals.push(new Goal({x:500,y:200},15,11,Color.WHITE,level));

    level = new Level(game);
    level.beams.push(new Beam({x:100,y:100},Math.PI/2,1e5,Color.WHITE,1,0,1,level));
    level.filters.push(new Filter({x:300,y:250},50,Math.PI/2,Color.RED,0,0,level));
    level.mirrors.push(new Mirror('linear',{x:500,y:250},50,0,-Math.PI/4,Color.WHITE,0,0,level));
    level.goals.push(new Goal({x:200,y:250},15,1,Color.RED,level));

    level = new Level(game);
    level.beams.push(new Beam({x:100,y:250},0,1e5,Color.WHITE,1,0,0,level));
    level.filters.push(new Filter({x:150,y:250},50,Math.PI/2,Color.RED,0,1,level));
    level.filters.push(new Filter({x:275,y:250},50,Math.PI/2,(Color.RED).add(Color.YELLOW),0,1,level));
    level.filters.push(new Filter({x:425,y:250},50,Math.PI/2,Color.RED.add(Color.YELLOW).add(Color.GREEN),0,1,level));
    level.goals.push(new Goal({x:200,y:250},15,1,Color.RED.add(Color.YELLOW).add(Color.GREEN),level));
    level.goals.push(new Goal({x:350,y:250},15,1,Color.RED.add(Color.YELLOW),level));
    level.goals.push(new Goal({x:500,y:250},15,1,Color.RED,level));

    level = new Level(game);
    level.beams.push(new Beam({x:100,y:250},0,1e5,Color.RED.or(Color.BLUE),1,0,0,level));
    level.mirrors.push(new Mirror('linear',{x:300,y:300},100,0,-Math.PI/4,Color.RED,0,3,level));
    level.goals.push(new Goal({x:500,y:250},30,1,Color.BLUE,level));
    level.goals.push(new Goal({x:300,y:100},15,1,Color.RED,level));

    level = new Level(game);
    for( var i=0; i<5; i++ ) 
        level.beams.push(new Beam({x:200,y:200},5*Math.PI/6+Math.PI/3*(i/4),1e5,Color.RED.add(Color.GREEN).add(Color.BLUE),1,0,0,level));
    level.mirrors.push(new Mirror('parabolic',{x:300,y:200},100,20,0,Color.RED,32,5,level));
    level.mirrors.push(new Mirror('parabolic',{x:300,y:100},150,30,0,Color.WHITE,32,7,level));
    level.mirrors.push(new Mirror('linear',{x:300,y:300},100,0,0,Color.GREEN,32,7,level));
    level.goals.push(new Goal({x:500,y:200},15,5,Color.RED,level));
    level.goals.push(new Goal({x:500,y:50},40,5,Color.BLUE,level));
    level.goals.push(new Goal({x:350,y:400},25,5,Color.GREEN,level));

    level = new Level(game);
    level.beams.push(new Beam({x:100,y:240},-Math.PI/6,1e5,Color.WHITE,1,0,0,level));
    level.mirrors.push(new Mirror('linear',{x:320,y:400},100,0,0,Color.WHITE,64,7,level));
    //level.mirrors.push(new Mirror('linear',{x:580,y:300},100,0,-13*Math.PI/32,Color.WHITE,64,7,level));
    level.prisms.push(new Prism(Prism.EQUILATERAL(3,50,320,240),-Math.PI/2,Prism.SAPPHIRE,0,2,level));
         
    level.goals.push(new Goal({x:100,y:290},5,1,Color.RED,level));
    level.goals.push(new Goal({x:100,y:297},5,1,Color.YELLOW,level));    
    level.goals.push(new Goal({x:100,y:305},5,1,Color.GREEN,level));    
    level.goals.push(new Goal({x:100,y:308},5,1,Color.CYAN,level));
    level.goals.push(new Goal({x:100,y:315},5,1,Color.BLUE,level));
    level.goals.push(new Goal({x:100,y:328},5,1,Color.VIOLET,level));

    level = new Level(game);
    level.beams.push(new Beam({x:100,y:240},-Math.PI/6,1e5,Color.WHITE,1,0,0,level));
    level.mirrors.push(new Mirror('linear',{x:200,y:200},100,0,0,Color.WHITE,0,7,level));
    level.mirrors.push(new Mirror('linear',{x:200,y:200},100,0,0,Color.WHITE,0,7,level));
    level.prisms.push(new Prism(Prism.STAR(9,55,100,320,240),-Math.PI/2,Prism.SAPPHIRE,0,7,level));

    game.play();
    
};
