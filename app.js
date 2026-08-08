const photos = [
  {f:'001.webp',o:'landscape'},
  {f:'002.webp',o:'landscape'},
  {f:'003.webp',o:'portrait'},
  {f:'004.webp',o:'portrait'},
  {f:'005.webp',o:'landscape'},
  {f:'006.webp',o:'portrait'},
  {f:'007.webp',o:'portrait'},
  {f:'008.webp',o:'portrait'},
  {f:'009.webp',o:'portrait'},
  {f:'010.webp',o:'portrait'},
  {f:'011.webp',o:'portrait'},
  {f:'012.webp',o:'landscape'},
  {f:'013.webp',o:'landscape'},
  {f:'014.webp',o:'landscape'},
  {f:'015.webp',o:'portrait'}
];

const spreads=[];
for(let i=0;i<photos.length;){
  const p=photos[i];
  if(p.o==='landscape'){
    spreads.push({type:'landscape',items:[p],start:i}); i++;
  } else {
    const next=photos[i+1];
    if(next && next.o==='portrait'){
      spreads.push({type:'pair',items:[p,next],start:i}); i+=2;
    } else {
      spreads.push({type:'pair',items:[p,null],start:i}); i++;
    }
  }
}

const views={shelf:document.querySelector('#shelfView'),cover:document.querySelector('#coverView'),reader:document.querySelector('#readerView')};
function show(name){Object.values(views).forEach(v=>v.classList.remove('active'));views[name].classList.add('active');window.scrollTo(0,0)}
document.querySelector('#openAlbum').onclick=()=>show('cover');
document.querySelectorAll('[data-back-shelf]').forEach(b=>b.onclick=()=>show('shelf'));
document.querySelectorAll('[data-back-cover]').forEach(b=>b.onclick=()=>show('cover'));
document.querySelector('#openReader').onclick=()=>{current=0;render();show('reader')};

const strip=document.querySelector('#thumbStrip');
photos.slice(0,8).forEach(p=>{const img=document.createElement('img');img.src='webp/'+p.f;img.alt='미리보기';strip.appendChild(img)});

let current=0, locked=false;
const spreadEl=document.querySelector('#spread');
const book=document.querySelector('#book');
const indicator=document.querySelector('#pageIndicator');
const mobile=()=>window.matchMedia('(max-width:760px)').matches;

function makePage(item,side,pageNo){
  const d=document.createElement('div');d.className='page '+side;
  if(item){const img=document.createElement('img');img.src='webp/'+item.f;img.alt='앨범 사진';d.appendChild(img)}else{d.classList.add('blank-page');d.textContent='';}
  const n=document.createElement('div');n.className='page-number';n.textContent=pageNo;d.appendChild(n);return d;
}
function render(){
  spreadEl.innerHTML='';
  const s=spreads[current];
  if(!s)return;
  if(s.type==='landscape'){
    const d=document.createElement('div');d.className='landscape-spread';
    const img=document.createElement('img');img.src='webp/'+s.items[0].f;img.alt='가로 사진';d.appendChild(img);spreadEl.appendChild(d);
  }else{
    const left=makePage(s.items[0],'left',s.start+1);spreadEl.appendChild(left);
    if(!mobile()){spreadEl.appendChild(makePage(s.items[1],'right',s.items[1]?s.start+2:''));}
  }
  indicator.textContent=`${current+1} / ${spreads.length}`;
}
function turn(delta){
  if(locked)return; const next=current+delta;if(next<0||next>=spreads.length)return;
  locked=true;book.classList.add('turning');
  setTimeout(()=>{current=next;render()},250);
  setTimeout(()=>{book.classList.remove('turning');locked=false},560);
}
document.querySelector('#nextBtn').onclick=()=>turn(1);document.querySelector('#prevBtn').onclick=()=>turn(-1);
window.addEventListener('keydown',e=>{if(!views.reader.classList.contains('active'))return;if(e.key==='ArrowRight')turn(1);if(e.key==='ArrowLeft')turn(-1)});
window.addEventListener('resize',render);

// corner hover + drag gesture
book.addEventListener('mousemove',e=>{const r=book.getBoundingClientRect();const near=(r.right-e.clientX<120 && r.bottom-e.clientY<120);book.classList.toggle('curl-hover',near)});
book.addEventListener('mouseleave',()=>book.classList.remove('curl-hover'));
let dragStart=null;
book.addEventListener('pointerdown',e=>{const r=book.getBoundingClientRect();if(r.right-e.clientX<150 && r.bottom-e.clientY<150){dragStart={x:e.clientX,y:e.clientY};book.setPointerCapture(e.pointerId);book.classList.add('curl-hover')}});
book.addEventListener('pointerup',e=>{if(!dragStart)return;const dx=dragStart.x-e.clientX;const dy=dragStart.y-e.clientY;dragStart=null;book.classList.remove('curl-hover');if(dx>70||dy>70)turn(1)});

// touch swipe fallback
let tx=null;book.addEventListener('touchstart',e=>tx=e.touches[0].clientX,{passive:true});book.addEventListener('touchend',e=>{if(tx==null)return;const dx=tx-e.changedTouches[0].clientX;if(Math.abs(dx)>50)turn(dx>0?1:-1);tx=null},{passive:true});

document.querySelector('#fullscreenBtn').onclick=async()=>{try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen()}catch{}};

const search=document.querySelector('#search');search.addEventListener('input',()=>{document.querySelector('.bookcard').style.display='테스트앨범'.includes(search.value.trim())?'':'none'});
render();
