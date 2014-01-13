var LOLITE = '#808080';
var HILITE = '#ffffff';

function ResetButton(paper,x,y,w) {
    var b = paper.set(
        paper.rect(0,0,100,100,20)
            .attr({fill:LOLITE,stroke:'none'}),
        paper.path('M35.25 10.6875L22.6875 32.46875L47.84375 32.5L44.21875 26.1875C54.52096 23.655925 65.596181 28.065552 71.1875 37.75C77.977629 49.510848 74.010847 64.428621 62.25 71.21875C50.489153 78.008878 35.60263 74.010848 28.8125 62.25C25.565026 56.625209 24.693983 49.961139 26.375 43.6875L16.6875 41.0625C14.321047 49.894223 15.584614 59.331694 20.15625 67.25C29.648579 83.691196 50.808805 89.336078 67.25 79.84375C83.691196 70.351421 89.367329 49.222446 79.875 32.78125C73.942295 22.505503 63.425329 16.414405 52.375 15.625C47.951674 15.30901 43.440288 15.864758 39.09375 17.3125L35.25 10.6875z')
            .attr({fill:HILITE,stroke:'none'})
    ).attr({cursor:'pointer',opacity:0.5,
            'transform':'S'+(w/100)+','+(w/100)+',0,0T'+x+','+y});
    return b;
}

function LevelSelectButton(paper,x,y,w) {
    var b = paper.set(
        paper.rect(0,0,100,100,20)
            .attr({fill:LOLITE,stroke:'none'}),
        paper.rect(15,15,30,30,6)
            .attr({fill:HILITE,stroke:'none'}),
        paper.rect(55,15,30,30,6)
            .attr({fill:HILITE,stroke:'none'}),
        paper.rect(15,55,30,30,6)
            .attr({fill:HILITE,stroke:'none'}),
        paper.rect(55,55,30,30,6)
            .attr({fill:HILITE,stroke:'none'})
    ).attr({cursor:'pointer',opacity:0.5,
            'transform':'S'+(w/100)+','+(w/100)+',0,0T'+x+','+y});
    return b;
}

function NextButton(paper,x,y,w) {
    var b = paper.set(
        paper.rect(0,0,100,100,20)
            .attr({fill:LOLITE,stroke:'none'}),
        paper.path('M29.875,17.71875A5.0005,5.0005 0 0 0 25.28125,22.71875L25.28125,77.28125A5.0005,5.0005 0 0 0 32.78125,81.625L80.03125,54.34375A5.0005,5.0005 0 0 0 80.03125,45.65625L32.78125,18.375A5.0005,5.0005 0 0 0 29.875,17.71875z')
            .attr({stroke:'none',fill:HILITE})
    ).attr({cursor:'pointer',opacity:0.5,
            'transform':'S'+(w/100)+','+(w/100)+',0,0T'+x+','+y});
    return b;
}

function PreviousButton(paper,x,y,w) {
    var b = paper.set(
        paper.rect(0,0,100,100,20)
            .attr({fill:LOLITE,stroke:'none'}),
        paper.path('M72.277465,17.720198A5.0005,5.0005 0 0 1 76.871215,22.720198L76.871215,77.282698A5.0005,5.0005 0 0 1 69.371215,81.626448L22.121215,54.345198A5.0005,5.0005 0 0 1 22.121215,45.657698L69.371215,18.376448A5.0005,5.0005 0 0 1 72.277465,17.720198z')
            .attr({stroke:'none',fill:HILITE})
    ).attr({cursor:'pointer',opacity:0.5,
           'transform':'S'+(w/100)+','+(w/100)+',0,0T'+x+','+y});
    return b;
}