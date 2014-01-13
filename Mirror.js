function Mirror(type,center,width,depth,angle,color,clicks,moveable,level) {

    this.type = type;
    this.center = new Object();
    this.center.x = center.x;
    this.center.y = center.y;
    this.start = new Object();
    this.width = width;
    this.depth = depth;
    this.angle = angle;
    this.color = color;
    this.clicks = clicks;
    this.moveable = moveable;
    this.level = level;

    this.p1 = new Object();
    this.p2 = new Object();
    this.p3 = new Object();

    this.mirror;
    this.glass;
    this.handle;
    this.rotation_cue;

    this.initialize = function() {

        this.center.x = center.x;
        this.center.y = center.y;
        this.width = width;
        this.depth = depth;
        this.angle = angle;
        this.color = color;

        if( this.type == "parabolic" ) {
            this.p1.x = this.center.x-0.5*this.width*Math.cos(this.angle)+0.5*this.depth*Math.sin(this.angle);
            this.p1.y = this.center.y-0.5*this.width*Math.sin(this.angle)-0.5*this.depth*Math.cos(this.angle);
            this.p2.x = this.center.x-0.5*this.depth*Math.sin(this.angle);
            this.p2.y = this.center.y+0.5*this.depth*Math.cos(this.angle);
            this.p3.x = this.center.x+0.5*this.width*Math.cos(this.angle)+0.5*this.depth*Math.sin(this.angle);
            this.p3.y = this.center.y+0.5*this.width*Math.sin(this.angle)-0.5*this.depth*Math.cos(this.angle);
        }

        this.mirror = this.level.paper.path();
        this.glass = this.level.paper.path();
        
        this.mirror.attr({'stroke':this.color.hexString(),
                          'stroke-width':2});
        this.glass.attr({'stroke':this.color.hexString(),
                         'stroke-width':10,
                         'stroke-opacity':0.5});
        if( this.type == "linear" ) {
            this.mirror.attr({'path':'M'+(this.center.x-0.5*this.width*Math.cos(this.angle))+','+(this.center.y-0.5*this.width*Math.sin(this.angle))
                              +'l'+(this.width*Math.cos(this.angle))+','+(this.width*Math.sin(this.angle))});
            this.glass.attr({'path':'M'+(this.center.x-0.5*this.width*Math.cos(this.angle))+','+(this.center.y-0.5*this.width*Math.sin(this.angle))
                             +'l'+(this.width*Math.cos(this.angle))+','+(this.width*Math.sin(this.angle))});
        } else if( this.type == "parabolic" ) {
            this.mirror.attr({'path':'M'+(this.p1.x)+','+(this.p1.y)+'Q'+(this.p2.x)+','+(this.p2.y)+' '+(this.p3.x)+','+(this.p3.y)});
            this.glass.attr({'path':'M'+(this.p1.x)+','+(this.p1.y)+'Q'+(this.p2.x)+','+(this.p2.y)+' '+(this.p3.x)+','+(this.p3.y)});
        }
        
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
                    this.draw();
                    this.level.resolve();
                },function(x,y,e){
                    var element = document.getElementById('canvas');
                    this.start.angle = Math.atan2(y-element.offsetTop-this.center.y,x-element.offsetLeft-this.center.x)-this.angle;
                },function(e){},this,this,this);
        }
        
    }
        


    // ********** Mirror methods **********

    // if the beam intersects this mirror, return the length of the beam, and the tangent angle 
    // of the intersection point, otherwise return [NaN,NaN]
    this.find_tangent = function(beam) {

        if( this.type == "linear" ) {
            // if the beam and mirror are parallel, there is no interaction
            var diff = Math.abs(beam.angle - this.angle);
            if( (diff/Math.PI)%1 < 1e-4 )
                return [NaN,NaN];
            
            var s2 = Math.sin(this.angle-beam.angle);
            
            var mirror_intersection = (Math.sin(beam.angle)*(this.center.x-beam.origin.x)
                                       -Math.cos(beam.angle)*(this.center.y-beam.origin.y))/s2;
            if( mirror_intersection > 0.5*this.width || mirror_intersection < -0.5*this.width )
                return [NaN,NaN];
            
            var t = (Math.cos(this.angle)*(beam.origin.y-this.center.y) - Math.sin(this.angle)*(beam.origin.x-this.center.x))/s2;
            if( t > 1e-8 ) 
                return [t,this.angle];
            else
                return [NaN,NaN];

        } else if( this.type == "parabolic" ) {

            var m1 = {x:this.p1.x-2*this.p2.x+this.p3.x, y:this.p1.y-2*this.p2.y+this.p3.y};
            var m2 = {x:2*this.p2.x-2*this.p1.x, y:2*this.p2.y-2*this.p1.y};
            var m3 = {x:this.p1.x, y:this.p1.y};
            var l1 = {x:Math.cos(beam.angle), y:Math.sin(beam.angle)};
            var l2 = beam.origin;
            
            var a = cross(m1,l1), b = cross(m2,l1), c = cross(m3,l1) + cross(l1,l2);
            
            // if the line doesn't intersect the parabola
            if( b*b-4*a*c < -1e-8 )
                return [NaN,NaN];
            
            // if the line intersects only one spot
            if( Math.abs(b*b-4*a*c) < 1e-8 ) {
                var s = -b/(2*a), t = -1;
                if( s < 0 || s > 1 )
                    return [NaN,NaN];
                if( Math.abs(l1.x) > 1e-8 )
                    t = (m1.x*s*s+m2.x*s+m3.x-l2.x)/l1.x;
                else
                    t = (m1.y*s*s+m2.y*s+m3.y-l2.y)/l1.y;
                
                var tangent_angle = Math.atan2(2*(1-s)*(this.p2.y-this.p1.y)+2*s*(this.p3.y-this.p2.y),
                                               2*(1-s)*(this.p2.x-this.p1.x)+2*s*(this.p3.x-this.p2.x));
                return t>1e-8?[t,tangent_angle]:[NaN,NaN];
            }
            if( Math.abs(a) < 1e-8 ) {
                var s = -c/b;
                if( s < 0 || s > 1 )
                    return [NaN,NaN];
                if( Math.abs(l1.x) > 1e-8 )
                    t = (m1.x*s*s+m2.x*s+m3.x-l2.x)/l1.x;
                else
                    t = (m1.y*s*s+m2.y*s+m3.y-l2.y)/l1.y;
                var tangent_angle = Math.atan2(2*(1-s)*(this.p2.y-this.p1.y)+2*s*(this.p3.y-this.p2.y),
                                               2*(1-s)*(this.p2.x-this.p1.x)+2*s*(this.p3.x-this.p2.x));
                return t>1e-8?[t,tangent_angle]:[NaN,NaN];
            }
            
            // if the line intersects two spots
            var s1 = (-b + Math.sqrt(b*b-4*a*c))/(2*a), s2 = (-b - Math.sqrt(b*b-4*a*c))/(2*a)
            var t1 = -1, t2 = -1;
            
            if( Math.abs(l1.x) > 1e-8 ) {
                t1 = (m1.x*s1*s1+m2.x*s1+m3.x-l2.x)/l1.x;
                t2 = (m1.x*s2*s2+m2.x*s2+m3.x-l2.x)/l1.x;
            } else {
                t1 = (m1.y*s1*s1+m2.y*s1+m3.y-l2.y)/l1.y;
                t2 = (m1.y*s2*s2+m2.y*s2+m3.y-l2.y)/l1.y;
            }
            
            // order the intersections along the beam
            var tmp;
            if( t1 > t2 ) {
                tmp = t2; t2 = t1; t1 = tmp;
                tmp = s2; s2 = s1; s1 = tmp;
            }
            
            if( s1 > 0 && s1 < 1 && t1 > 1e-8 ) {
                var tangent_angle = Math.atan2(2*(1-s1)*(this.p2.y-this.p1.y)+2*s1*(this.p3.y-this.p2.y),
                                               2*(1-s1)*(this.p2.x-this.p1.x)+2*s1*(this.p3.x-this.p2.x));
                return [t1,tangent_angle];
            }
            if( s2 > 0 && s2 < 1 && t2 > 1e-8 ) {
                var tangent_angle = Math.atan2(2*(1-s2)*(this.p2.y-this.p1.y)+2*s2*(this.p3.y-this.p2.y),
                                               2*(1-s2)*(this.p2.x-this.p1.x)+2*s2*(this.p3.x-this.p2.x));
                return [t2,tangent_angle];
            }
            
            return [NaN,NaN];

        }


    }

    // erase this mirror from the canvas
    this.erase = function() {
        this.mirror.remove();
        this.glass.remove();
        this.handle.remove();
        this.rotation_cue.remove();
        this.level.resolveBeams();
        this.level.resolveGoals();
    };

    // redraw the mirror
    this.draw = function() {

        if( this.type == "parabolic" ) {
            this.p1.x = this.center.x-0.5*this.width*Math.cos(this.angle)+0.5*this.depth*Math.sin(this.angle);
            this.p1.y = this.center.y-0.5*this.width*Math.sin(this.angle)-0.5*this.depth*Math.cos(this.angle);
            this.p2.x = this.center.x                                    -0.5*this.depth*Math.sin(this.angle);
            this.p2.y = this.center.y                                    +0.5*this.depth*Math.cos(this.angle);
            this.p3.x = this.center.x+0.5*this.width*Math.cos(this.angle)+0.5*this.depth*Math.sin(this.angle);
            this.p3.y = this.center.y+0.5*this.width*Math.sin(this.angle)-0.5*this.depth*Math.cos(this.angle);
        }

        if( this.type == "linear" ) {
            this.glass.attr({'path':'M'+(this.center.x-0.5*this.width*Math.cos(this.angle))+','+(this.center.y-0.5*this.width*Math.sin(this.angle))
                             +'l'+(this.width*Math.cos(this.angle))+','+(this.width*Math.sin(this.angle))});
            this.mirror.attr({'path':'M'+(this.center.x-0.5*this.width*Math.cos(this.angle))+','+(this.center.y-0.5*this.width*Math.sin(this.angle))
                              +'l'+(this.width*Math.cos(this.angle))+','+(this.width*Math.sin(this.angle))});
        } else if( this.type == "parabolic" ) {
            this.glass.attr({'path':'M'+(this.p1.x)+','+(this.p1.y)+'Q'+(this.p2.x)+','+(this.p2.y)+' '+(this.p3.x)+','+(this.p3.y)});
            this.mirror.attr({'path':'M'+(this.p1.x)+','+(this.p1.y)+'Q'+(this.p2.x)+','+(this.p2.y)+' '+(this.p3.x)+','+(this.p3.y)});
        }
        this.handle.attr({'cx':this.center.x,'cy':this.center.y,'fill-opacity':(this.moveable&3)?0.25:0});
        this.rotation_cue.attr('path','M'+(this.center.x+20*Math.cos(this.angle+0.5))+','+(this.center.y+20*Math.sin(this.angle+0.5))
                               +'A20,20,0,0,0,'+(this.center.x+20*Math.cos(this.angle-0.5))+','+(this.center.y+20*Math.sin(this.angle-0.5))
                               +'M'+(this.center.x-20*Math.cos(this.angle+0.5))+','+(this.center.y-20*Math.sin(this.angle+0.5))
                               +'A20,20,0,0,0,'+(this.center.x-20*Math.cos(this.angle-0.5))+','+(this.center.y-20*Math.sin(this.angle-0.5)));
    };

};

function cross(v1,v2) {
    return v1.x*v2.y-v1.y*v2.x;
};
