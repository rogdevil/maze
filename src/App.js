import React, { useCallback, useEffect, useState, useRef } from "react";
import "./App.css";

const defaultBoxDim = 60;

function App() {
  const dimInputRef = useRef();
  const [mazeSize, setMazeSize] = useState(0);
  const [cellMatrix, setCellMatrix] = useState([]);
  const [boxDim, setBoxDim] = useState({
    width: defaultBoxDim,
    height: defaultBoxDim,
  });
  const [gameStatus, setGameStatus] = useState("start");
  const [activeRow, setActiveRow] = useState(0);
  const [activeColumn, setActiveColumn] = useState(0);
  const [stepCount, setStepCount] = useState(0);
  const [spriteList, setSpriteList] = useState([]);
  const [spriteCount, setSpriteCount] = useState(0);

  const calcBoxDim = useCallback((mazeSize) => {
    const windowDim = { width: window.innerWidth, height: window.innerHeight };
    const minWindowSize = Math.min(windowDim.width, windowDim.height);
    if (minWindowSize < mazeSize * defaultBoxDim) {
      setBoxDim({
        width: minWindowSize / (mazeSize + 5),
        height: minWindowSize / (mazeSize + 5),
      });
    }
  }, []);

  const _getRandomNumber = useCallback((min, max) => {
    return Math.floor(Math.random() * (1 + max - min) + min);
  }, []);
  const _getRandomSprints = useCallback(
    (size) => {
      const sprintList = [];
      const sprintNumberList = [];
      for (let i = 0; i < size; i++) {
        const sprintItem = [
          _getRandomNumber(0, size - 1),
          _getRandomNumber(0, size - 1),
        ];
        const sprintNumberItem = sprintItem.join("");
        if (sprintNumberList.indexOf(sprintNumberItem) !== -1) {
          //already exists
          i -= 1;
        } else {
          sprintNumberList.push(sprintNumberItem);
          sprintList.push(sprintItem);
        }
      }
      console.log(size,sprintList)
      return sprintList;
    },
    [_getRandomNumber]
  );

  useEffect(() => {
    setCellMatrix((prevCellMatrix) => {
      const newItems = [...prevCellMatrix];
      spriteList.forEach((item, index) => {
        const x = item[0];
        const y = item[1];
        const newRow = [...newItems[x]];
        newRow[y] = 1;
        newItems[x] = newRow;
      });
      return newItems;
    });
    setSpriteCount(spriteList.length);
  }, [spriteList]);

  useEffect(() => {
    let isRemoved = new Promise((res) => {
      setCellMatrix((prevCellMatrix) => {
        if (prevCellMatrix.length) {
          const newItems = [...prevCellMatrix];
          const x = activeRow;
          const y = activeColumn;
          if (newItems[x][y]) {
            const newRow = [...newItems[x]];
            res();
            newRow[y] = 0;
            newItems[x] = newRow;
            return newItems;
          } else {
            return prevCellMatrix;
          }
        }
      });
    });
    isRemoved.then(() => {
      setSpriteCount((prevCount) => {
        prevCount === 1 && setGameStatus("end");
        return prevCount - 1;
      });
    });
  }, [activeRow, activeColumn]);

  useEffect(() => {
    if (gameStatus === "end") {
      setSpriteList([]);
    }
    if (gameStatus === "start") {
      setStepCount(0);
    }
    if(gameStatus ==="running"){
      document.querySelector(".mario").focus()
    }
  }, [gameStatus]);

  const _handleMazeSize = useCallback(() => {
    const cellMatrix = [];
    const inputValue = dimInputRef.current.value;
    const size = inputValue && parseInt(inputValue);
    if (size) {
      let rowCellList = new Array(size);
      calcBoxDim(size);
      for (let i = 0; i < size; i++) {
        rowCellList[i] = 0;
        cellMatrix.push(rowCellList);
      }
      setCellMatrix(cellMatrix);
      setSpriteList(_getRandomSprints(size));
      setMazeSize(size);
      setGameStatus("running");
    }
  }, [calcBoxDim, _getRandomSprints]);

  const _handleActive = useCallback(
    (x, y, inc) => {
      if (y) setActiveRow(activeRow + inc);
      if (x) setActiveColumn(activeColumn + inc);
      setStepCount(stepCount + 1);
    },
    [activeRow, activeColumn, stepCount]
  );

  const _handleKeyDown = useCallback(
    (e) => {
      e.preventDefault();
      switch (e.keyCode) {
        case 38:
          activeRow !== 0 && _handleActive(null, true, -1);
          break;
        case 40:
          activeRow !== mazeSize - 1 && _handleActive(null, true, 1);
          break;
        case 37:
          activeColumn !== 0 && _handleActive(true, null, -1);
          break;
        case 39:
          activeColumn !== mazeSize - 1 && _handleActive(true, null, 1);
          break;

        default:
          break;
      }
    },
    [activeRow, activeColumn, mazeSize, _handleActive]
  );

  return (
    <div className="maze">
      {gameStatus === "start" && (
        <div className="maze-input-group">
          <h1>Welcome to Maze Game</h1>
          <input
            id="maze-size-input"
            className="custom-input"
            type="number"
            placeholder="Enter maze dimension (n * n)"
            ref={dimInputRef}
            autoFocus
          />
          <div>
            <button
              className="btn "
              type="button"
              onClick={_handleMazeSize}
            >
              Start Game
            </button>
          </div>
        </div>
      )}
      {gameStatus === "running" && (
        <div className="maze-board">
          <div className="maze-board-header">
            <div className="maze-step-count">
              <h3>Steps</h3>
              <h1>{stepCount}</h1>
            </div>
            <div className="maze-step-count">
              <h3>Sprites Left</h3>
              <h1>{spriteCount}</h1>
            </div>
          </div>
          <div className="maze-table">
            {cellMatrix.map((row, rowIndex) => (
              <div className="maze-row" key={rowIndex}>
                {row.map((column, columnIndex) => {
                  const isActive =
                    rowIndex === activeRow && columnIndex === activeColumn;
                  return (
                    <div
                      key={columnIndex}
                      className={`maze-cell ${
                        isActive ? "mario" : column === 1 ? "green-sprite" : ""
                      }`}
                      tabIndex={isActive? 0: -1}
                      onBlur = {(e) => {e.target.focus()}}
                      onKeyDown={_handleKeyDown}
                      style={{ width: boxDim.width, height: boxDim.height }}
                    ></div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
      {gameStatus === "end" && (
        <div className="text-center">
          <h1>Game Ended</h1>
          <h2 className="maze-step-count">Total Steps: {stepCount}</h2>
          <button
            type="button"
            className="btn "
            onClick={() => setGameStatus("start")}
          >
            Restart Game
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
