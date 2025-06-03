import { createSlice } from '@reduxjs/toolkit';

const markdownSlice = createSlice ({
    name: 'markdown',
    initialState: 'Get started, type something!',
    reducers: {
        updateMarkdown: (state, action) => action.payload
    }
});

export const { updateMarkdown } = markdownSlice.actions;
export default markdownSlice.reducer;