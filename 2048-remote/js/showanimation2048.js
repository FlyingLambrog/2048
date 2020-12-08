function showNumberWithAnimation( i , j , randNumber ){
    var numberCell = $('#local_number-cell-'+ i + "-" + j);

    numberCell.css('background-color',getNumberBackgroundColor( randNumber ) );
    numberCell.css('color',getNumberColor( randNumber ) );
    numberCell.text( randNumber );

		numberCell.animate({
			width:"100px",
			height:"100px",
			top:getPosTop( i , j ),
			left:getPosLeft( i , j )
		},100);
}

function showMoveAnimation( fromx , fromy , tox ,toy ){

    var numberCell = $('#local_number-cell-' + fromx + '-' + fromy );
    numberCell.animate({
        top:getPosTop( tox , toy ),
        left:getPosLeft( tox , toy )
    },200);
}

function updateScore(score){
    $('#local_score').text(score);
    socket.emit('updatescore', { score: score });
}

function updateTime(time) {
	$('#local_time').text(time);
    socket.emit('time', { time: time });
}

function reshowNumberWithAnimation( i , j , randNumber ){
    var numberCell = $('#remote_number-cell-'+ i + "-" + j);

    numberCell.css('background-color',getNumberBackgroundColor( randNumber ) );
    numberCell.css('color',getNumberColor( randNumber ) );
    numberCell.text( randNumber );

    numberCell.animate({
        width:"100px",
        height:"100px",
        top:getPosTop( i , j ),
        left:getPosLeft( i , j )
    },100);
}

function reupdateScore(score){
    $('#remote_score').text(score);
}

function reupdateTime(retime){
    $('#remote_time').text(retime);
}