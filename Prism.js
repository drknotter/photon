function Prism(points,angle,coefficients,clicks,moveable,level) {

    this.points = [];
    this.coefficients = new Object();
    this.coefficients.b1 = coefficients.b1;
    this.coefficients.b2 = coefficients.b2;
    this.coefficients.b3 = coefficients.b3;
    this.coefficients.c1 = coefficients.c1;
    this.coefficients.c2 = coefficients.c2;
    this.coefficients.c3 = coefficients.c3;
    this.center = new Object();
    this.start = new Object();
    this.angle = angle;
    this.clicks = clicks
    this.moveable = moveable;
    this.level = level;

    this.glass;
    this.handle;
    this.rotation_cue;

    this.initialize = function() {
        
        this.center.x = 0;
        this.center.y = 0;
        this.points = [];
        for( var i=0; i<points.length; i++ ) {
            this.points[i] = new Object();
            this.points[i].x = points[i].x;
            this.points[i].y = points[i].y;
            this.center.x += points[i].x;
            this.center.y += points[i].y;
        }
        this.center.x /= points.length;
        this.center.y /= points.length;
        
        this.angle = angle;
        this.recalculate_points_from_angle();
        
        this.glass = this.level.paper.path();
        var pathString = 'M'+this.points[0].x+','+this.points[0].y;
        for( var i=1; i<this.points.length; i++ ) {
            pathString = pathString+'L'+this.points[i].x+','+this.points[i].y;
        }
        pathString = pathString+'z';
        
        this.glass.attr({'stroke':'none','fill':'#aac','opacity':0.6,'path':pathString});
        
        // initialize the handle
        this.handle = this.level.paper.circle(this.center.x,this.center.y,10);
        this.handle.attr({'stroke':'#aac',
                          'stroke-width':3,
                          'stroke-opacity':0,
                          'fill':'#aac',
                          'fill-opacity':(this.moveable&3)?0.25:0});
        
        // initialize the rotation cue
        this.rotation_cue = this.level.paper.path('M'+(this.center.x+20*Math.cos(this.angle+0.5))+','+(this.center.y+20*Math.sin(this.angle+0.5))
                                                  +'A20,20,0,0,0,'+(this.center.x+20*Math.cos(this.angle-0.5))+','+(this.center.y+20*Math.sin(this.angle-0.5))
                                                  +'M'+(this.center.x-20*Math.cos(this.angle+0.5))+','+(this.center.y-20*Math.sin(this.angle+0.5))
                                                  +'A20,20,0,0,0,'+(this.center.x-20*Math.cos(this.angle-0.5))+','+(this.center.y-20*Math.sin(this.angle-0.5)));
        this.rotation_cue.attr({'stroke':'#aac','stroke-width':3,'stroke-opacity':this.moveable&4?0.25:0,'stroke-linecap':'round'});
        
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
                    if( this.moveable & 1 ) {
                        this.center.x = this.start.x + dx;
                    }
                    if( this.moveable & 2 )
                        this.center.y = this.start.y + dy;
                    this.recalculate_points_from_center();
                    this.draw();
                    this.level.resolve();
                },function(x,y,e){
                    this.start.x = this.center.x;
                    this.start.y = this.center.y;
                },function(e){},this,this,this);
        }
        if( this.moveable & 4 ) {
            this.glass.hover(
                function(){
                    this.rotation_cue.animate({'stroke-opacity':1},250);
                },
                function(){
                    this.rotation_cue.animate({'stroke-opacity':0.25},250);
                },this,this);
            this.glass.drag(
                function(dx,dy,x,y,e){
                    var element = document.getElementById('canvas');
                    x -= element.offsetLeft;
                    y -= element.offsetTop;
                    if( this.clicks < 3 )
                        this.angle = Math.atan2(y-this.center.y,x-this.center.x)-this.start.angle;
                    else
                        this.angle = 2.0*Math.PI*Math.round(this.clicks*(Math.atan2(y-this.center.y,x-this.center.x)-this.start.angle+Math.PI)/(2.0*Math.PI))/this.clicks-Math.PI;
                    this.recalculate_points_from_angle();
                    this.draw();
                    this.level.resolve();
                },function(x,y,e){
                    var element = document.getElementById('canvas');
                    this.start.angle = Math.atan2(y-element.offsetTop-this.center.y,x-element.offsetLeft-this.center.x)-this.angle;
                },function(e){},this,this,this);
        }
        
    };

};

// ********** Prism methods **********

// if the beam intersects this mirror, return the length of the beam, and the tangent angle 
// of the intersection point, and whether the beam is entering or exiting the beam;
// otherwise return [NaN,NaN,NaN]
Prism.prototype.find_tangent = function(beam) {
    
    var segment = new Object(), closest_intersection=[1e7,NaN,NaN];
    for( var i=0; i<this.points.length; i++ ) {
        
        segment.x = this.points[(i+1)%this.points.length].x-this.points[i].x;
        segment.y = this.points[(i+1)%this.points.length].y-this.points[i].y;
        segment.angle = Math.atan2(segment.y,segment.x);
        // if the beam and mirror are parallel, there is no interaction
        var diff = Math.abs(beam.angle - segment.angle);
        if( (diff/Math.PI)%1 < 1e-4 )
            continue;
        
        var s2 = Math.sin(segment.angle-beam.angle);
        
        var intersection = (Math.sin(beam.angle)*(this.points[i].x-beam.origin.x)
                            -Math.cos(beam.angle)*(this.points[i].y-beam.origin.y))/s2;
        segment.length = Math.sqrt(segment.x*segment.x+segment.y*segment.y);
        if( intersection < 0 || intersection > segment.length )
            continue;
        
        var t = (Math.cos(segment.angle)*(beam.origin.y-this.points[i].y) - Math.sin(segment.angle)*(beam.origin.x-this.points[i].x))/s2;
        if( t > 1e-8 && t < closest_intersection[0] ) {
            closest_intersection[0] = t;
            closest_intersection[1] = segment.angle;
            closest_intersection[2] = (Math.cos(beam.angle)*segment.y - Math.sin(beam.angle)*segment.x < 0)
        }
        
    }
    
    return closest_intersection;
    
}

// this recalculates the points of the prism based on the (updated) center of mass
Prism.prototype.recalculate_points_from_center = function() {
    var old_center = new Object();
    old_center.x = 0; old_center.y = 0;
    for( var i=0; i<this.points.length; i++ ) {
        old_center.x += this.points[i].x;
        old_center.y += this.points[i].y;
    }
    old_center.x /= this.points.length;
    old_center.y /= this.points.length;
    for( var i=0; i<this.points.length; i++ ) {
        this.points[i].x += this.center.x - old_center.x;
        this.points[i].y += this.center.y - old_center.y;
    }
}

// this recalculates the points of the prism based on the (updated) angle
Prism.prototype.recalculate_points_from_angle = function() {
    
    var angle_diff = this.angle-Math.atan2(this.points[0].y-this.center.y,this.points[0].x-this.center.x);
    var old_x, old_y;
    
    // rotate points by angle_diff centered on this.center
    for( var i=0; i<this.points.length; i++ ) {
        old_x = this.points[i].x; old_y = this.points[i].y;
        this.points[i].x = Math.cos(angle_diff)*(old_x-this.center.x) - Math.sin(angle_diff)*(old_y-this.center.y) + this.center.x;
        this.points[i].y = Math.sin(angle_diff)*(old_x-this.center.x) + Math.cos(angle_diff)*(old_y-this.center.y) + this.center.y;
    }
    
}

// erase this prism from the canvas
Prism.prototype.erase = function() {
    this.glass.remove();
    this.handle.remove();
    this.rotation_cue.remove();
    this.level.resolve();
};

// redraw the prism
Prism.prototype.draw = function() {
    
    var pathString = 'M'+this.points[0].x+','+this.points[0].y;
    for( var i=1; i<this.points.length; i++ ) {
        pathString = pathString+'L'+this.points[i].x+','+this.points[i].y;
    }
    pathString = pathString+'z';
    this.glass.attr({'path':pathString});
    this.handle.attr({'cx':this.center.x,'cy':this.center.y,'fill-opacity':(this.moveable&3)?0.25:0});
    this.rotation_cue.attr('path','M'+(this.center.x+20*Math.cos(this.angle+0.5))+','+(this.center.y+20*Math.sin(this.angle+0.5))
                           +'A20,20,0,0,0,'+(this.center.x+20*Math.cos(this.angle-0.5))+','+(this.center.y+20*Math.sin(this.angle-0.5))
                           +'M'+(this.center.x-20*Math.cos(this.angle+0.5))+','+(this.center.y-20*Math.sin(this.angle+0.5))
                           +'A20,20,0,0,0,'+(this.center.x-20*Math.cos(this.angle-0.5))+','+(this.center.y-20*Math.sin(this.angle-0.5)));
    
};


Prism.EQUILATERAL = function(n,w,x,y) {
    var points = [];
    for( var i=0; i<n; i++ ) {
        points.push(new Object);
        points[i].x = w*Math.cos(2*Math.PI/n*i)+x;
        points[i].y = w*Math.sin(2*Math.PI/n*i)+y;
    }
    return points;
}

Prism.STAR = function(n,w1,w2,x,y) {
    var points = [];
    for( var i=0; i<n; i++ ) {
        points.push(new Object());
        points[2*i].x = w1*Math.cos(Math.PI/n*2*i)+x;
        points[2*i].y = w1*Math.sin(Math.PI/n*2*i)+y;
        points.push(new Object());
        points[2*i+1].x = w2*Math.cos(Math.PI/n*(2*i+1))+x;
        points[2*i+1].y = w2*Math.sin(Math.PI/n*(2*i+1))+y;
    }
    return points;
}

 // c1, c2, c3 in nm^2
Prism.BK7 = {b1:1.03961212,b2:0.231792344,b3:1.01046945,c1:6.00069867e3,c2:2.00179144e4,c3:1.03560653e8};
Prism.SAPPHIRE = {b1:1.43134930,b2:0.65054713,b3:5.3414021,c1:5.2799261e3,c2:1.42382647e4,c3:3.25017834e8};
Prism.DIAMOND = {b1:4.3356,b2:0.3306,b3:0,c1:0.1060e6,c2:0.1750e6,c3:0};