import { Dispatch, createContext, useContext, useReducer } from "react";
import { BoardContextAction, BoardContextState } from "./board-context-types";
import { BoardContextReducer } from "./board-reducer";

const BoardContext = createContext<BoardContextState>({ currentBoard: null })
const BoardDispatchContext = createContext<Dispatch<BoardContextAction>>(() => { })
const InitialBoardContext: BoardContextState = { currentBoard: "exploer" };

export function BoardContextProvider({ children }: { children: JSX.Element | JSX.Element[] }) {
  const [state, dispatch] = useReducer(BoardContextReducer, InitialBoardContext)
  return (
    <BoardContext.Provider value={state}>
      <BoardDispatchContext.Provider value={dispatch}>
        {children}
      </BoardDispatchContext.Provider>
    </BoardContext.Provider>
  )
}

export function useBoardState() {
  return useContext(BoardContext);
}

export function useBoardDispatch() {
  return useContext(BoardDispatchContext);
}