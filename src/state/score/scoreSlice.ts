import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ScoreSlice {
  [quizId: string]: number;
}

const initialState: ScoreSlice = {};

const scoreSlice = createSlice({
  name: "score",
  initialState,
  reducers: {
    setScore: (
      state,
      action: PayloadAction<{ quizId: string; score: number }>
    ) => {
      state[action.payload.quizId] = action.payload.score;
    },
    setScores: (state, action: PayloadAction<ScoreSlice>) => {
      return {...state, ...action.payload}
    },
    resetScores: () => initialState
  },
});

export const { setScore, setScores, resetScores } = scoreSlice.actions;

export default scoreSlice.reducer;
