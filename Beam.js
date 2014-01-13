function Beam(origin,angle,extent,color,intensity,clicks,moveable,level) {
    
    this.origin = new Object();
    this.origin.x = origin.x;
    this.origin.y = origin.y;
    this.start = new Object();
    this.angle = angle;
    this.extent = extent;
    this.color = color;
    this.intensity = intensity;
    this.clicks = clicks;
    this.level = level;
    this.moveable = moveable;

    this.children = [];

    this.beam;
    this.diffuse;
    this.handle;
    this.rotation_cue;

    this.initialize = function() {
        
        this.origin.x = origin.x;
        this.origin.y = origin.y;
        this.angle = angle;
        this.extent = extent;
        this.color = color;

        // initialize the beam
        this.beam = this.level.paper.path('M'+this.origin.x+','+this.origin.y
                                          +'l'+(this.extent*Math.cos(this.angle))+','+(this.extent*Math.sin(this.angle)));
        this.beam.attr({'stroke':this.color.hexString(),'stroke-width':2,'stroke-linecap':'round','opacity':this.intensity});
        this.diffuse = this.level.paper.path('M'+this.origin.x+','+this.origin.y
                                             +'l'+(this.extent*Math.cos(this.angle))+','+(this.extent*Math.sin(this.angle)));
        this.diffuse.attr({'stroke':this.color.hexString(),'stroke-width':5,'stroke-linecap':'round','opacity':0.5*this.intensity});
        
        // initialize the handle
        this.handle = this.level.paper.circle(this.origin.x,this.origin.y,10);
        this.handle.attr({'stroke':this.color.hexString(),
                          'stroke-width':3,
                          'stroke-opacity':0,
                          'fill':this.color.hexString(),
                          'fill-opacity':(this.moveable&3)?0.25:0});
        
        // initialize the rotation cue
        this.rotation_cue = this.level.paper.path('M'+(this.origin.x+20*Math.cos(this.angle+0.5))+','+(this.origin.y+20*Math.sin(this.angle+0.5))
                                                  +'A20,20,0,0,0,'+(this.origin.x+20*Math.cos(this.angle-0.5))+','+(this.origin.y+20*Math.sin(this.angle-0.5)));
        this.rotation_cue.attr({'stroke':this.color.hexString(),
                                'stroke-width':3,
                                'stroke-opacity':this.moveable&4?0.25:0,
                                'stroke-linecap':'round'});
        
        this.handle.toBack();
        this.diffuse.toBack();
        this.beam.toBack();
        this.rotation_cue.toBack();
        
        // add event listeners, if moveable
        if( this.moveable & 3 ) {
            this.handle.hover(
                function(){
                    this.handle.animate({'stroke-opacity':1},250);
                },
                function(){
                    this.handle.animate({'stroke-opacity':0},250);
                },this,this);
            this.handle.drag(
                function(dx,dy,x,y,e){
                    if( this.moveable & 1 )
                        this.origin.x = this.start.x + dx;
                    if( this.moveable & 2 )
                        this.origin.y = this.start.y + dy;
                    this.draw();
                    this.level.resolveBeam(this,0);
                    this.level.resolveGoals();
                },function(x,y,e){
                    this.start.x = this.origin.x;
                    this.start.y = this.origin.y;
                },function(e){},this,this,this);
        }
        if( this.moveable & 4 ) {
            this.diffuse.hover(
                function(){
                    this.rotation_cue.animate({'stroke-opacity':1},250);
                },
                function(){
                    this.rotation_cue.animate({'stroke-opacity':0.25},250);
                },this,this);
            this.diffuse.drag(
                function(dx,dy,x,y,e){
                    var element = document.getElementById('canvas');
                    x -= element.offsetLeft;
                    y -= element.offsetTop;
                    if( this.clicks < 3 )
                        this.angle = Math.atan2(y-this.origin.y,x-this.origin.x);
                    else
                        this.angle = 2.0*Math.PI*Math.round(this.clicks*(Math.atan2(y-this.origin.y,x-this.origin.x)+Math.PI)/(2.0*Math.PI))/this.clicks-Math.PI;
                    this.draw();
                    this.level.resolveBeam(this,0);
                    this.level.resolveGoals();
                },function(x,y,e){
                },function(e){},this,this,this);
        }

    };



    // ********** Beam methods **********

    // erase this beam from the canvas
    this.erase = function() {
        for( var i=0; i<this.children.length; i++ )
            this.children[i].erase();
        this.children = [];
        this.beam.remove();
        this.diffuse.remove();
        this.handle.remove();
        this.rotation_cue.remove();
        //this.level.resolveGoals();
    };

    // redraw the beam
    this.draw = function() {
        this.beam.attr({'path':'M'+this.origin.x+','+this.origin.y
                        +'l'+(this.extent*Math.cos(this.angle))+','+(this.extent*Math.sin(this.angle)),
                        'stroke':this.color.hexString()});
        this.diffuse.attr({'path':'M'+this.origin.x+','+this.origin.y
                           +'l'+(this.extent*Math.cos(this.angle))+','+(this.extent*Math.sin(this.angle)),
                           'stroke':this.color.hexString()});
        this.handle.attr({'cx':this.origin.x,'cy':this.origin.y,'fill-opacity':(this.moveable&3)?0.25:0});
        this.rotation_cue.attr('path','M'+(this.origin.x+20*Math.cos(this.angle+0.5))+','+(this.origin.y+20*Math.sin(this.angle+0.5))
                               +'A20,20,0,0,0,'+(this.origin.x+20*Math.cos(this.angle-0.5))+','+(this.origin.y+20*Math.sin(this.angle-0.5)));
    };
    
};
