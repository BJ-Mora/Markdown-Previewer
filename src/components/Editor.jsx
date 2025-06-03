import { useSelector, useDispatch } from 'react-redux'
import { updateMarkdown } from '../features/markdown/markdownSlice'

const Editor = () => {
    const markdown = useSelector((state) => state.markdown)
    const dispatch = useDispatch()
    
    return (
        <div className='editor-container'>
            <div className="editor-title-container">
                <span className="title">Editor</span>
            </div>
            <textarea id="editor" className='editor' value={markdown} onChange={(e) => dispatch(updateMarkdown(e.target.value))} />
        </div>
    )
}

export default Editor