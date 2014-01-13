function Filter(center,width,angle,color,clicks,moveable,level) {

    this.center = new Object();
    this.center.x = center.x;
    this.center.y = center.y;
    this.start = new Object();
    this.width = width;
    this.angle = angle;
    this.color = color;
    this.clicks = clicks
    this.moveable = moveable;
    this.level = level;

    this.filter;
    this.handle;
    this.rotation_cue;

    this.initialize = function() {

        this.center.x = center.x;
        this.center.y = center.y;
        this.width = width;
        this.angle = angle;
        this.color = color;

        this.filter = this.level.paper.path();
        
        this.filter.attr({'stroke':this.color.hexString(),
                          'stroke-width':5,
                          'path':'M'+(this.center.x-0.5*this.width*Math.cos(this.angle))+','+(this.center.y-0.5*this.width*Math.sin(this.angle))
                          +'l'+(this.width*Math.cos(this.angle))+','+(this.width*Math.sin(this.angle))});
        
        // initialize the handle
        this.handle = this.level.paper.circle(this.center.x,this.center.y,10);
        this.handle.attr({'stroke':this.color.hexString(),
                          'stroke-width':3,
                          'stroke-opacity':0,
                          'fill':this.color.hexString(),
                          'fill-opacity':(this.moveable&3)?0.25:0});
        
        // initialize the rotation cue
        this.rotation_cue = this.level.paper.path('M'+(this.center.x+20*Math.cos(this.angle+0.5))+','+(this.center.y+20*Math.sin(this.angle+0.5))
                                                  +'A20,20,0,0,0,'+(this.center.x+20*Math.cos(this.angle-0.5))+','+(this.center.y+20*Math.sin(this.angle-0.5))
                                                  +'M'+(this.center.x-20*Math.cos(this.angle+0.5))+','+(this.center.y-20*Math.sin(this.angle+0.5))
                                                  +'A20,20,0,0,0,'+(this.center.x-20*Math.cos(this.angle-0.5))+','+(this.center.y-20*Math.sin(this.angle-0.5)));
        this.rotation_cue.attr({'stroke':this.color.hexString(),
                                'stroke-width':3,
                                'stroke-opacity':this.moveable&4?0.25:0,
                                'stroke-linecap':'round'});
        
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
                        this.center.x = this.start.x + dx;
                    if( this.moveable & 2 )
                        this.center.y = this.start.y + dy;
                    this.draw();
                    this.level.resolve();
                },function(x,y,e){
                    this.start.x = this.center.x;
                    this.start.y = this.center.y;
                },function(e){},this,this,this);
        }
        if( this.moveable & 4 ) {
            this.filter.hover(
                function(){
                    this.rotation_cue.animate({'stroke-opacity':1},250);
                },
                function(){
                    this.rotation_cue.animate({'stroke-opacity':0.25},250);
                },this,this);
            this.filter.drag(
                function(dx,dy,x,y,e){
                    var element = document.getElementById('canvas');
                    x -= element.offsetLeft;
                    y -= element.offsetTop;
                    if( this.clicks < 3 )
                        this.angle = Math.atan2(y-this.center.y,x-this.center.x)-this.start.angle;
                    else
                        this.angle = 2.0*Math.PI*Math.round(this.clicks*(Math.atan2(y-this.center.y,x-this.center.x)-this.start.angle+Math.PI)/(2.0*Math.PI))/this.clicks-Math.PI;
                    this.draw();
                    this.level.resolve();
                },function(x,y,e){
                    var element = document.getElementById('canvas');
                    this.start.angle = Math.atan2(y-element.offsetTop-this.center.y,x-element.offsetLeft-this.center.x)-this.angle;
                },function(e){},this,this,this);
        }
        
    }
        


    // ********** Filter methods **********

    // if the beam intersects this filter, return the length of the beam, otherwise return NaN
    this.find_tangent = function(beam) {

        // if the beam and filter are parallel, there is no interaction
        var diff = Math.abs(beam.angle - this.angle);
        if( (diff/Math.PI)%1 < 1e-4 )
            return NaN;
        
        var s2 = Math.sin(this.angle-beam.angle);
        
        var mirror_intersection = (Math.sin(beam.angle)*(this.center.x-beam.origin.x)
                                   -Math.cos(beam.angle)*(this.center.y-beam.origin.y))/s2;
        if( mirror_intersection > 0.5*this.width || mirror_intersection < -0.5*this.width )
            return NaN;
        
        var t = (Math.cos(this.angle)*(beam.origin.y-this.center.y) - Math.sin(this.angle)*(beam.origin.x-this.center.x))/s2;
        if( t > 1e-8 ) 
            return t;
        else
            return NaN;
        
    }

    // erase this filter from the canvas
    this.erase = function() {
        this.filter.remove();
        this.handle.remove();
        this.rotation_cue.remove();
        this.level.resolveBeams();
        this.level.resolveGoals();
    };

    // redraw the filter
    this.draw = function() {

        this.filter.attr({'path':'M'+(this.center.x-0.5*this.width*Math.cos(this.angle))+','+(this.center.y-0.5*this.width*Math.sin(this.angle))
                          +'l'+(this.width*Math.cos(this.angle))+','+(this.width*Math.sin(this.angle))});
        this.handle.attr({'cx':this.center.x,'cy':this.center.y,'fill-opacity':(this.moveable&3)?0.25:0});
        this.rotation_cue.attr('path','M'+(this.center.x+20*Math.cos(this.angle+0.5))+','+(this.center.y+20*Math.sin(this.angle+0.5))
                               +'A20,20,0,0,0,'+(this.center.x+20*Math.cos(this.angle-0.5))+','+(this.center.y+20*Math.sin(this.angle-0.5))
                               +'M'+(this.center.x-20*Math.cos(this.angle+0.5))+','+(this.center.y-20*Math.sin(this.angle+0.5))
                               +'A20,20,0,0,0,'+(this.center.x-20*Math.cos(this.angle-0.5))+','+(this.center.y-20*Math.sin(this.angle-0.5)));

    };

};
