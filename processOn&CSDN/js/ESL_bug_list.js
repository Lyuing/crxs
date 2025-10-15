document.addEventListener('DOMContentLoaded', () => {
  setTimeout(checkUrlChange, 500);
});

// 监听URL变化
if (typeof window.navigation === 'object' && window.navigation.addEventListener) {
  // 对于支持 Navigation API 的现代浏览器
  window.navigation.addEventListener('navigate', (e) => {
    console.log('URL navigate changed', e.navigationType, e.navigationType === 'push');
    e.navigationType !== 'replace' && setTimeout(checkUrlChange, 500);
  });
}

// URL变化检测函数
function checkUrlChange() {
  // 正则匹配地址是否是 ESL_PLAT_BUG/122 这样的数字结尾
  const reg = /ESL_PLAT_BUG\/(\d+)/
  if (reg.test(location.href)) {
    // 详情页
    initESL_bug()
  } else {
    // 列表页
    initESL_bug_list()
  }
}


function initESL_bug () {
  execution()
}
function initESL_bug_list () {
  // 使用事件代理：在 #main 上注册一次 click 监听，匹配子元素选择器，避免关心加载时机
  const main = document.querySelector('#main') || document.querySelector('#root')
  // console.warn('ESL_bug_list.js init', main)
  const selector = '.ezTable [class^="_leftBorder_"], .ezTable [class*=" _leftBorder_"]'

  main.addEventListener('click', (ev) => {
    try {
      const matched = ev.target && ev.target.closest ? ev.target.closest(selector) : null
      if (!matched) return
      // 确保匹配节点在 main 内（如果 main 是 document，则跳过此检查）
      if (main !== document && !main.contains(matched)) return
      // 将匹配到的元素放到事件对象上，供 execution 使用
      ev.delegatedTarget = matched
      execution(ev)
    } catch (err) {
      console.error('esl delegation error', err)
    }
  })
}


/**
 * 初始化步骤
 * 提取附件
 * 创建缩略图
 */
function execution (e) {
  setTimeout(()=>{
    // 获取挂载容器
    const content = document.querySelector('#content')
    // 获取附件链接
    const attachment = document.querySelector('#attachment')
    if (!attachment) return
    const sources = attachment.querySelectorAll('.ant-table-cell:first-child a')
    const hrefs = sources.length > 0 ? Array.from(sources).map(ele=>ele.href) : []
    if (hrefs.length === 0) return

    // 将 hrefs 转换为 media items：{ type: 'image'|'video', url, poster? }
    const items = hrefs.map(href => {
      if (isVideoUrl(href)) {
        return { type: 'video', url: href, poster: '' }
      }
      return { type: 'image', url: href }
    })
    console.log('提取的地址', items)

    // 确保样式存在
    // ensureLightboxCss()

    // 创建/更新缩略图容器
    const existingContainer = document.getElementById('esl-thumb-container')
    const imgContainer = document.createElement('div')
    imgContainer.setAttribute('id', 'esl-thumb-container')
    
    // 创建遮罩层
    const lightbox = createLightbox(items)
    // 创建缩略图
    createThumbnails(imgContainer, items, (index)=> lightbox.open(index))

    // 如果已存在缩略图容器则替换，否则追加
    if (existingContainer) {
      content.replaceChild(imgContainer, existingContainer)
    } else {
      content.appendChild(imgContainer)
    }
  }, 1000)
}

// 内容区追加缩略图
function createThumbnails(container, items, onOpen) {
  // items: [{ type: 'image'|'video', url, poster? }]
  container.classList.add('esl-thumb-container')
  items.forEach((it, i) => {
    if (it.type === 'video') {
      const wrap = document.createElement('div')
      wrap.className = 'esl-thumb-video-wrap'
      wrap.dataset.eslIndex = i
      wrap.style.cursor = 'zoom-in'

      const video = document.createElement('video')
      video.className = 'esl-thumb esl-thumb-video'
      video.alt = '视频预览'
      video.src = it.url

      const play = document.createElement('div')
      play.className = 'esl-video-play-overlay'
      play.innerHTML = '▶'

      wrap.appendChild(video)
      wrap.appendChild(play)
      wrap.addEventListener('click', (ev) => { ev.stopPropagation(); onOpen(i) })
      container.appendChild(wrap)
    } else {
      const img = document.createElement('img')
      img.src = it.url
      img.classList.add('esl-thumb')
      img.dataset.eslIndex = i
      img.style.cursor = 'zoom-in'
      img.addEventListener('click', (ev) => { ev.stopPropagation(); onOpen(i) })
      container.appendChild(img)
    }
  })
}

// 遮罩层
function createLightbox(urls) {
  // creates overlay per open; keeps internal handlers for cleanup
  let keyHandler = null
  let currentIndex = 0

  function showItem(containerEl, offset) {
    if( offset ) {
      const index = currentIndex + offset
      if (index < 0) currentIndex = urls.length - 1
      else if (index >= urls.length) currentIndex = 0
      else currentIndex = index
    }
    const item = urls[currentIndex]
    // clear
    containerEl.innerHTML = ''
    if (item.type === 'video') {
      const video = document.createElement('video')
      video.className = 'esl-large-media'
      video.src = item.url
      video.controls = true
      video.autoplay = true
      video.style.maxHeight = '80vh'
      video.style.maxWidth = '90vw'
      if (item.poster) video.poster = item.poster
      containerEl.appendChild(video)
      // add show class so any transition styles apply
      requestAnimationFrame(()=> video.classList.add('show'))
    } else {
      const img = document.createElement('img')
      img.className = 'esl-large'
      img.alt = '预览图'
      img.src = item.url
      containerEl.appendChild(img)
      // ensure image fade-in like previous behavior
      requestAnimationFrame(()=> img.classList.add('show'))
    }
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

    const mediaContainer = document.createElement('div')
    mediaContainer.className = 'esl-media-container'

    inner.appendChild(prev)
    inner.appendChild(mediaContainer)
    inner.appendChild(next)
    overlay.appendChild(inner)
    document.body.appendChild(overlay)

    // animate in
    requestAnimationFrame(()=>{
      overlay.classList.add('show')
      inner.classList.add('show')
      setTimeout(()=> mediaContainer.classList.add('show'), 30)
    })

    currentIndex = startIndex ? startIndex-0 : currentIndex
    showItem(mediaContainer)

    function close() {
      // pause video if playing
      const vid = mediaContainer.querySelector('video')
      if (vid && !vid.paused) try { vid.pause() } catch (e) {}
      overlay.classList.remove('show')
      inner.classList.remove('show')
      mediaContainer.classList.remove('show')
      if (keyHandler) document.removeEventListener('keydown', keyHandler)
      keyHandler = null
      const removeAfter = () => { overlay.remove(); overlay.removeEventListener('transitionend', removeAfter) }
      overlay.addEventListener('transitionend', removeAfter)
      setTimeout(()=>{ if (document.body.contains(overlay)) overlay.remove() }, 450)
    }

    prev.addEventListener('click', (ev)=>{ ev.stopPropagation(); showItem(mediaContainer, -1) })
    next.addEventListener('click', (ev)=>{ ev.stopPropagation(); showItem(mediaContainer, 1) })

    overlay.addEventListener('click', (ev)=>{ if (ev.target === overlay) close() })

    keyHandler = function(ev) {
      if (ev.key === 'ArrowLeft') { showItem(mediaContainer, -1) }
      else if (ev.key === 'ArrowRight') { showItem(mediaContainer, 1) }
      else if (ev.key === 'Escape') { close() }
    }
    document.addEventListener('keydown', keyHandler)

    // return close if caller wants to programmatically close
    return { close }
  }

  return { open }
}


function isVideoUrl(url) {
  if (!url) return false
  try {
    const u = url.split('?')[0].split('#')[0]
    return /\.(mp4|webm|ogg|mov|m4v|mkv)$/i.test(u)
  } catch (err) {
    return false
  }
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
