var MAX_DEPTH = 15;

function Level(game) {

    this.goals = [];
    this.beams = [];
    this.mirrors = [];
    this.filters = [];
    this.prisms = [];
    this.game = game;
    this.paper = game.paper;
    this.reset_button;
    this.level_select_button;

    this.game.levels.push(this);

    this.load = function() {

        this.game.level_cleared_lock = false;
        this.paper.clear();

        var self = this;
        this.reset_button = ResetButton(this.paper,10,10,30);
        this.reset_button
            .hover(function(){self.reset_button.animate({opacity:1},250);},
                   function(){self.reset_button.animate({opacity:0.5},250);})
            .click(function(){self.load();});

        this.level_select_button = LevelSelectButton(this.paper,50,10,30);
        this.level_select_button
            .hover(function(){self.level_select_button.animate({opacity:1},250);},
                   function(){self.level_select_button.animate({opacity:0.5},250);})
            .click(function(){
                var w = self.paper.width, h = self.paper.height;
                self.paper.rect(0,0,w,h).attr({'fill':'#000','opacity':0.75});
                self.paper.text(0.5*w,0.15*h,'Photon')
                    .attr({'font-size':0.15*h,'font-weight':'bold','fill':'#fff'});
                self.game.level_select();});
        
        for( var g=0; g<this.goals.length; g++ )
            this.goals[g].initialize();

        for( var b=0; b<this.beams.length; b++ )
            this.beams[b].initialize();

        for( var m=0; m<this.mirrors.length; m++ )
            this.mirrors[m].initialize();

        for( var f=0; f<this.filters.length; f++ )
            this.filters[f].initialize();

        for( var p=0; p<this.prisms.length; p++ )
            this.prisms[p].initialize();

        this.resolve();

    };
    
    this.resolve = function() {
        this.resolveBeams();
        this.resolveGoals();
    };
    
    this.resolveBeams = function() {
    
        for( var b=0; b<this.beams.length; b++ ) {
            this.resolveBeam(this.beams[b],0); // resolve this beam
        }
        
    };
    
    this.resolveBeam = function(beam,depth) {

        // clear any existing children
        for( var i=0; i<beam.children.length; i++ ) {
            beam.children[i].erase();
        }
        beam.children = [];
        
        var closest_index = -1;
        var closest_intersection = 1e7;
        var tangent_angle = NaN;
        var traveling_into = NaN;
        var intersection_type = '';
        var this_intersection;
        
        // find the closest intersection point with a mirror, if any
        for( var m=0; m<this.mirrors.length; m++ ) {
            this_intersection = this.mirrors[m].find_tangent(beam);
            if( this_intersection[0] > 1e-8 && this_intersection[0] < closest_intersection ) {
                closest_intersection = this_intersection[0];
                tangent_angle = this_intersection[1];
                closest_index = m;
                intersection_type = 'mirror';
            }
        }

        for( var f=0; f<this.filters.length; f++ ) {
            this_intersection = this.filters[f].find_tangent(beam);
            if( this_intersection > 1e-8 && this_intersection < closest_intersection ) {
                closest_intersection = this_intersection;
                closest_index = f;
                intersection_type = 'filter';
            }
        }

        for( var p=0; p<this.prisms.length; p++ ) {
            this_intersection = this.prisms[p].find_tangent(beam);
            if( this_intersection[0] > 1e-8 && this_intersection[0] < closest_intersection ) {
                closest_intersection = this_intersection[0];
                tangent_angle = this_intersection[1];
                traveling_into = this_intersection[2];
                closest_index = p;
                intersection_type = 'prism';
            }
        }
        
        // if there is an intersection
        if( closest_index >= 0 ) {
            beam.extent = closest_intersection;

            if( depth > MAX_DEPTH ) {
                beam.draw();
                return;
            }
        
            if( intersection_type == 'mirror' ) {
                // handle children from here
                
                var childColor1 = beam.color.and(this.mirrors[closest_index].color);
                var childColor2 = beam.color.not(this.mirrors[closest_index].color);
                for( var h=0; h<=274; h++ ) {
                    if( childColor1.spectrum[h] ) {
                        var child = new Beam({x:beam.extent*Math.cos(beam.angle)+beam.origin.x,y:beam.extent*Math.sin(beam.angle)+beam.origin.y},
                                             2*tangent_angle-beam.angle,1e5,childColor1,beam.intensity*(1-1/MAX_DEPTH),-1,0,this);
                        beam.children.push(child);
                        beam.children[beam.children.length-1].initialize();
                        this.resolveBeam(beam.children[beam.children.length-1],depth+1);
                        break;
                    }
                }
                for( var h=0; h<=274; h++ ) {
                    if( childColor2.spectrum[h] ) {
                        var child = new Beam({x:beam.extent*Math.cos(beam.angle)+beam.origin.x,y:beam.extent*Math.sin(beam.angle)+beam.origin.y},
                                             beam.angle,1e5,childColor2,beam.intensity*(1-1/MAX_DEPTH),-1,0,this);
                        beam.children.push(child);
                        beam.children[beam.children.length-1].initialize();
                        this.resolveBeam(beam.children[beam.children.length-1],depth+1);
                        break;
                    }
                }

            } else if( intersection_type == 'filter' ) {
                
                var childColor = beam.color.and(this.filters[closest_index].color);
                for( var h=0; h<=274; h++ ) {
                    if( childColor.spectrum[h] ) {
                        var child = new Beam({x:beam.extent*Math.cos(beam.angle)+beam.origin.x,y:beam.extent*Math.sin(beam.angle)+beam.origin.y},
                                             beam.angle,1e5,childColor,beam.intensity*(1-1/MAX_DEPTH),-1,0,this);
                        beam.children.push(child);
                        beam.children[0].initialize();
                        this.resolveBeam(beam.children[0],depth+1);
                        break;
                    }
                }
                
            } else if( intersection_type == 'prism' ) {

                var refractive_index, w, p = this.prisms[closest_index];
                var in_normal_angle, out_beam_angle, ratio;
                for( var hue in beam.color.spectrum ) {

                    w = HUE_TO_WAVELENGTH[hue];
                    refractive_index = Math.sqrt(1 + p.coefficients.b1*w*w/(w*w-p.coefficients.c1) 
                                                 + p.coefficients.b2*w*w/(w*w-p.coefficients.c2) 
                                                 + p.coefficients.b3*w*w/(w*w-p.coefficients.c3));

                    if( traveling_into ) {
                        in_normal_angle = beam.angle-(tangent_angle+Math.PI/2);
                        ratio = Math.sin(in_normal_angle)/refractive_index;

                        if( ratio < -1 || ratio > 1 ) { // total internal reflection
                            out_beam_angle = 2*tangent_angle-beam.angle;
                        } else {
                            out_beam_angle = Math.asin(ratio)+(tangent_angle+Math.PI/2);
                        }
                        
                    } else {
                        in_normal_angle = beam.angle-(tangent_angle-Math.PI/2);
                        ratio = Math.sin(in_normal_angle)*refractive_index;

                        if( ratio < -1 || ratio > 1 ) { // total internal reflection
                            out_beam_angle = 2*tangent_angle-beam.angle;
                        } else {
                            out_beam_angle = Math.asin(ratio)+(tangent_angle-Math.PI/2);
                        }

                    }

                    var s = new Object();
                    s[hue] = 1;
                    var c = new Color(s);
                    beam.children.push(new Beam({x:beam.extent*Math.cos(beam.angle)+beam.origin.x,
                                                 y:beam.extent*Math.sin(beam.angle)+beam.origin.y},
                                                out_beam_angle,1e5,c,beam.intensity*(1-1/MAX_DEPTH),-1,0,this));
                    beam.children[beam.children.length-1].initialize();
                    this.resolveBeam(beam.children[beam.children.length-1],depth+1);

                }

            }

        } else {
            beam.extent = 1e5;
        }
        beam.draw();
        
        
    };

    this.resolveGoals = function() {
        
        var n_intersections;
        for( var g=0; g<this.goals.length; g++ ) {
            
            n_intersections = 0;
            for( var b=0; b<this.beams.length; b++ ) {
                n_intersections += this.goals[g].intersections(this.beams[b]);
            }
            
            this.goals[g].set_intersections(n_intersections);
            
        }

    };

    this.check_solved = function() {
        
        var n_satisfied = 0;
        for( var g=0; g<this.goals.length; g++ ) {
            if( this.goals[g].n_intersections >= this.goals[g].n_required )
                n_satisfied++;
        }
        if( n_satisfied == this.goals.length ) {
            for( var g=0; g<this.goals.length; g++ ) {
                if( this.goals[g].wedge.status().length > 0 )
                    return;
            }
            for( var b=0; b<this.beams.length; b++ ) {
                this.beams[b].handle.undrag();
                this.beams[b].diffuse.undrag();
            }
            for( var m=0; m<this.mirrors.length; m++ ) {
                this.mirrors[m].handle.undrag();
                this.mirrors[m].glass.undrag();
            }
            this.game.level_cleared();
        }

    };
    
}