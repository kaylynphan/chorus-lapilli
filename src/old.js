import { findAllByDisplayValue } from '@testing-library/react';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i] ? this.props.squares[i].getMark() : null}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class Player {
  constructor(symbol) {
    this.mark = symbol;
    this.numPieces = 0;
    this.turnType = 0;
    this.lastRemoved = null;
    this.hotZone = false;
  }

  addPiece() {
    this.numPieces++;
    if (this.numPieces == 3) {
      this.turnType = 1;
    }
  }
  removePiece(i) {
    this.numPieces--;
    this.turnType = 2;
    this.lastRemoved = i;
  }

  getLastRemoved() {
    return this.lastRemoved;
  }

  getMark() {
    return this.mark;
  }
}


class Game extends React.Component {
  constructor(props) {
    super(props);
    /*
      Turn types:
      0: <3 pieces, about to place a piece
      1: =3 pieces, about to select a piece to remove
      2: recently removed a piece and placing it in a new spot adjacent to the old spot
      
      Hot Zone:
      Player has a piece on square 4 and by the next turn must win or vacate
      */

    this.state = {
      squares: Array(9).fill(null),
      xIsNext: true,
      playerX: new Player('X'),
      playerO: new Player('O'),
    }
  }

  // handle click ends with a re-render. Checking for wins must happen in the beginning
  handleClick(i) {
    const squares = this.state.squares.slice();
    if (calculateWinner(squares)) {
      return;
    }
    let p = this.state.xIsNext ? new Player(this.state.playerX) : new Player(this.state.playerO);
    if (p.turnType == 0) {
      if (squares[i]) {
        //if already filled, void
        return;
      }
      squares[i] = p;
      p.addPiece();
    }
    if (p.turnType == 1) {
      // cannot remove an empty piece or an opponent's piece
      if (!squares[i] || squares[i] != p) {
        return;
      }
      squares[i] = null;
      p.removePiece(i);
    }
    if (p.turnType == 2) {
      // if the selected square is not adjacent to the last removed piece, void
      if (!contains(adjacentSquares(p.getLastRemoved())), i) {
        return;
      }
      squares[i] = p;
      p.addPiece();
    }

    this.setState({
      squares: squares,
      playerX: this.state.xIsNext ? p : this.state.playerX,
      playerO: this.state.xIsNext ? this.state.playerO : p,
      xIsNext: !this.state.xIsNext,
    });
  }

  render() {
    let status;
    if (calculateWinner(this.state.squares)) {
      const winner = calculateWinner(this.state.squares).getMark();
      status = "Winner: " + winner;
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X": "O");
    }
    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={this.state.squares}
            onClick={i => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          {status}
        </div>
      </div>
    )
  }
}

ReactDOM.render(<Game />, document.getElementById("root"));

function contains(arr, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] == val) {
      return true;
    }
  }
  return false;
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function adjacentSquares(i) {
  switch (i) {
    case 0:
      return [1, 3, 4];
    case 1:
      return [0, 2, 3, 4, 5];
    case 2:
      return [1, 4, 5];
    case 3:
      return [0, 1, 4, 6, 7];
    case 4:
      return [0, 1, 2, 3, 5, 6, 7, 8];
    case 5:
      return [1, 2, 4, 7, 8];
    case 6:
      return [3, 4, 7];
    case 7:
      return [3, 4, 5, 6, 8];
    case 8:
      return [4, 5, 7];
  }
}