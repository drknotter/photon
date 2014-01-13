function Game(paper) {

    this.paper = paper;
    //this.background = b;
    //this.playground = p;
    //this.foreground = f;
    this.current_level = 0;
    this.levels = [];

    this.previous_button;
    this.reset_button;
    this.level_select_button;
    this.next_button;
    
    this.level_cleared_lock = false;
    
    this.play = function() {

        var w = this.paper.width, h = this.paper.height;
        this.paper.text(0.5*w,0.15*h,'Photon')
            .attr({'font-size':0.15*h,'font-weight':'bold','fill':'#fff'});

        this.level_select();
        
    };

    this.level_select = function() {
                
        //this.paper.clear();

        var rows = 3, cols = 5;
        var size = 80, spacing = 10;
        var origin = {x:this.paper.width/2-cols/2*size-(cols-1)/2*spacing,
                      y:this.paper.height/2-rows/2*size-(rows-1)/2*spacing};

        var this_game = this, r=0, c=0;
        for( var i=0; i<this.levels.length; i++ ) {
            this.paper.set(
                this.paper.rect((size+spacing)*c+origin.x,(size+spacing)*r+origin.y,size,size,0.1*size)
                    .attr({'fill':'#aaa','stroke':'none'}),
                this.paper.text((size+spacing)*c+0.5*size+origin.x,(size+spacing)*r+0.5*size+origin.y,i+1)
                    .attr({'font-size':0.6*size,'fill':'#000','stroke':'none'})
            ).data('index',i)
                .attr({'cursor':'pointer'})
                .click(function(){
                    this_game.current_level = this.data('index');
                    this_game.levels[this_game.current_level].load()});
            c = (c+1) % cols;
            if( c == 0 ) r = (r+1) % rows;
        }
        
        
    };

    this.level_cleared = function() {

        if( this.level_cleared_lock ) {
            return;
        }
        this.level_cleared_lock = true;

        console.log('level_cleared called');
        var w = this.paper.width, h = this.paper.height;
        var self = this;

        this.paper.rect(0,0,w,h)
            .attr({'fill':'#000','opacity':0.75});
        this.paper.text(0.5*w,0.15*h,'Level '+(this.current_level+1)+': Cleared!')
            .attr({'font-size':0.1*h,'fill':'#fff'});
        this.previous_button = PreviousButton(this.paper,0.5*w-95,0.25*h,40);
        this.previous_button.attr({cursor:'default'});
        if( this.current_level > 0 ) {
            this.previous_button.attr({cursor:'pointer'})
                .hover(function(){self.previous_button.animate({opacity:1},250);},
                       function(){self.previous_button.animate({opacity:0.5},250);})
                .click(function(){
                    self.current_level -= 1;
                    self.levels[self.current_level].load();
                });
        }
        this.reset_button = ResetButton(this.paper,0.5*w-45,0.25*h,40);
        this.reset_button
            .hover(function(){self.reset_button.animate({opacity:1},250);},
                   function(){self.reset_button.animate({opacity:0.5},250);})
            .click(function(){self.levels[self.current_level].load();});
        this.level_select_button = LevelSelectButton(this.paper,0.5*w+5,0.25*h,40);
        this.level_select_button
            .hover(function(){self.level_select_button.animate({opacity:1},250);},
                   function(){self.level_select_button.animate({opacity:0.5},250);})
            .click(function(){
                self.previous_button.unhover().unclick()
                    .attr({cursor:'default'});
                self.reset_button.unhover().unclick()
                    .attr({cursor:'default'});
                self.level_select_button.unhover().unclick()
                    .attr({cursor:'default'});
                self.next_button.unhover().unclick()
                    .attr({cursor:'default'});
                self.level_select();
            });
        this.next_button = NextButton(this.paper,0.5*w+55,0.25*h,40);
        this.next_button.attr({cursor:'default'});
        if( this.current_level < this.levels.length-1 ) {
            this.next_button.attr({cursor:'pointer'})
                .hover(function(){self.next_button.animate({opacity:1},250);},
                       function(){self.next_button.animate({opacity:0.5},250);})
                .click(function(){
                    self.current_level += 1;
                    self.levels[self.current_level].load();
                });
        }

        
    };

};