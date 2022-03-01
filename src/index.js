import React, { Fragment } from 'react';
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
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  renderColumns(size, offset) {
    let rowColumns = [];
    for( let colNum=0; colNum < size; colNum++) {
      rowColumns.push(
        <React.Fragment key={offset + colNum}>
          {this.renderSquare(offset + colNum)}
        </React.Fragment>
      );
    }
    return rowColumns;
  }

  renderRows(size) {
    let boardRows = [];
    for( let rowNum=0; rowNum<size; rowNum++ ) {
      let offset = rowNum * size;
      boardRows.push(
        <div className="board-row" key={rowNum}>
          {this.renderColumns(size, offset)}
        </div>
      );
    }
    return boardRows;
  }

  render() {
    const boardNumRows = 3;
    return (
      <>
      {this.renderRows(boardNumRows)}
      </>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        location: null,
      }],
      xIsNext: true,
      stepNumber: 0,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if( calculateWinner(squares) || squares[i] ) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
      squares: squares,
      location: i,
      }]),
    xIsNext: !this.state.xIsNext,
    stepNumber: history.length,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    
    const moves = history.map((step, move) => {
      const index = step.location;
      const col = index>=0 ? (index%3)+1 : index;
      const row = index>=0 ? Math.floor(index/3)+1 : index;
      const location = index===null ? '' : " Move location: (" + col + ',' + row + ')';
      
      const buttonStyle = this.state.stepNumber==move ? {fontWeight: 'bold'} : {fontWeight: 'normal'};

      const desc = move ?
      'Go to move #' + move:
      'Go to game start';
      return (
        <li key={move}>
          <button style={buttonStyle} onClick={() => this.jumpTo(move)}>{desc}</button>{location}
        </li>
      );
    });

    let status;
    if( winner ) {
      status = 'Winner ' + winner;
    }
    else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}