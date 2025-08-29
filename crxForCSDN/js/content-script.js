document.addEventListener('DOMContentLoaded', () => {
  setTimeout(()=>{
    init()
  }, 0)
});


function init () {
  // 一、csdn 屏蔽登录复制
  document.querySelectorAll("code, pre").forEach(ele=>{
    ele.style.userSelect='auto';
  })


  const content = document.querySelector("#content_views")
  if( content ) {
    content.setAttribute("oncopy", "")
    const contentClone = content.cloneNode(true);   // 克隆按钮
    content.parentNode.replaceChild(contentClone, content);  // 替回按钮
  
    const buttons = document.querySelectorAll(".hljs-button") || [];
    buttons.forEach((btn) => {
      btn.setAttribute("onclick", "");  // 移除点击事件
      const elClone = btn.cloneNode(true);   // 克隆按钮
      elClone.dataset.title = "复制";       // 更改标题
      btn.parentNode.replaceChild(elClone, btn);  // 替回按钮
      elClone.addEventListener("click", (e) => {
        // 实现复制
        const parentPreBlock = e.target.closest("pre");
        const codeBlock = parentPreBlock.querySelector("code");
        copy(codeBlock.innerText);

        e.target.dataset.title = "复制成功";
        setTimeout(() => {
          e.target.dataset.title = "复制";
        }, 1000);
        e.stopPropagation();
        e.preventDefault();
      });
    });
  
  }

  
  // 二、解除 关注博主即可阅读全文的提示，
  if(document.querySelector('.btn-readmore')){
    addCSS( `.hide-article-box{
      z-index: -1 !important;
    }`)
  }

  // 三、processOn 下载破解
  if(document.querySelector('.water_mark_alert')){
    const dialog = document.querySelector('.water_mark_alert')
    const btns = dialog.querySelector('.w_m_r_bottom')
    // <div class="custom-btn">破解下载限制</div>
    const vipBtn = document.createElement('div')
    vipBtn.innerHTML = `<div class="custom-btn">破解下载限制</div>`
    vipBtn.addEventListener('click', ()=>{
      // 执行下载
      exportDomSvg( dialog.querySelector('.water_perview svg') )
    })
    btns.appendChild(vipBtn)
  }



  // 四、hik 缺陷单显示图片
  setTimeout(()=>{
    // window.indexedDB.databases().then(res=>{
    //   console.log(res)
    // }).catch(err=>{
    //   console.log(err)
    // })
    document.querySelectorAll(".et_att a").forEach(ele=>{
      let url = ele.getAttribute('url');
      let node = document.createElement("b");
      if(isImg(url)){
        node = document.createElement("img");
        node.src = url;
        node.style.maxWidth='80%';
        ele.parentNode.appendChild(node);
      }
      else if(isVideo(url)){
        console.log('url', url)
        createVideo(url, ele)
        // node = document.createElement("video");
        // node.controls = true;
        // node.muted = true;
        // node.src = url;
        // node.style.maxWidth='100%';
        // node.onerror = async err=>{
        //   if(hasTry) return;
        //   hasTry = true
        //   console.log(err)

        //   let blob = await requestBlob(url)
        //   console.log(blob)
        //   let blobUrl = getUrl(blob)
        //   console.log(blobUrl)
        //   node.src = blobUrl;
        // }
        // ele.parentNode.appendChild(node);

        
        
        // $.get(url, res=>{
        //   console.log('res', res)
        //   // let blob = new Blob([res], { type: "video/*" });
        //   // let videoUrl = URL.createObjectURL(blob); // 获取URL
        //   var reader = new FileReader();
        //   reader.onload = function(e) {
        //     document.createElement('img').src = e.target.result;
        //   };
        //   reader.readAsDataURL(f);

        //   console.log(videoUrl)
        //   node.src = videoUrl;
        //   node.style.maxWidth='100%';
        //   ele.parentNode.appendChild(node);
        // }, err=>{
        //   console.log(err)
        // })
        
      }
      
    })
  }, 1500)
}


function copy(str) {
  navigator.clipboard.writeText(str);
}
function addCSS(styles) {
  let styleSheet = document.createElement("style")
  styleSheet.innerText = styles
  document.head.appendChild(styleSheet)
}

function exportDomSvg(dom) {
  // 克隆 SVG 节点
  const svg = dom.cloneNode(true);
  svg.setAttribute("style", "");
  svg.removeChild(svg.querySelector('#custom_mark__rect'))
  console.log( document.title, svg)
  // 获取 SVG 的序列化字符串
  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(svg);
  
  // 确保 SVG 包含正确的命名空间声明
  if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
    svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  
  // 创建 Blob 对象
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  
  // 创建下载链接
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${document.title || 'processon-diagram'}.svg`;
  document.body.appendChild(a);
  a.click();
  
  // 清理
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

const isImg = type => {
  let t = type?.toLocaleLowerCase() || ''
  return /\.(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$/.test(t)
}
const isVideo = type => {
  let t = type?.toLocaleLowerCase() || ''
  return /\.(mp4|mkv|wmv)$/.test(t)
}
const requestBlob = url=>{
  return new Promise((resolve, reject)=>{
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    xhr.onreadystatechange = function(event) {
      if ( this.readyState == 4 && this.status == 200 ) {
        let res = this.response
        // console.log(res)
        resolve(res)
      }
    };
    xhr.send();
  })
}
const getUrl = blob=>{
  let url = URL.createObjectURL(blob);
  // URL.revokeObjectURL(url)
  return url
}
const createVideo = async (url, ele)=>{
  let blob = await requestBlob(url)
  let blobUrl = getUrl(blob)

  node = document.createElement("video");
  node.controls = true;
  node.muted = true;
  node.src = blobUrl;
  node.style.maxWidth='100%';
  node.onerror = function (err) {
    // console.log(err)
    console.log(this.error)
  }
  ele.parentNode.appendChild(node);
}