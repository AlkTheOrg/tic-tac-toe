// Cell Factory
const cellFactory = (cell_value) => {
  let value = cell_value;
  const getValue = () => value;
  const setValue = (cell_value) => {
    value = cell_value;
  };
  return { getValue, setValue };
};

// Gameboard Module
const gameBoard = (function () {
  "use strict";
  // Private Methods
  const _initBoard = () => {
    const board = [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ];
    board.forEach((row) =>
      row.forEach((cell, index) => {
        row[index] = cellFactory("");
      })
    );
    return board;
  };

  const _rows = () => {
    return [
      [getCell(0, 0), getCell(0, 1), getCell(0, 2)],
      [getCell(1, 0), getCell(1, 1), getCell(1, 2)],
      [getCell(2, 0), getCell(2, 1), getCell(2, 2)],
    ];
  };

  const _columns = () => {
    return [
      [getCell(0, 0), getCell(1, 0), getCell(2, 0)],
      [getCell(0, 1), getCell(1, 1), getCell(2, 1)],
      [getCell(0, 2), getCell(1, 2), getCell(2, 2)],
    ];
  };

  const _diagonals = () => {
    return [
      [getCell(0, 0), getCell(1, 1), getCell(2, 2)],
      [getCell(0, 2), getCell(1, 1), getCell(2, 0)],
    ];
  };

  const _winningPositions = () => {
    return _diagonals().concat(_rows(), _columns());
  };

  const _cellValuesEqual = (cells) => {
    let cellValues = cells.map((cell) => cell.getValue());
    return cellValues[0] === cellValues[1] && cellValues[1] === cellValues[2];
  };

  // Returns the winner's value(X/O) if there is any. Empty str otherwise
  const _winner = () => {
    let winner = "";
    let count = 0;
    let winningPositions = _winningPositions();
    while (!winner && count < winningPositions.length) {
      if (_cellValuesEqual(winningPositions[count]))
        winner = winningPositions[count][0].getValue();
      count++;
    }
    return winner;
  };

  const _isDraw = () => {
    return !board
      .reduce((conc, cur) => conc.concat(cur))
      .some((cell) => cell.getValue() === "");
  };
  // Public Methods
  const board = _initBoard();

  const reset = () => {
    board.forEach((row) =>
      row.forEach((cell) => {
        cell.setValue("");
      })
    );
  };

  const getCell = (row, col) => {
    return board[row][col];
  };

  const setCell = (row, col, value) => {
    let cell = getCell(row, col);
    cell.setValue(value);
    return cell;
  };

  const isGameOver = () => {
    let result = false;
    let winner = _winner();
    if (winner !== "") {
      result = winner
    } else if(_isDraw()){
      result = true;
    }
    return result;
  }

  // sake of visualising while debugging
  const display = () => {
    board.forEach((row) => console.log(row.map((cell) => cell.getValue())));
  };

  return {
    reset,
    getCell,
    setCell,
    isGameOver,
    display, // for sake of debugging
    board, // for sake of debugging
  };
})();

// Player Factory
const playerFactory = (name, color) => {
  let cellColor = color;
  const getName = () => name;
  const getColor = () => cellColor;
  const setColor = (newColor) => {
    cellColor = newColor;
  };
  return { getName, getColor, setColor };
};

// DisplayController Module
const displayController = (function () {
  "use strict";
  let currentPlayer = playerFactory("Player 1", "X");
  let otherPlayer = playerFactory("Player 2", "O");
  const board = gameBoard;

  const player1 = document.querySelector("#player-1");
  const player2 = document.querySelector("#player-2");
  const player1ColorTxt = document.querySelector("#player-1 .p-color");
  const player2ColorTxt = document.querySelector("#player-2 .p-color");

  const startBtn = document.querySelector("#btn-start");
  const resetBtn = document.querySelector("#btn-reset");
  const newRndBtn = document.querySelector("#btn-new-round");
  const boardVisual = document.querySelector("#board");

  // Changes the background colors to point out that player colors(x and o) are switched
  const _switchPlayerBgColors = () => {
    player1.classList.toggle("bg-primary");
    player1.classList.toggle("gsw-yellow");
    player2.classList.toggle("bg-primary");
    player2.classList.toggle("gsw-yellow");
  };

  // Player X becomes player O, player O becomes player X
  const _switchPlayerColors = () => {
    let temp = otherPlayer.getColor();
    otherPlayer.setColor(currentPlayer.getColor());
    currentPlayer.setColor(temp);    
  }

  // Switches the #p-color
  const _switchPlayerColorsText = () => {
    let tempTxt = player1ColorTxt.textContent;
    player1ColorTxt.textContent = player2ColorTxt.textContent;
    player2ColorTxt.textContent = tempTxt;
  };

  // Now player 1 plays with the color that player 2 played before
  const _switchSides = () => {
    _switchPlayerBgColors();
    _switchPlayerColorsText();
    _switchPlayerColors();
  }

  // Changes the turn
  const _changePlayers = () => {
    let curValue = currentPlayer.getColor(),
      otherValue = otherPlayer.getColor();
    currentPlayer.setColor(otherValue);
    otherPlayer.setColor(curValue);
    currentPlayer, (otherPlayer = otherPlayer), currentPlayer;
  };

  const _clearBoard = () => {
    board.reset();
    for (const row of boardVisual.children) {
      for(const cell of row.children) {
        if(cell.hasChildNodes())
          cell.removeChild(cell.childNodes[0]);
      }
    }
  };

  const _getPlayerWithColor = (color) => {
    if (player1.children[0].children[0].textContent === color) {
      return player1;
    } else {
      return player2;
    }
  };

  const _incrementScoreOf = (winnerColor) => {
    let winnerPlayer = "";
    winnerColor === "X"
      ? (winnerPlayer = _getPlayerWithColor("X"))
      : (winnerPlayer = _getPlayerWithColor("O"));
    let currScore = +winnerPlayer.children[1].innerText;
    winnerPlayer.children[1].innerText = `${++currScore}`;
  };

  const _storeColorInCell = (target, color) => {
    let x = Number.parseInt(target.parentElement.id.slice(-1)); // row
    let y = Number.parseInt(
      target.classList[target.classList.length - 1].slice(-1)
      ); //col
      board.setCell(x, y, color);
    };

  const _resetScoreBoards = () => {
    player1.children[1].innerText = '0';
    player2.children[1].innerText = '0';
    if(player1.children[0].children[0].textContent === 'O')
      _switchSides();
    currentPlayer = playerFactory('Player 1', 'X');
    otherPlayer = playerFactory('Player 2', 'O');
  }

  // Ends the current round
  const _endGame = (result) => {
    boardVisual.removeEventListener("click", playTurn);
    newRndBtn.classList.remove("d-none");
    if (typeof result !== 'boolean')
      _incrementScoreOf(otherPlayer.getColor());
      // _getPlayerWithColor(result).classList.add('winner');
      if(result === 'O')
        _changePlayers();
  };

  const startGame = () => {
    boardVisual.addEventListener("click", playTurn);
    startBtn.classList.add("d-none");
    resetBtn.classList.remove("d-none");
  };

  const playTurn = (e) => {
    if (!e.target.hasChildNodes()) {
      const p = document.createElement("p");
      p.innerText = currentPlayer.getColor();
      p.setAttribute('data-content', currentPlayer.getColor());
      e.target.appendChild(p);
      _changePlayers();
      _storeColorInCell(e.target, p.innerText);
    }
    let gameOverResult = board.isGameOver();
    if (gameOverResult) {
      _endGame(gameOverResult);
    }
  };

  const newRound = () => {
    newRndBtn.classList.add("d-none");
    _switchSides();
    _clearBoard();
    boardVisual.addEventListener("click", playTurn);
  };

  // Resets score and clears table
  const reset = () => {
    _clearBoard();
    _endGame(false);
    _resetScoreBoards();
    startBtn.classList.toggle('d-none');
    resetBtn.classList.toggle('d-none');
    if(!newRndBtn.classList.contains('d-none'))
      newRndBtn.classList.add('d-none');
  };

  startBtn.addEventListener("click", startGame);
  resetBtn.addEventListener("click", reset);
  newRndBtn.addEventListener("click", newRound);
})();
