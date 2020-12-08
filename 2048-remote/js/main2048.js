var socket = io('http://localhost:8080');
//var socket = io('http://holer.org:65530');

socket.on('waiting', function(str) {
  document.getElementById('waiting').innerHTML = str;
  document.getElementById('mask_title').innerHTML = '正在等待另一个玩家...';
});

var board = new Array(); //本地区域数组
var time = 0;			//计时
var score = 0;			//分数
var hasConflicted = new Array();
var level = 0;		//默认游戏难度0-2（页面上对应1-3）
var addTiles = 1;   //默认随机方块数量
var addTilesnums=1;  //默认随机方块的数字种类
var has2048 = false;
var origin = 0;		//是否开始计时，0为否，1为是
var local = 0;		//记录我方游戏状态（1为结束）
var remote = 0;		//记录对方玩家游戏状态（1为结束）
const TIME = 30;	//最大游戏时长/秒


$(document).ready(function(){
	$('#level').bind('click', function () {
        level = (level + 1) % 3;
		socket.emit('level', { level: level });
        $(this).html("Level " + (level+1))
        switch (level) {
            case 0:
                addTiles = 1;
                addTilesnums = 1;
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
    newgame();
})

window.setInterval("timecount()", 1000);

function newgame(){
    //初始化棋盘
	socket.emit('newgame');
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
}

function init(){
    for( var i = 0 ; i < 4 ; i ++)
    for( var j = 0 ; j < 4 ; j ++){

        var gridCell = $("#local_grid-cell-"+i+"-"+j);
        gridCell.css('top',getPosTop( i , j ) );
        gridCell.css('left',getPosLeft( i , j ) );
    }

    for( var i = 0 ; i < 4 ; i ++){
        board[i] = new Array();
        hasConflicted[i] = new Array();
        for ( var j = 0 ; j < 4 ; j ++){
            board[i][j] = 0;
            hasConflicted[i][j] = false;
        }
    }
            
    updateBoardView();
    score = 0;
	updateScore(score);
	time = 0;
	updateTime(time);
	has2048 = false;
    $('#title2048').css("color", "#776e65");
}

function start() {
	if(local==0) {
		socket.emit('starttime');
		origin=1;
		document.getElementById("start").style.background="#DC143C";//红
	}
}

function timecount() {
    if(origin == 1) {
    	time++;
		if(time >= TIME) {
			gameover();
		}
    	updateTime(time);
    }
}

function updateBoardView(){

    $(".local_number-cell").remove();
    for( var i = 0 ; i < 4 ; i ++)
    for( var j = 0 ; j < 4 ; j ++){
        $("#local_grid-container").append('<div class="local_number-cell" id="local_number-cell-'+i+'-'+j+'"></div>')
        var theNumberCell = $('#local_number-cell-'+i+'-'+j);

        if( board [i][j] == 0){
            theNumberCell.css('width','0px');
            theNumberCell.css('height','0px');
            theNumberCell.css('top',getPosTop(i,j) + 50 );
            theNumberCell.css('left',getPosLeft(i,j) + 50 );
		} else {
            theNumberCell.css('width','100px');
            theNumberCell.css('height','100px');
            theNumberCell.css('top',getPosTop(i,j) );
            theNumberCell.css('left',getPosLeft(i,j) );
            theNumberCell.css('background-color',getNumberBackgroundColor( board[i][j]));
            theNumberCell.css('color',getNumberColor( board[i][j]));
            theNumberCell.text( board[i][j]);
			if (board[i][j] >= 2048) {
                has2048 = true;
            }
        }

        hasConflicted[i][j] = false;
        socket.emit('update', { board: board });
    }
	if (has2048) {
        $('#title2048').css("color", "#99FF66");//绿
    }
}

function generateOneNumber(){
    if ( nospace (board) )
        return false;

    // 随机一个位置
    var randx = parseInt(Math.floor( Math.random() * 4 ));
    var randy = parseInt(Math.floor( Math.random() * 4 ));

    var times = 0;
    while ( times < 50 ) {
        if ( board[randx][randy] == 0)
            break;

        randx = parseInt(Math.floor( Math.random() * 4 ));
        randy = parseInt(Math.floor( Math.random() * 4 ));

        times ++ ;
    }

    if (times == 50){
        for (var i = 0; i < 4; i ++)
            for(var j = 0; j < 4; j ++){
                if (board[i][j] == 0){
                    randx = i;
                    randy = j;
                }
            }
    }

    // 随机一个数字
    var num_random = Math.random();
    if(addTilesnums==1){//根据难度生成数字
        var randNumber=2;
    }
    else if(addTilesnums==2){
        var randNumber=num_random<0.9 ? 2 : 4;
    }
    else if(addTilesnums==3){
        var randNumber = num_random < 0.7 ? 2 : num_random > 0.9 ? 8 : 4;
    }

    // 在随机位置显示随机数字
	//randNumber = 1024;
    board[randx][randy] = randNumber;
    showNumberWithAnimation( randx , randy , randNumber );
	socket.emit('generate', {
		randx: randx,
		randy: randy,
		randNumber: randNumber 

	});
    return true;
}

$(document).keydown( function( incident ) {
    switch( incident.keyCode ){
        case 37: //left
        if ( moveLeft() ){
            for(var i=0;i<addTiles;i++){//根据难度生成对应数量数字
                setTimeout("generateOneNumber()",210);
                setTimeout("isgameover()",300);
            }
        }
            break;
        case 38: //up
        if ( moveUp() ){
            for(var i=0;i<addTiles;i++){//根据难度生成对应数量数字
                setTimeout("generateOneNumber()",210);
                setTimeout("isgameover()",300);
			}
        }
            break;
        case 39: //right
        if ( moveRight() ){
            for(var i=0;i<addTiles;i++){//根据难度生成对应数量数字
                setTimeout("generateOneNumber()",210);
                setTimeout("isgameover()",300);
            }
        }
            break;
        case 40: //down
        if ( moveDown() ){
            for(var i=0;i<addTiles;i++){//根据难度生成对应数量数字
                setTimeout("generateOneNumber()",210);
                setTimeout("isgameover()",300);
            }
        }
            break;
        default:  //default
            break;
    }
});

function isgameover(){
    if (nospace(board) && nomove(board)){
        gameover();
    }
}

function judgeScore() {
	if(score > rescore) {
        document.getElementById('local_gameover').innerHTML = '胜利！';
    } else if(score < rescore) {
        document.getElementById('local_gameover').innerHTML = '很可惜呀，继续加油~';
    } else {
        document.getElementById('local_gameover').innerHTML = '旗鼓相当哦！';
    }
}

socket.on('over', function(data) {
    judgeScore();
});

function gameover(){
	origin = 0;
	document.getElementById("start").style.background="#8f7a66";//棕
	local = 1;
    if(time >= TIME) {
	   judgeScore();
    }
	if(remote == 1) {
		socket.emit('over');
		judgeScore();
	} else {
		document.getElementById('local_gameover').innerHTML = '请耐心等待...';
		socket.emit('local');
	}
}

function moveLeft(){

    if( !canMoveLeft(board) || origin==0 ) {
		return false;
	}
    for(var i = 0; i < 4; i ++ )
        for ( var j = 1; j < 4; j ++ ){
            if ( board[i][j] != 0){

                for ( var k = 0; k < j; k++ ){
                    if ( board[i][k] == 0 && noBlockHorizontal ( i , k , j ,board ) ) {
                        // move
                        showMoveAnimation( i , j ,  i , k );
                        board[i][k] = board[i][j];
                        board[i][j] = 0;
                        continue;                        
                    }
                    else if ( board[i][k] == board[i][j] && noBlockHorizontal( i , k , j ,board ) && !hasConflicted[i][k]) {
                        //move
                        showMoveAnimation( i , j ,  i , k );
                        //add
                        board[i][k] += board[i][j];
                        board[i][j] = 0;
                        // add score
                        score += board[i][k];
                        updateScore(score);

                        hasConflicted[i][k] = true;
                        continue;
                    }
                }
            }
        }

    setTimeout("updateBoardView()",200);
    return true;
}

function moveUp(){
    if (!canMoveUp(board) || origin==0 )
        return false;
    for(var j = 0 ; j < 4; j ++ )
        for(var i = 1 ; i < 4; i ++ ){
            if(board[i][j] != 0){
                for( var k = 0; k < i; k ++){
                    if ( board[k][j] == 0 && noBlockVertical ( j , k , i ,board ) ) {
                        showMoveAnimation( i , j ,  k , j );
                        board[k][j] = board[i][j];
                        board[i][j] = 0;
                        continue;                        
                    }
                    else if ( board[k][j] == board[i][j] && noBlockVertical(j , k , i ,board) && !hasConflicted[k][j]) {
                        showMoveAnimation( i , j ,  k , j );
                        board[k][j] += board[i][j];
                        board[i][j] = 0;
                        // add score
                        score += board[k][j];
                        updateScore(score);

                        hasConflicted[k][j] = true;
                        continue;
                    }
                }
            }
        }

    setTimeout("updateBoardView()",200);
    return true;
}

function moveRight(){
    if (!canMoveRight(board) || origin==0 )
        return false;
    for(var i = 0 ; i < 4; i ++ )
        //for(var j = 0 ; j < 3; j ++ ){
        for(var j = 2 ; j >= 0; j -- ){
            if(board[i][j] != 0){
                for( var k = 3; k > j; k --){
                    if ( board[i][k] == 0 && noBlockHorizontal ( i , j , k ,board ) ) {
                        showMoveAnimation( i , j ,  i , k );
                        board[i][k] = board[i][j];
                        board[i][j] = 0;
                        continue;
                    }
                    else if ( board[i][k] == board[i][j] && noBlockHorizontal( i , j , k ,board ) && !hasConflicted[i][k] ) {
                        showMoveAnimation( i , j ,  i , k );
                        board[i][k] += board[i][j];
                        board[i][j] = 0;
                        // add score
                        score += board[i][k];
                        updateScore(score);

                        hasConflicted[i][k] = true;
                        continue;
                    }
                }
            }
        }

    setTimeout("updateBoardView()",200);
    return true;
}

function moveDown(){
    if (!canMoveDown(board) || origin==0 )
        return false;
    for(var j = 0 ; j < 4; j ++ )
        //for(var i = 0 ; i < 3; i ++ ){
        for(var i = 2 ; i >= 0; i -- ){
            if(board[i][j] != 0){
                for( var k = 3; k > i; k --){
                    if ( board[k][j] == 0 && noBlockVertical ( j , i , k ,board ) ) {
                        showMoveAnimation( i , j ,  k , j );
                        board[k][j] = board[i][j];
                        board[i][j] = 0;
                        continue;                        
                    }
                    else if ( board[k][j] == board[i][j] && noBlockVertical( j , i , k ,board ) && !hasConflicted[k][j]) {
                        showMoveAnimation( i , j ,  k , j );
                        board[k][j] += board[i][j];
                        board[i][j] = 0;
                        // add score
                        score += board[k][j];
                        updateScore(score);

                        hasConflicted[k][j] = true;
                        continue;
                    }
                }
            }
        }

    setTimeout("updateBoardView()",200);
    return true;
}

  var onlineStatus = true;

  socket.on('start', function() {
    document.getElementById('waiting').innerHTML = '';
    document.getElementById('mask_title_wrap').style.display = 'none';
    document.getElementById('countdown_wrap').style.display = 'block';

    // 游戏开始倒计时
    var count = 4;
    var timer = setInterval(function () {
      if (onlineStatus) {
        if (count == 0) {
          document.getElementById('mask').style.display = 'none';
          clearInterval(timer);
        }
        document.getElementById('countdown').innerHTML = count--;
      } else {
        document.getElementById('mask_title_wrap').style.display = 'block';
        document.getElementById('mask_title').innerHTML = '对方掉线<a href="javascript:;" onclick="location.reload()">[重新匹配]</a>';
        document.getElementById('countdown_wrap').style.display = 'none';
        clearInterval(timer);
      }
    }, 1000);
    socket.emit('update', { board: board });
  });

  // 对方掉线
  socket.on('leave', function() {
    document.getElementById('local_gameover').innerHTML = '对方掉线';
    document.getElementById('remote_gameover').innerHTML = '已掉线';
    document.getElementById('mask_title').innerHTML = '对方掉线<a href="javascript:;" onclick="location.reload()">[重新匹配]</a>';
    onlineStatus = false;
	origin = 0;
	document.getElementById("start").style.background="#8f7a66";//棕
	local = 1;
  });

 