import { RootState } from "../state/store";

export const loadState = (): RootState | undefined => {
    try {
        const serializedState = localStorage.getItem('state');
        if(serializedState === null) {
            return undefined
        }
        return JSON.parse(serializedState)
    } catch (e) {
        console.error("Could not load state ", e)
        return undefined
    }
}

export const saveState = (state:any) => {
    try {
        const serializedState = JSON.stringify(state)
        localStorage.setItem('state', serializedState)
    } catch (error) {
        console.error("Could not save state " , error)
    }
}