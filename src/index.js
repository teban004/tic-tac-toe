import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button className={props.className} onClick={props.onClick} >
            {props.value}
        </button>
    );
}

function ToggleOrder(props) {
    return (
        <div>
            <input type="checkbox" onChange={props.onClick} />
            Sort in descending order
        </div>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        // get the array of indices of the winner squares
        const winners = this.props.winners;
        // if the current square is part of the winners array, the winner style will be assigned, otherwise asign normal
        const squareClass = (winners.length>0 && winners.includes(i)) ? 'squareWinner' : 'square';
        
        return (
            <Square 
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                className={squareClass}
            />
        );
    }

    renderColumns(size, offset) {
        const rowColumns = [];
        // render a square for each column
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
        const boardRows = [];
        // render as many rows as the size of the board
        for( let rowNum=0; rowNum<size; rowNum++ ) {
            // the offset is the index of the first square in the row
            const offset = rowNum * size;
            // add a new row to the array
            boardRows.push(
                <div className="board-row" key={rowNum}>
                    {this.renderColumns(size, offset)}
                </div>
            );
        }

        return boardRows;
    }

    render() {
        // size of the board
        const boardNumRows = this.props.numSquaresPerSide;
        
        return (
            <React.Fragment>
                {this.renderRows(boardNumRows)}
            </React.Fragment>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        const numSquaresPerSide = this.props.numSquaresPerSide>3 ? this.props.numSquaresPerSide : 3;
        this.state = {
            history: [{
                squares: Array(numSquaresPerSide*numSquaresPerSide).fill(null),
                location: null,
            }],
            xIsNext: true,
            stepNumber: 0,
            reverseMovesOrder: false,
            numSquaresPerSide: numSquaresPerSide,
        };
    }

    calculateWinner(squares) {
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
                return {
                    'winner': squares[a], 
                    'winners': lines[i]
                };
            }
        }
        return {
            'winner': null, 
            'winners': []
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if( this.calculateWinner(squares).winner || squares[i] ) {
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

    changeMovesOrder(sortReverseOrder) {
        this.setState({reverseMovesOrder: !sortReverseOrder})
    }

    render() {
        const numSquaresPerSide = this.state.numSquaresPerSide;
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const {winner, winners} = this.calculateWinner(current.squares);
        
        const moves = history.map((step, move) => {
            // gets the location (square index) of the current move
            const index = step.location;
            // breaks down the index into column and row
            const col = index>=0 ? (index%numSquaresPerSide)+1 : index;
            const row = index>=0 ? Math.floor(index/numSquaresPerSide)+1 : index;
            // create the location text to display for the user
            const locationText = index===null ? '' : " Move location: (" + col + ',' + row + ')';
            // make bold the text of the move that is being displayed on the board
            const buttonStyle = this.state.stepNumber==move ? {fontWeight: 'bold'} : {fontWeight: 'normal'};

            const moveButtonText = move ? 'Go to move #' + move : 'Go to game start';
            return (
                <li key={move}>
                    <button style={buttonStyle} onClick={() => this.jumpTo(move)}>{moveButtonText}</button>{locationText}
                </li>
            );
        });

        let sortReverseOrder = this.state.reverseMovesOrder ;
        if( sortReverseOrder ) {
            moves.reverse(); // sorts the moves list in reverse order
        }

        let status;
        if( winner ) {
            status = 'Winner ' + winner;
        }
        else {
            // check if there are empty squares (possible moves)
            if( current.squares.includes(null) ) {
                status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
            }
            else {
                // as there are no more possible moves and no winner, the game ends in a draw
                status = "The game ends in a draw.";
            }
        }

        return (
            <div className="game">
                <div className="game-board">
                <Board 
                    squares={current.squares}
                    onClick={(i) => this.handleClick(i)}
                    winners={winners}
                    numSquaresPerSide={this.state.numSquaresPerSide}
                />
                </div>
                <div className="game-info">
                <div>{status}</div>
                <ToggleOrder 
                    value={sortReverseOrder}
                    onClick={() => this.changeMovesOrder(sortReverseOrder)}
                />
                <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
  <Game numSquaresPerSide="3" />,
  document.getElementById('root')
);
