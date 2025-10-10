document.addEventListener('DOMContentLoaded', () => {
  setTimeout(()=>{
    // 正则匹配地址是否是 ESL_PLAT_BUG/122 这样的数字结尾
    const reg = /ESL_PLAT_BUG\/(\d+)/
    if (reg.test(location.href)) {
      // 详情页
      initESL_bug()
    } else {
      // 列表页
      initESL_bug_list()
    }
  }, 500)
});

function initESL_bug () {
  const main = document.querySelector('#main') || document.querySelector('#root')
  if (main.__esl_delegation_bound) return
  main.__esl_delegation_bound = true
  onOpenDraw()
}
function initESL_bug_list () {
  // 使用事件代理：在 #main 上注册一次 click 监听，匹配子元素选择器，避免关心加载时机
  const main = document.querySelector('#main') || document.querySelector('#root')
  // console.warn('ESL_bug_list.js init', main)
  const selector = '.ezTable [class^="_leftBorder_"], .ezTable [class*=" _leftBorder_"]'

  // 防止重复绑定
  if (main.__esl_delegation_bound) return
  main.__esl_delegation_bound = true

  main.addEventListener('click', (ev) => {
    try {
      const matched = ev.target && ev.target.closest ? ev.target.closest(selector) : null
      if (!matched) return
      // 确保匹配节点在 main 内（如果 main 是 document，则跳过此检查）
      if (main !== document && !main.contains(matched)) return
      // 将匹配到的元素放到事件对象上，供 onOpenDraw 使用
      ev.delegatedTarget = matched
      onOpenDraw(ev)
    } catch (err) {
      console.error('esl delegation error', err)
    }
  })
}

// 样式加载
function ensureLightboxCss() {
  if (document.querySelector('link[href$="custom.css"]')) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
      link.href = chrome.runtime.getURL('css/custom.css')
    } else {
      link.href = 'css/custom.css'
    }
  } catch (err) {
    link.href = 'css/custom.css'
  }
  document.head.appendChild(link)
}

// 内容区追加缩略图
function createThumbnails(container, urls, onOpen) {
  container.classList.add('esl-thumb-container')
  urls.forEach((url, i) => {
    const img = document.createElement('img')
    img.src = url
    img.classList.add('esl-thumb')
    img.dataset.eslIndex = i
    img.style.cursor = 'zoom-in'
    img.addEventListener('click', (ev) => { ev.stopPropagation(); onOpen(i) })
    container.appendChild(img)
  })
}

// 缩略图点击放大
function createLightbox(urls) {
  // creates overlay per open; keeps internal handlers for cleanup
  let keyHandler = null

  function showImage(largeEl, index) {
    if (index < 0) index = urls.length - 1
    if (index >= urls.length) index = 0
    largeEl.src = urls[index]
    largeEl.dataset.currentIndex = index
  }

  function open(startIndex = 0) {
    const overlay = document.createElement('div')
    overlay.className = 'esl-overlay'

    if (urls.length <= 1) overlay.classList.add('single')

    const inner = document.createElement('div')
    inner.className = 'esl-inner'

    const prev = document.createElement('button')
    prev.className = 'esl-prev'
    prev.innerHTML = '&#10094;'

    const next = document.createElement('button')
    next.className = 'esl-next'
    next.innerHTML = '&#10095;'

    const large = document.createElement('img')
    large.className = 'esl-large'
    large.alt = '预览图'

    inner.appendChild(prev)
    inner.appendChild(large)
    inner.appendChild(next)
    overlay.appendChild(inner)
    document.body.appendChild(overlay)

    // animate in
    requestAnimationFrame(()=>{
      overlay.classList.add('show')
      inner.classList.add('show')
      setTimeout(()=> large.classList.add('show'), 30)
    })

    let currentIndex = (typeof startIndex === 'number') ? startIndex : 0
    showImage(large, currentIndex)

    function close() {
      overlay.classList.remove('show')
      inner.classList.remove('show')
      large.classList.remove('show')
      if (keyHandler) document.removeEventListener('keydown', keyHandler)
      keyHandler = null
      const removeAfter = () => { overlay.remove(); overlay.removeEventListener('transitionend', removeAfter) }
      overlay.addEventListener('transitionend', removeAfter)
      setTimeout(()=>{ if (document.body.contains(overlay)) overlay.remove() }, 450)
    }

    prev.addEventListener('click', (ev)=>{ ev.stopPropagation(); currentIndex = currentIndex - 1; showImage(large, currentIndex) })
    next.addEventListener('click', (ev)=>{ ev.stopPropagation(); currentIndex = currentIndex + 1; showImage(large, currentIndex) })

    overlay.addEventListener('click', (ev)=>{ if (ev.target === overlay) close() })

    keyHandler = function(ev) {
      if (ev.key === 'ArrowLeft') { currentIndex = currentIndex - 1; showImage(large, currentIndex) }
      else if (ev.key === 'ArrowRight') { currentIndex = currentIndex + 1; showImage(large, currentIndex) }
      else if (ev.key === 'Escape') { close() }
    }
    document.addEventListener('keydown', keyHandler)

    // return close if caller wants to programmatically close
    return { close }
  }

  return { open }
}

function onOpenDraw (e) {
  // 
  setTimeout(()=>{
    // 获取挂载容器
    const content = document.querySelector('#content')
    // 获取附件图片
    const sources = document.querySelector('#attachment').querySelectorAll('.ant-table-cell:first-child a')
    const urls = sources.length > 0 ? Array.from(sources).map(ele=>ele.href) : []
    if (urls.length === 0) return

    // 确保样式存在
    // ensureLightboxCss()

    // 创建缩略图容器
    const imgContainer = document.createElement('div')
    // 
    const lightbox = createLightbox(urls)
    createThumbnails(imgContainer, urls, (index)=> lightbox.open(index))

    // 缩略图挂载到页面上
    content.appendChild(imgContainer)
  }, 1000)
}
