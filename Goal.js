function Goal(position,radius,n_required,color,level) {

    this.position = position;
    this.radius = radius;
    this.n_required = n_required;
    this.n_intersections = 0;
    this.color = color;
    this.level = level;

    this.wedge;
    this.boundary;
    
    this.initialize = function() {
    
        this.position = position;
        this.radius = radius;
        this.n_required = n_required;
        this.n_intersections = 0;
        this.color = color;
        
        this.wedge = this.level.paper.path();
        this.wedge.attr({wedge:[this.position.x, this.position.y, this.radius, 2*Math.PI*this.n_intersections/this.n_required],opacity:0.5,fill:this.color.hexString(),stroke:'none'});
        
        this.boundary = this.level.paper.circle(this.position.x,this.position.y,this.radius);
        this.boundary.attr({'fill':'none','stroke':this.color.hexString(),'stroke-width':3});
        
    };
    
};

// ********** Goal methods **********

// determine if a beam intersects this goal
Goal.prototype.intersections = function(beam) {
    
    var num_intersections = 0;
    for( var c=0; c<beam.children.length; c++ ) {
        num_intersections += this.intersections(beam.children[c]);
    }
    
    // if the beam has a color component which does not match this goal, 
    // then this beam cannot match this goal
    for( var h=0; h<=274; h++ ) {
        if( (beam.color.spectrum[h] && !this.color.spectrum[h])
            || (!beam.color.spectrum[h] && this.color.spectrum[h]) )
            return num_intersections;
    }
    
    var t = (this.position.x-beam.origin.x)*Math.cos(beam.angle) + (this.position.y-beam.origin.y)*Math.sin(beam.angle);
    
    var closest_point = new Object();
    if( t < 0 ) t = 0;
    if( t > beam.extent ) t = beam.extent;
    
    closest_point.x = Math.cos(beam.angle)*t + beam.origin.x;
    closest_point.y = Math.sin(beam.angle)*t + beam.origin.y;
    var squared_distance = (closest_point.x-this.position.x)*(closest_point.x-this.position.x) + (closest_point.y-this.position.y)*(closest_point.y-this.position.y)
    if( squared_distance < this.radius*this.radius ) {
        num_intersections += 1;
    }
    
    return num_intersections;
    
};

// erase this goal from the paper
Goal.prototype.erase = function() {
    this.wedge.remove();
    this.boundary.remove();
};

// redraw the goal
Goal.prototype.draw = function() {
    this.wedge.attr({wedge:[this.position.x, this.position.y, this.radius, 2*Math.PI*this.n_intersections/this.n_required]});
    this.boundary.attr({'cx':this.position.x,'cy':this.position.y,'r':this.radius});
};

// set the number of intersecting beams
Goal.prototype.set_intersections = function(n) {
    if( n != this.n_intersections ) {
        this.n_intersections = n;
        this.wedge.stop();
        var self = this;
        this.wedge.animate({wedge:[this.position.x, this.position.y, this.radius, 2*Math.PI*Math.min(this.n_intersections/this.n_required,1)]},
                           2000,'ease-out',function(){
                               self.level.check_solved();
                           });
    }
};
