/*
Kaylyn Phan
CS 35L W22
*/

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
          value={this.props.squares[i] ? this.props.squares[i]: null}
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
  
  class Game extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        playerX : {
            mark: 'X',
            numPieces: 0,
            turnType: 0,
            lastRemoved: null,
        },
        playerO : {
            mark: 'O',
            numPieces: 0,
            turnType: 0,
            lastRemoved: null,
        },
        squares: Array(9).fill(null),
        xIsNext: true,
        hotZone: 0,
      };
    }
  
    handleClick(i) {
      console.log("Click");
      const squares = this.state.squares.slice();
      let hotZone = this.state.hotZone;

      if (calculateWinner(squares)) {
        console.log("Win!");
        return;
      }
      if (hotZone === 3) {
        console.log("Hot Zone exploded.");
        return;
    }
      const p = Object.assign(this.state.xIsNext ? this.state.playerX : this.state.playerO);
      if (p.turnType === 0) {
        if (squares[i]) {
          console.log("Square is filled. Void");
          return;
        }
        squares[i] = p.mark;
        p.numPieces++;
        if (squares[4] && p.numPieces === 3) {
            hotZone++;
        }
        if (p.numPieces === 3) {
            p.turnType = 1;
        }
      } else if (p.turnType === 1) {
        // cannot remove an empty piece or an opponent's piece
        if (!squares[i] || squares[i] !== p.mark) {
          return;
        }
        squares[i] = null;
        if (i === 4) {
            hotZone = 0;
        }
        p.numPieces--;
        p.turnType = 2;
        p.lastRemoved = i;
      } else if (p.turnType === 2) {
        // if the selected square is not adjacent to the last removed piece, void
        if (squares[i]) {
          console.log("Square is filled. Void");
          return;
        }
        if (!contains(adjacentSquares(p.lastRemoved), i)) {
            console.log("Not adjacent. Void");
            return;
        }
        squares[i] = p.mark;
        if (squares[4]) {
            hotZone++;
        }
        p.numPieces++;
        p.turnType = 1;
      }
      console.log("xIsNext: " + this.state.xIsNext);
      //console.log(this.state.playerX);
      //console.log(this.state.playerO)
      console.log("Squares: " + squares);
      console.log("About to change state");
      this.setState({
        squares: squares,
        playerX: this.state.xIsNext ? p : this.state.playerX,
        playerO: this.state.xIsNext ? this.state.playerO : p,
        xIsNext: (p.turnType === 2) ? this.state.xIsNext: !this.state.xIsNext,
        hotZone: hotZone,
      });
      
    }
  
    render() {
        console.log("Rendering");
        let status;
        let instructions;
        if (calculateWinner(this.state.squares)) {
          const winner = calculateWinner(this.state.squares);
          status = "3 in a row! Winner: " + winner;
          instructions = null;
        } else if (this.state.hotZone === 3) {
          const winner = this.state.xIsNext ? "X" : "O";
          status = "Failed to vacate the middle spot! Winner: " + winner;
          instructions = null;
        } else {
          status = "Next player: " + (this.state.xIsNext ? "X" : "O");
          let turnType;
          if (this.state.xIsNext) {
            turnType = this.state.playerX.turnType;
          } else {
            turnType = this.state.playerO.turnType;
          }
          if (turnType === 0) {
            instructions = "Click to add a new piece.";
          } else if (turnType === 1) {
            instructions = "Click on a piece to move to an adjacent square.";
          } else {
            instructions = "Where would you like to move this piece to?"
          }
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
            <div className="game-info">
              {instructions}
            </div>
          </div>
        )
      }
    }
  
  // ========================================
  
  ReactDOM.render(<Game />, document.getElementById("root"));
  
  function contains(arr, val) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === val) {
        return true;
      }
    }
    return false;
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
      default:
        return [];
    }
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
      if (squares[a] && squares[b] && squares[c]) {
          if (squares[a] === squares[b] && squares[a] === squares[c]) {
              return squares[a];
          }
      }
    }
    return null;
  }
  