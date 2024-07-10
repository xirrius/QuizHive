import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface UserSlice {
    uid: string | null,
    email: string | null,
}

const initialState: UserSlice = {
    uid: null,
    email: null,
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<UserSlice>) => {
            state.uid = action.payload.uid,
            state.email = action.payload.email
        },
        clearUser: () => initialState
    }
})

export const {setUser, clearUser} = userSlice.actions

export default userSlice.reducer;
