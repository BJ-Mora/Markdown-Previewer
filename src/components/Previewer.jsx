import { useSelector } from 'react-redux'
//import parseMarkdown from '../utilities/parseMarkdown.js'
import { marked } from 'marked'

const Previewer = () => {
    const markdown = useSelector((state) => state.markdown)
    const output = marked(markdown)
    
    return (
        <div className='previewer-container'>
            <div className='previewer-title-container'>
                <span className='title'>Previewer</span>
            </div>
            <div id="preview" className='previewer' dangerouslySetInnerHTML={{__html: output}} />
        </div>
    )
}

export default Previewer