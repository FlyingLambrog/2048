var board = [];
var score = 0;
var hasConflicted = [];
var level = 0;
var addTiles = 1;   //默认随机方块数量
var addTilesnums = 2;  //默认随机方块的数字
var has2048 = false;
var over = false;

$(document).ready(function () {
    $('#level').bind('click', function () {
        level = (level + 1) % 3;
        $(this).html("Level " + (level+1))
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
        newGame();
    });
    $('#restart-button').bind('click', function () {
        newGame();
    })
    newGame();
})

function newGame() {
    //初始化棋盘
    init();
    score = 0;
    updateScore(score);
    //在随机两个格子生成数字
    generateOneNumber();
    generateOneNumber();
}


function init() {
    let i, j;
    for (i = 0; i < 4; i++) {
        for (j = 0; j < 4; j++) {

            var gridCell = $("#grid-cell-" + i + "-" + j);
            gridCell.css('top', getPosTop(i));
            gridCell.css('left', getPosLeft(j));
        }
    }

    for (i = 0; i < 4; i++) {
        board[i] = [];
        hasConflicted[i] = [];
        for (j = 0; j < 4; j++) {
            board[i][j] = 0;
            hasConflicted[i][j] = false;
        }
    }


    updateBoardView();

    score = 0;
    has2048 = false;
    over = false;
    $('#title').css("color", "#776e65");
}

function updateBoardView() {

    $(".number-cell").remove();
    for (var i = 0; i < 4; i++)
        for (var j = 0; j < 4; j++) {
            $("#grid-container").append('<div class="number-cell" id="number-cell-' + i + '-' + j + '"></div>')
            var theNumberCell = $('#number-cell-' + i + '-' + j);

            if (board [i][j] === 0) {
                theNumberCell.css('width', '0px');
                theNumberCell.css('height', '0px');
                theNumberCell.css('top', getPosTop(i) + 50);
                theNumberCell.css('tleft', getPosLeft(j) + 50);
            } else {
                theNumberCell.css('width', '100px');
                theNumberCell.css('height', '100px');
                theNumberCell.css('top', getPosTop(i));
                theNumberCell.css('left', getPosLeft(j));
                theNumberCell.css('background-color', getNumberBackgroundColor(board[i][j]));
                theNumberCell.css('color', getNumberColor(board[i][j]));
                theNumberCell.css('font-size', getNumberSize(board[i][j]));
                theNumberCell.text(board[i][j]);
                if (board[i][j] >= 2048) {
                    has2048 = true;
                }
            }

            hasConflicted[i][j] = false;
        }
    if (has2048) {
        $('#title').css("color", "#99FF66");
    }
}

function generateOneNumber() {
    if (noSpace(board))
        return false;

    // 随机一个位置
    var randx = parseInt(Math.floor(Math.random() * 4));
    var randy = parseInt(Math.floor(Math.random() * 4));

    var times = 0;
    while (times < 50) {
        if (board[randx][randy] === 0)
            break;

        randx = parseInt(Math.floor(Math.random() * 4));
        randy = parseInt(Math.floor(Math.random() * 4));

        times++;
    }

    if (times === 50) {
        for (var i = 0; i < 4; i++)
            for (var j = 0; j < 4; j++) {
                if (board[i][j] === 0) {
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
    showNumberWithAnimation(randx, randy, randNumber);

    return true;
}

$(document).keydown(function (incident) {
    switch (incident.keyCode) {
        case 37: //left
            event.preventDefault();
            if (moveLeft()) {
                for (let i = 0; i < addTiles; i++) {
                    setTimeout("generateOneNumber()", 210);
                    setTimeout("isgameover()", 300);
                }
            }
            break;
        case 38: //up
            event.preventDefault();
            if (moveUp()) {
                for (let i = 0; i < addTiles; i++) {
                    setTimeout("generateOneNumber()", 210);
                    setTimeout("isgameover()", 300);
                }
            }
            break;
        case 39: //right
            event.preventDefault();
            if (moveRight()) {
                for (let i = 0; i < addTiles; i++) {
                    setTimeout("generateOneNumber()", 210);
                    setTimeout("isgameover()", 300);
                }
            }
            break;
        case 40: //down
            event.preventDefault();
            if (moveDown()) {
                for (let i = 0; i < addTiles; i++) {
                    setTimeout("generateOneNumber()", 210);
                    setTimeout("isgameover()", 300);
                }
            }
            break;
        default:  //default
            break;
    }
});

function isgameover() {
    if(over) return;
    if (noSpace(board) && noMove(board)) {
        gameover();
        over = true;
    }
}

function gameover() {

    $('#popLayer').css('display', 'block');
    $('#popBox').css('display', 'block');
    $('#replay').bind('click', function () {
        $('#popLayer').css('display', 'none');
        $('#popBox').css('display', 'none');
        newGame();
    });
}

function moveLeft() {

    if (!canMoveLeft(board))
        return false;
    var tag = 0;
    var addscore = 0;
    // moveLeft
    for (var i = 0; i < 4; i++)
        for (var j = 1; j < 4; j++) {
            if (board[i][j] !== 0) {
                for (var k = 0; k < j; k++) {
                    if (board[i][k] === 0 && noBlockHorizontal(i, k, j, board)) {
                        // move
                        showMoveAnimation(i, j, i, k);
                        board[i][k] = board[i][j];
                        board[i][j] = 0;
                    } else if (board[i][k] === board[i][j] && noBlockHorizontal(i, k, j, board) && !hasConflicted[i][k]) {
                        //move
                        showMoveAnimation(i, j, i, k);
                        //add
                        board[i][k] += board[i][j];
                        board[i][j] = 0;
                        // add score
                        tag++;
                        addscore += board[i][k];
                        hasConflicted[i][k] = true;
                    }
                }
            }
        }
    score += addscore * tag;
    updateScore(score);
    setTimeout("updateBoardView()", 200);
    return true;
}

function moveUp() {
    if (!canMoveUp(board))
        return false;
    var tag = 0;
    var addscore = 0;
    for (var j = 0; j < 4; j++)
        for (var i = 1; i < 4; i++) {
            if (board[i][j] !== 0) {
                for (var k = 0; k < i; k++) {
                    if (board[k][j] === 0 && noBlockVertical(j, k, i, board)) {
                        showMoveAnimation(i, j, k, j);
                        board[k][j] = board[i][j];
                        board[i][j] = 0;
                    } else if (board[k][j] === board[i][j] && noBlockVertical(j, k, i, board) && !hasConflicted[k][j]) {
                        showMoveAnimation(i, j, k, j);
                        board[k][j] += board[i][j];
                        board[i][j] = 0;
                        // add score
                        tag++;
                        addscore += board[k][j];
                        hasConflicted[k][j] = true;
                    }
                }
            }
        }
    score += addscore * tag;
    updateScore(score);
    setTimeout("updateBoardView()", 200);
    return true;
}

function moveRight() {
    if (!canMoveRight(board))
        return false;
    var tag = 0;
    var addscore = 0;
    for (var i = 0; i < 4; i++)
        //for(var j = 0 ; j < 3; j ++ ){
        for (var j = 2; j >= 0; j--) {
            if (board[i][j] !== 0) {
                for (var k = 3; k > j; k--) {
                    if (board[i][k] === 0 && noBlockHorizontal(i, j, k, board)) {
                        showMoveAnimation(i, j, i, k);
                        board[i][k] = board[i][j];
                        board[i][j] = 0;
                    } else if (board[i][k] === board[i][j] && noBlockHorizontal(i, j, k, board) && !hasConflicted[i][k]) {
                        showMoveAnimation(i, j, i, k);
                        board[i][k] += board[i][j];
                        board[i][j] = 0;
                        // add score
                        tag++;
                        addscore += board[i][k];
                        hasConflicted[i][k] = true;
                    }
                }
            }
        }
    score += addscore * tag;
    updateScore(score);
    setTimeout("updateBoardView()", 200);
    return true;
}

function moveDown() {
    if (!canMoveDown(board))
        return false;
    var tag = 0;
    var addscore = 0;
    for (var j = 0; j < 4; j++)
        //for(var i = 0 ; i < 3; i ++ ){
        for (var i = 2; i >= 0; i--) {
            if (board[i][j] !== 0) {
                for (var k = 3; k > i; k--) {
                    if (board[k][j] === 0 && noBlockVertical(j, i, k, board)) {
                        showMoveAnimation(i, j, k, j);
                        board[k][j] = board[i][j];
                        board[i][j] = 0;
                    } else if (board[k][j] === board[i][j] && noBlockVertical(j, i, k, board) && !hasConflicted[k][j]) {
                        showMoveAnimation(i, j, k, j);
                        board[k][j] += board[i][j];
                        board[i][j] = 0;
                        // add score
                        tag++;
                        addscore += board[k][j];
                        hasConflicted[k][j] = true;
                    }
                }
            }
        }
    score += addscore * tag;
    updateScore(score);
    setTimeout("updateBoardView()", 200);
    return true;
}