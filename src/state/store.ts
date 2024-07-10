import {configureStore} from "@reduxjs/toolkit"
import scoreReducer, { ScoreSlice } from "./score/scoreSlice"
import userReducer, { UserSlice } from "./user/userSlice"
import { loadState, saveState } from "../lib/localStorage"

const preloadedState = loadState()

export const store = configureStore({
    reducer: {
        user: userReducer,
        score: scoreReducer
    },
    preloadedState,
})

store.subscribe(() => {
    saveState(store.getState())
})



export type RootState = {
    user: UserSlice,
    score: ScoreSlice,
}

export type AppDispatch = typeof store.dispatch