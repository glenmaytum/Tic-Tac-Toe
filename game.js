function init(player, OPPONENT) {
	//SELECT CANVAS
	const canvas = document.getElementById('cvs');
	const ctx = canvas.getContext('2d');

	//BOARD VARIABLES
	let board = [];
	const COLUMN = 3;
	const ROW = 3;
	const SPACE_SIZE = 150;

	//STORE PLAYER'S MOVES
	let gameData = new Array(9);

	//By default the first plater to play is the human
	let currentPlayer = player.man;

	//Load X and O images
	const xImage = new Image();
	xImage.src = 'img/X.png';
	const oImage = new Image();
	oImage.src = 'img/O.png';

	//WINNING COMBINATIONS
	combos = [ [ 0, 1, 2 ], [ 3, 4, 5 ], [ 6, 7, 8 ], [ 0, 3, 6 ], [ 1, 4, 7 ], [ 2, 5, 8 ], [ 0, 4, 8 ], [ 2, 4, 6 ] ];

	//FOR GAME OVER CHECK
	let GAME_OVER = false;

	//DRAW THE BOARD
	function drawBoard() {
		//GIVE EVERY SPACE A UNIQUE ID
		//So I know exactly where to put the player's move on the gameData array
		let id = 0;
		for (let i = 0; i < ROW; i++) {
			board[i] = [];
			for (let j = 0; j < COLUMN; j++) {
				board[i][j] = id;
				id++;

				//draw the spaces
				ctx.strokeStyle = '#000';
				ctx.strokeRect(j * SPACE_SIZE, i * SPACE_SIZE, SPACE_SIZE, SPACE_SIZE);
			}
		}
	}
	drawBoard();

	//ON PLAYER'S CLICK
	canvas.addEventListener('click', function(event) {
		//IF IT IS GAME OVER? EXIT
		if (GAME_OVER) return;

		//X & Y position of mouse click relevant to canvas NOT viewscreen
		let X = event.clientX - canvas.getBoundingClientRect().x;
		let Y = event.clientY - canvas.getBoundingClientRect().y;

		//CALCULATE i & j of the clicked SPACE
		let i = Math.floor(Y / SPACE_SIZE);
		let j = Math.floor(X / SPACE_SIZE);

		//Get the id of the space the player clicked on and
		let id = board[i][j];

		//Prevent the players from playing the same square twice.
		if (gameData[id]) return;

		//store the player's move to gameData array
		gameData[id] = currentPlayer;

		//draw the move board
		drawOnBoard(currentPlayer, i, j);

		//CHECK IF THE PLAYER WINS
		if (isWinner(gameData, currentPlayer)) {
			showGameOver(currentPlayer);
			GAME_OVER = true;
			return;
		}

		//CHECK IF IT IS A TIE
		if (isTie(gameData)) {
			showGameOver('tie');
			GAME_OVER = true;
			return;
		}

		if (OPPONENT == 'computer') {
			//Get the id of the space using the minimax algorithm
			let id = minimax(gameData, player.computer).id;

			//store the player's move to gameData array
			gameData[id] = player.computer;

			//get i and j of space
			let space = getIJ(id);

			//draw the move board
			drawOnBoard(player.computer, space.i, space.j);

			//CHECK IF THE PLAYER WINS
			if (isWinner(gameData, player.computer)) {
				showGameOver(player.computer);
				GAME_OVER = true;
				return;
			}
			//CHECK IF IT IS A TIE
			if (isTie(gameData)) {
				showGameOver('tie');
				GAME_OVER = true;
				return;
			}
		} else {
			//GIVE TURN TO THE OTHER PLAYER
			currentPlayer = currentPlayer == player.man ? player.friend : player.man;
		}
	});

	//MINIMAX
	function minimax(gameData, PLAYER) {
		//BASE
		if (isWinner(gameData, player.computer)) return { evaluation: +10 };
		if (isWinner(gameData, player.man)) return { evaluation: -10 };
		if (isTie(gameData)) return { evaluation: 0 };

		//LOOK FOR EMPTY SPACES
		let EMPTY_SPACES = getEmptySpaces(gameData);

		//save all the moves and their evaluations
		let moves = [];

		//LOOP OVER THE EMPTY SPACES TO EVALUATE THEM
		for (let i = 0; i < EMPTY_SPACES.length; i++) {
			//GET THE ID OF THE EMPTY SPACE
			let id = EMPTY_SPACES[i];

			//BACK UP THE SPACE
			let backup = gameData[id];

			//MAKE THE MOVE FOR THE PLAYER
			gameData[id] = PLAYER;

			//SAVE THE MOVE's ID AND EVALUATION
			let move = {};
			move.id = id;

			//THE MOVE EVALUATION
			if (PLAYER == player.computer) {
				move.evaluation = minimax(gameData, player.man).evaluation;
			} else {
				move.evaluation = minimax(gameData, player.computer).evaluation;
			}

			//RESTORE SPACE
			gameData[id] = backup;

			//SAVE MOVES TO MOVES ARRAY
			moves.push(move);
		}

		// MINIMAX ALGORITHM
		let bestMove;

		if (PLAYER == player.computer) {
			// MAXIMIZER
			let bestEvaluation = -Infinity;
			for (let i = 0; i < moves.length; i++) {
				if (moves[i].evaluation > bestEvaluation) {
					bestEvaluation = moves[i].evaluation;
					bestMove = moves[i];
				}
			}
		} else {
			// MINIMIZER
			let bestEvaluation = +Infinity;
			for (let i = 0; i < moves.length; i++) {
				if (moves[i].evaluation < bestEvaluation) {
					bestEvaluation = moves[i].evaluation;
					bestMove = moves[i];
				}
			}
		}

		return bestMove;
	}

	//GET EMPTY SPACES
	function getEmptySpaces(gameData) {
		let EMPTY = [];

		for (let id = 0; id < gameData.length; id++) {
			if (!gameData[id]) EMPTY.push(id);
		}

		return EMPTY;
	}

	//GET i AND j OF A SPACE
	function getIJ(id) {
		for (let i = 0; i < board.length; i++) {
			for (let j = 0; j < board[i].length; j++) {
				if (board[i][j] == id) return { i: i, j: j };
			}
		}
	}

	//Check for winner function
	function isWinner(gameData, player) {
		for (let i = 0; i < combos.length; i++) {
			let won = true;

			for (let j = 0; j < combos[i].length; j++) {
				let id = combos[i][j];
				won = gameData[id] == player && won;
			}
			if (won) {
				return true;
			}
		}
		return false;
	}

	//Check for a tie function in the
	function isTie(gameData) {
		let isBoardFull = true;
		for (let i = 0; i < gameData.length; i++) {
			isBoardFull = gameData[i] && isBoardFull;
		}
		if (isBoardFull) {
			return true;
		}
		return false;
	}

	//SHOW GAME OVER
	function showGameOver(player) {
		let message = player == 'tie' ? 'Oops No Winner' : 'The Winner is';
		let imgSrc = `img/${player}.png`;

		gameOverElement.innerHTML = `
        <h1>${message}</h1>
        <img class = "winner-img" src = ${imgSrc} </img>
        <div class="play" onclick="location.reload()">Play Again!</div>
        `;

		gameOverElement.classList.remove('hide');
	}

	//Draw on board
	function drawOnBoard(player, i, j) {
		let img = player == 'X' ? xImage : oImage;

		//the x,y position of the image are the x,y of the clicked space
		ctx.drawImage(img, j * SPACE_SIZE, i * SPACE_SIZE);
	}
}
