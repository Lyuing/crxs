chrome.tabs.getSelected(null, (tab) => {
  // 匹配标签页 url 中的域名
  const domain = tab.url.match(/(\w+):\/\/([^/:]+)(:\d*)?/)[2]
  chrome.cookies.getAll({
    domain: domain,
  }, (cookies) => {
    let list = cookies.map(i=>{
      const { domain, path, name, value} = i
      return {domain, path, name, value}
    })
    console.log(cookies)
    renderNode(list)
  })
})

function renderNode (list) {
  let node = list.map(i=>
    `<div class="line">
      <p class="cookie-path">${i.path}</p>
      <p class="cookie-name">${i.name}</p>
      <p class="cookie-value cookieValue">${i.value}</p>
    </div>`
  )
  $('#inner').html(`<div class="block">${node.join('')}</div>`)
  $('#inner').on('click', '.cookieValue', copy)
}

function copy (node) {
  let value = node.target.innerText
  console.log(value)
  if (document.body.createTextRange) {
    let range = document.body.createTextRange()
    range.moveToElementText(node.currentTarget)
    range.select()
    // 执行浏览器复制命令
    document.execCommand('Copy')
  } else if (window.getSelection) {
    let selection = window.getSelection()
    let range = document.createRange()
    range.selectNodeContents(node.currentTarget)
    selection.removeAllRanges()
    selection.addRange(range)
    // 执行浏览器复制命令
    document.execCommand('Copy')
    setTimeout(()=>{
      selection.removeAllRanges()
    }, 0)
  }

}