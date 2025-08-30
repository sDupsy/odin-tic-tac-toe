function Gameboard() {
    const rows = 3;
    const columns = 3;
    const board = [];

    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < columns; j++) {
            board[i].push(Cell());
        }
    }
    const getBoard = () => board;

    const placeToken = (row, column, player) => {
        const cell = board[row][column];
        if (cell.getValue() !== 0) {
            console.log("Cell already taken!");
            return false;
        }
        cell.addToken(player);
        return true;
    }
    const printBoard = () => {
        const boardWithCellValues = board.map((row) => row.map((cell) => cell.getValue()))
        console.log(boardWithCellValues);
    }

    
    return {
        getBoard, placeToken, printBoard
    }

}

function Cell() {
        let value = 0;

        const addToken = (player) => {
            value = player;
        }

        const getValue = () => value;

        return {
            getValue, addToken
        }
    }

function GameController(playerOneName = "Player One", playerTwoName = "Player Two") {
    const board = Gameboard();
    

    const players = [
        {
            name: playerOneName,
            token: 1
        },
        {
            name: playerTwoName,
            token: 2
        }
    ];

    let activePlayer = players[0];
    

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    }
    const getActivePlayer = () => activePlayer;
    
    const printNewRound = () => {
        board.printBoard();
        console.log(`${getActivePlayer().name}'s Turn.`);
    }

    const checkWin = (board) => {
        // Rows
        for (let i = 0; i < 3; i++) {
            if (
                board[i][0].getValue() !== 0 &&
                board[i][0].getValue() === board[i][1].getValue() &&
                board[i][1].getValue() === board[i][2].getValue()
            ) {
                return true;
            }
        }
        // Columns
        for (let i = 0; i < 3; i++) {
            if (
                board[0][i].getValue() !== 0 &&
                board[0][i].getValue() === board[1][i].getValue() &&
                board[1][i].getValue() === board[2][i].getValue()
            ) {
                return true;
            }
        }
        // Diagonals
        if (
            board[0][0].getValue() !== 0 &&
            board[0][0].getValue() === board[1][1].getValue() &&
            board[1][1].getValue() === board[2][2].getValue()
        ) {
            return true;
        }
        if (
            board[0][2].getValue() !== 0 &&
            board[0][2].getValue() === board[1][1].getValue() &&
            board[1][1].getValue() === board[2][0].getValue()
        ) {
            return true;
        }
        return false;
    }

    const playRound = (row, column) => {
        const validMove = board.placeToken(row, column, getActivePlayer().token);
        if (!validMove) {
            return {status: "invalid"};
        }

        if (checkWin(board.getBoard())) {
            return { status: "win", winner: getActivePlayer()};
        }
        
        const flat = board.getBoard().flat();
        if (flat.every(cell => cell.getValue() !== 0)) {
            return { status: "draw"};
        }

        const lastPlayer = getActivePlayer();
        switchPlayerTurn();
        return { status: "next", nextPlayer: getActivePlayer(), lastPlayer };

        

    }
    
    printNewRound();

    return {
        playRound, getActivePlayer, getBoard: board.getBoard, checkWin
    }
}

function ScreenController() {
    let game = GameController();
    const playerTurnDiv = document.querySelector(".turn");
    const boardDiv = document.querySelector(".board");
    const restartButton = document.querySelector(".restart")

    const updateScreen = () => {
        boardDiv.textContent = "";

        const board = game.getBoard();
        const activePlayer = game.getActivePlayer();

        playerTurnDiv.textContent = `${activePlayer.name}'s turn.`

        board.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const cellButton = document.createElement("button");
                cellButton.classList.add("cell");

                cellButton.dataset.row = rowIndex
                cellButton.dataset.column = colIndex

                cellButton.textContent = 
                    cell.getValue() === 1 ? "X" : 
                    cell.getValue() === 2 ? "O" : "";

                boardDiv.appendChild(cellButton);
            })
        })
    }

    function clickHandlerBoard(e) {
        const selectedRow = Number(e.target.dataset.row);
        const selectedColumn = Number(e.target.dataset.column);

        if (isNaN(selectedRow) || isNaN(selectedColumn)) return;

        const result = game.playRound(selectedRow, selectedColumn);
        updateScreen();

        if (result.status === "invalid") {
            playerTurnDiv.textContent = "Invalid move, try again!"
            return;
        }

        if (result.status === "win") {
            playerTurnDiv.textContent = `${result.winner.name} wins!`
            boardDiv.removeEventListener("click", clickHandlerBoard);
            return;
        }

        if (result.status === "draw") {
            playerTurnDiv.textContent = "It's a draw!";
            boardDiv.removeEventListener("click", clickHandlerBoard);
            return;
            }

        
    }

    function restartGame(e) {
        game = GameController();
        boardDiv.removeEventListener("click", clickHandlerBoard);
        boardDiv.addEventListener("click", clickHandlerBoard);
        updateScreen();
    }

    boardDiv.addEventListener("click", clickHandlerBoard);
    restartButton.addEventListener("click", restartGame);

    updateScreen();
}

ScreenController();





