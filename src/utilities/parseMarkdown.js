const parseMarkdown = (markdown) =>  {
    //console.log("Received Markdown:", markdown);

    if (!markdown) return "";

    const lineBreakRegex = /\n/g;
    
    const h1Regex = /^#(?!#)\s(.+)$/gim;
    const h2Regex = /^#{2}(?!#)\s(.+)$/gim;
    const h3Regex = /^#{3}(?!#)\s(.+)$/gim;
    const h4Regex = /^#{4}(?!#)\s(.+)$/gim;
    const h5Regex = /^#{5}(?!#)\s(.+)$/gim;
    const h6Regex = /^#{6}(?!#)\s(.+)$/gim;

    const codeRegex = /`([^`]+)`/g;
    const multiLineCodeRegex = /`{3}\n([\s\S]+?)`{3}\n/g;

    const funcRegex = /\b(function|const|if|else|return|let)\b/g;
    const funcNameRegex = /([a-z]+([A-Z][a-z]+)+|\blog)/g;
    const blockRegex = /\{([\s\S]*?)\}/g;
    const varRegex = /([a-z]+(?:[A-Z][a-z0-9]*)+)\b/g;
    const funcParamRegex = /\([a-z]+(,\s[a-z]+)*\)/g;
    const symbolRegex = /[{}(),;]+/g;
    const altSymbolRegex = /\s=\s+|\s=>\s/g;
    const quoteRegex = /"([a-zA-Z0-9]+(\s[a-zA-Z0-9]+)*)"/g;
    const numRegex = /[0-9]+/g;

    const boldRegex = /\*\*([\s\S]+?)\*\*/g;
    const italicRegex = /_([\s\S]+?)_/g;
    const strikeRegex = /~~([\s\S]+?)~~/g;
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    const blockQuoteRegex = /^>\s?(.*)$/gm;

    const tableRegex = /^([^\n]+)\n\s*([-:| ]+)\n((?:.*\|.*(?:\n|$))*)/gm;

    const imgRegex = /!\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;


    function parseNestedBullets(markdown) {
      const lines = markdown.split('\n');
      const stack = [];
      let html = '';
    
      for (const line of lines) {
        const match = /^(\s*)- (.+)$/.exec(line);
        if (!match) {
          while (stack.length > 0) {
            html += '</li></ul>';
            stack.pop();
          }
          html += line + '\n';
          continue;
        }
    
        const indent = match[1].length;
        const content = match[2];
    
        while (stack.length > 0 && indent < stack[stack.length - 1]) {
          html += '</ul></li>';
          stack.pop();
        }
    
        if (stack.length === 0 || indent > stack[stack.length - 1]) {
          html += '<ul><li>';
          stack.push(indent);
        } else {
          html += '</li><li>';
        }
    
        html += content;
      }
    
      while (stack.length > 0) {
        html += '</li></ul>';
        stack.pop();
      }
    
      return html;
    }
    
    markdown = parseNestedBullets(markdown);

    function parseNumberedList(markdown) {
      const lines = markdown.split('\n');
      const numListRegex = /^(\d+)\. (.+)?$/;

      let listStarted = false;
      let startNumber = 1;
      let html = '';

      for (const line of lines) {
        const match = numListRegex.exec(line);
        
        if (match) {
          const content = match[2];

          if (!listStarted) {
            startNumber = parseInt(match[1], 10);
            html += `<ol start="${startNumber}">\n`;
            listStarted = true;
          }

          html += `  <li>${content}</li>\n`;
        } else {

          if (listStarted) {
            html += `</ol>\n`;
            listStarted = false;
          }

          html += line + '\n';
        }
      }

      if (listStarted) {
        html += '</ol>\n';
      }

      return html;
    }

    markdown = parseNumberedList(markdown);

    function escapeHtml(text) {
      return text.replace(/[&<>]/g, (match) => {
        const escapeMap = {
          '&': '&amp',
          '<': '&lt;',
          '>': '&gt;'
        };
        return escapeMap[match];
      });
    }

    const codeBlocks = [];

    markdown = markdown.replace(multiLineCodeRegex, (_, codeblock) => {
      const escapedCode = escapeHtml(codeblock);
      const highlightedCode = escapedCode
      .replace(funcRegex, '<span class="token-keyword">$1</span>')
      .replace(funcNameRegex, `<span class="token-function">$&</span>`)
      .replace(funcParamRegex, `<span class="token-param">$&</span>`)
      .replace(symbolRegex, `<span class="token-symbol">$&</span>`)
      .replace(altSymbolRegex, `<span class="token-alt-symbol">$&</span>`)
      .replace(quoteRegex, `<span class="token-quote">$&</span>`)
      .replace(numRegex, `<span class="num">$&</span>`)
      .replace(blockRegex, (match) => {
        return match.replace(varRegex, '<span class="var-name">$&</span>');
      });

      const finalCodeBlock = `<pre><code>${highlightedCode}</code></pre>`;
      codeBlocks.push(finalCodeBlock);
      return `[[CODE-BLOCK-${codeBlocks.length - 1}]]`;
    });

    markdown = markdown.replace(imgRegex, (_, altText, url) => {
      return `<img src="${url}" alt="${altText}" style="max-width: 650px;"/>`;
    });

    let updatedMarkdown = markdown;

    updatedMarkdown = updatedMarkdown.replace(h1Regex, (_, text) => `<h1>${text}</h1><hr></hr>`);
    updatedMarkdown = updatedMarkdown.replace(h2Regex, (_, text) => `<h2>${text}</h2><hr></hr>`);
    updatedMarkdown = updatedMarkdown.replace(h3Regex, (_, text) => `<h3>${text}</h3>`);
    updatedMarkdown = updatedMarkdown.replace(h4Regex, (_, text) => `<h4>${text}</h4>`);
    updatedMarkdown = updatedMarkdown.replace(h5Regex, (_, text) => `<h5>${text}</h5>`);
    updatedMarkdown = updatedMarkdown.replace(h6Regex, (_, text) => `<h6>${text}</h6>`);

    updatedMarkdown = updatedMarkdown.replace(blockQuoteRegex,(_, quoteText) => {
      return `<blockquote>${quoteText}</blockquote>`;
    });

    updatedMarkdown = updatedMarkdown.replace(tableRegex, (_, headerLine, separatorLine, bodyLines) => {
      const headers = headerLine.trim().split('|').map(header => `<th>${header.trim()}</th>`).join('');
      const body = bodyLines.trim().split('\n').map(row => {
        const cells = row.trim().split('|').map(cell => `<td>${cell.trim()}</td>`).join('');
        return `<tr>${cells}</tr>`;
      }).join('');

      return `<table><thead><tr>${headers}</tr></thead><tbody>${body}</tbody></table>`;
    });

    updatedMarkdown = updatedMarkdown.replace(lineBreakRegex, `<br/>`);

    updatedMarkdown = updatedMarkdown.replace(boldRegex,(_, text) => `<strong>${text}</strong>`);
    updatedMarkdown = updatedMarkdown.replace(italicRegex,(_, text) => `<em>${text}</em>`);
    updatedMarkdown = updatedMarkdown.replace(strikeRegex,(_, text) => `<s>${text}</s>`);
    updatedMarkdown = updatedMarkdown.replace(linkRegex,(_, text, url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    });
  
    updatedMarkdown = updatedMarkdown.replace(codeRegex, (_, text) => {
      const escapedText = escapeHtml(text);
      return `<code class="single-line-code">${escapedText}</code>`;
    });

    updatedMarkdown = updatedMarkdown.replace(/\[\[CODE-BLOCK-(\d+)]]/g, (_, index) => {
      return codeBlocks[parseInt(index, 10)];
    });

    return updatedMarkdown;
}

export default parseMarkdown;