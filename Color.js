function Color(spectrum) {

    this.spectrum = spectrum || {};

};

Color.prototype.add = function(other) {
    
    var out = new Color();
    
    for( var h=0; h<=274; h++ ) {
        if( this.spectrum[h] && other.spectrum[h] )
            out.spectrum[h] = this.spectrum[h] + other.spectrum[h];
        else if( this.spectrum[h] )
            out.spectrum[h] = this.spectrum[h];
        else if( other.spectrum[h] )
            out.spectrum[h] = other.spectrum[h];
    }
    
    return out;
    
};

Color.prototype.and = function(other) {
    
    var out = new Color();
    
    for( var h=0; h<=274; h++ ) {
        if( this.spectrum[h] && other.spectrum[h] )
            out.spectrum[h] = 1;
    }
    
    return out;
    
};

Color.prototype.or = function(other) {
    
    var out = new Color();
    
    for( var h=0; h<=274; h++ ) {
        if( this.spectrum[h] || other.spectrum[h] )
            out.spectrum[h] = 1;
    }
    
    return out;
    
};

Color.prototype.not = function(other) {
    
    var out = new Color();
    
    for( var h=0; h<=274; h++ ) {
        if( this.spectrum[h] && !other.spectrum[h] ) 
            out.spectrum[h] = 1;
    }
    
    return out;
    
};

Color.prototype.hexString = function() {
    
    var x = 0, y = 0, count = 0;
    for( var h=0; h<=274; h++ ) {
        if( this.spectrum[h] ) {
            x += this.spectrum[h]*Math.cos(Math.PI*h/180);
            y += this.spectrum[h]*Math.sin(Math.PI*h/180);
            count++;
        }
    }
    if( count > 0 ) {
        x /= count;
        y /= count;
    }
    var hue = Math.atan2(y,x);
    if( hue < 0 ) hue += 2*Math.PI;
    var saturation = Math.min(Math.sqrt(x*x+y*y),1);
    
    return Raphael.hsb2rgb(0.5*hue/Math.PI,saturation,1).hex;
    
}

Color.RED = new Color({0:1});
Color.YELLOW = new Color({60:1});
Color.GREEN = new Color({120:1});
Color.CYAN = new Color({180:1});
Color.BLUE = new Color({240:1});
Color.VIOLET = new Color({274:1});
Color.WHITE = new Color({0:1,60:1,120:1,180:1,240:1,274:1});

Color.HUE_TO_WAVELENGTH = new Object();
for( var h=0; h<60; h++ ) { // 660 to 582 (RED to YELLOW)
    Color.HUE_TO_WAVELENGTH[h] = (582-660)*h/60 + 660;
}
for( var h=60; h<120; h++ ) { // 582 to 520 (YELLOW to GREEN)
    Color.HUE_TO_WAVELENGTH[h] = (520-582)*(h-60)/(120-60) + 582;
}
for( var h=120; h<180; h++ ) { // 520 to 490 (GREEN to CYAN)
    Color.HUE_TO_WAVELENGTH[h] = (490-520)*(h-120)/(180-120) + 520;
}
for( var h=180; h<240; h++ ) { // 490 to 450 (CYAN to BLUE)
    Color.HUE_TO_WAVELENGTH[h] = (450-490)*(h-180)/(240-180) + 490;
}
for( var h=240; h<=274; h++ ) { // 450 to 400 (BLUE to VIOLET)
    Color.HUE_TO_WAVELENGTH[h] = (400-450)*(h-240)/(274-240) + 450;
}