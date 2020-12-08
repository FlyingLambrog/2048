//主要操作对方区域面板，remote
var reboard = new Array(); 
var rescore = 0;
var retime = 0;

$(document).ready(function(){
    for( var i = 0 ; i < 4 ; i ++)
    for( var j = 0 ; j < 4 ; j ++){

        var gridCell = $("#remote_grid-cell-"+i+"-"+j);
        gridCell.css('top',getPosTop( i , j ) );
        gridCell.css('left',getPosLeft( i , j ) );
    }

})

socket.on('update', function(data) {
      reboard = data.board.slice();
      reupdateBoardView();
});

socket.on('time', function(data) {
    retime = data.time;
    reupdateTime(retime);
});

socket.on('starttime', function(data) {
	origin =1;
	document.getElementById("start").style.background="#DC143C";//红
});

socket.on('updatescore', function(data) {
      rescore = data.score;
      reupdateScore(rescore);
});

socket.on('generate', function(data) {
    reboard[data.randx][data.randy] = data.randNumber;
    reshowNumberWithAnimation( data.randx , data.randy , data.randNumber );
});

socket.on('level', function(data) {
	level = data.level;
	$('#level').text("Level " + (level+1));
        switch (level) {
            case 0:
                addTiles = 1;
                addTilesnums = 2;
                break;
            case 1:
                addTiles = 2;
                addTilesnums = 2;
                break;
            case 2:
                addTiles = 2;
                addTilesnums = 3;
                break;
        }
});

socket.on('newgame', function(data) {
	init();
	origin = 0;
	document.getElementById("start").style.background="#8f7a66";//棕
	local = 0;
	remote = 0;
    //在随机两个格子生成数字
    generateOneNumber();
    generateOneNumber();
    document.getElementById('local_gameover').innerHTML = '';
	document.getElementById('remote_gameover').innerHTML = '';
});

socket.on('local', function(data) {
	remote = 1;
	document.getElementById('remote_gameover').innerHTML = '对方已结束';
});

function reupdateBoardView(){

    $(".remote_number-cell").remove();
    for( var i = 0 ; i < 4 ; i ++)
    for( var j = 0 ; j < 4 ; j ++){
        $("#remote_grid-container").append('<div class="remote_number-cell" id="remote_number-cell-'+i+'-'+j+'"></div>')
        var theNumberCell = $('#remote_number-cell-'+i+'-'+j);

        if( reboard [i][j] == 0){
            theNumberCell.css('width','0px');
            theNumberCell.css('height','0px');
            theNumberCell.css('top',getPosTop(i,j) + 50 );
            theNumberCell.css('tleft',getPosLeft(i,j) + 50 );
        }
        else{
            theNumberCell.css('width','100px');
            theNumberCell.css('height','100px');
            theNumberCell.css('top',getPosTop(i,j) );
            theNumberCell.css('left',getPosLeft(i,j) );
            theNumberCell.css('background-color',getNumberBackgroundColor( reboard[i][j]));
            theNumberCell.css('color',getNumberColor( reboard[i][j]));
            theNumberCell.text( reboard[i][j]);
        }
    }
}




