import{a as k,s as T,d as Z}from"./Toast-BwR22KmJ.js";async function X(){try{console.log("📂 Loading themed categories...");const e=await(await fetch("/api/rophim/categories/all")).json();return e&&e.categories?(console.log(`✓ Loaded ${Object.keys(e.categories).length} category sections`),e.categories):null}catch(t){return console.error("Error loading categories:",t),null}}function V(t){const e=document.createElement("div");return e.className="video-card__ranking",t<=3&&e.classList.add(`video-card__ranking--${t}`),e.textContent=`#${t}`,e}function W(t){if(!t)return null;const e=document.createElement("div");e.className="video-card__badge";const r=t.toUpperCase();return r.includes("HOT")?e.classList.add("video-card__badge--hot"):r.includes("NEW")?e.classList.add("video-card__badge--new"):r.includes("CINEMA")?e.classList.add("video-card__badge--cinema"):r.includes("FULL")&&e.classList.add("video-card__badge--full"),e.textContent=r,e}function ee(t,e){if(!t)return t;const r=t.querySelector(".video-card__container");if(!r)return t;if(e.badge){const i=W(e.badge);i&&r.appendChild(i)}if(e.ranking){const i=V(e.ranking);r.appendChild(i)}return t}typeof window<"u"&&(window.categorySystem={loadCategories:X,createRankingBadge:V,createQualityBadge:W,enhanceVideoCardWithBadges:ee});const N="kvstream-images-v1",te=500;class ae{constructor(){this.memoryCache=new Map,this.cacheEnabled="caches"in window,this.pendingRequests=new Map}async getCachedImage(e){if(!e||!this.cacheEnabled)return e;if(this.memoryCache.has(e))return this.memoryCache.get(e);if(this.pendingRequests.has(e))return this.pendingRequests.get(e);const r=this._fetchAndCache(e);this.pendingRequests.set(e,r);try{return await r}finally{this.pendingRequests.delete(e)}}async _fetchAndCache(e){try{const r=await caches.open(N),i=await r.match(e);if(i){const d=await i.blob(),m=URL.createObjectURL(d);return this.memoryCache.set(e,m),m}const s=await fetch(e,{mode:"cors",credentials:"omit"});if(s.ok){const d=s.clone();r.put(e,d);const m=await s.blob(),a=URL.createObjectURL(m);return this.memoryCache.set(e,a),this._cleanupCache(r),a}}catch{console.warn("Image cache failed:",e)}return e}async preloadImages(e){if(!e||e.length===0)return;const r=6;for(let i=0;i<e.length;i+=r){const s=e.slice(i,i+r);await Promise.allSettled(s.map(d=>this.getCachedImage(d)))}}createCachedImage(e,r="",i=""){const s=document.createElement("img");return s.alt=r,s.className=i,s.loading="lazy",s.decoding="async",s.src='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450"%3E%3Crect fill="%23222"%3E%3C/rect%3E%3C/svg%3E',e&&this.getCachedImage(e).then(d=>{s.src=d}),s}async _cleanupCache(e){try{const r=await e.keys();if(r.length>te){const i=Math.floor(r.length*.2);for(let s=0;s<i;s++)await e.delete(r[s])}}catch{}}async clearCache(){this.memoryCache.clear(),this.cacheEnabled&&await caches.delete(N)}async getCacheStats(){const e={memoryItems:this.memoryCache.size,cacheItems:0,cacheSize:0};if(this.cacheEnabled)try{const i=await(await caches.open(N)).keys();e.cacheItems=i.length}catch{}return e}}const re=new ae;function ie(t){var i;const e=new Date().getFullYear();if(t.year===e)return!0;const r=(t.quality||"").toLowerCase();if(r.includes("mới")||r.includes("new"))return!0;if((i=t.modified)!=null&&i.time){const s=new Date(t.modified.time),d=new Date(Date.now()-7*24*60*60*1e3);if(s>d)return!0}return!1}function se(t){var s;const e=(t.quality||"").toLowerCase(),r=((s=t.episodes)==null?void 0:s.length)||0,i=(t.category||t.type||"").toLowerCase();return e.includes("trailer")||i.includes("trailer")?"trailer":r>1||i.includes("series")||i.includes("phim-bo")||e.includes("tập")||e.includes("ep")?"series":i.includes("hoathinh")||i.includes("animation")||i.includes("anime")?"animation":"movie"}function oe(t){var s;const e=t.quality||"";if(e.match(/(?:tập\s*)?(\d+)(?:\s*\/\s*(\d+))?/i))return e;const i=((s=t.episodes)==null?void 0:s.length)||0;return i>1?`${i} Tập`:null}function ne(t,e,r){var I;const i=document.createElement("div");i.className="video-card",i.dataset.videoId=t.id;const s=t.thumbnail||"",d=t.year||new Date().getFullYear(),m=ie(t),a=se(t),o=oe(t);let u=t.quality||"HD";u=u.replace(/(?:tập\s*)?\d+(?:\s*\/\s*\d+)?/gi,"").trim()||"HD",u.length>6&&(u="HD");const n=parseFloat(t.rating||0),c=n>=7,g=Math.round(n*10);let h="";n>0&&(h=`
            <div class="numeric-rating">
                <span class="numeric-rating__score">${n.toFixed(1)}</span>
            </div>
        `);let f="";n>0&&(f=`
            <div class="tomato-badge ${c?"tomato-badge--fresh":"tomato-badge--rotten"}">
                <span class="tomato-badge__icon">${c?"🍅":"🥀"}</span>
                <span class="tomato-badge__score">${g}%</span>
            </div>
        `);const x='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450"%3E%3Crect width="300" height="450" fill="%2314141c"/%3E%3C/svg%3E';let b="";m&&(b+='<span class="video-tag video-tag--new">MỚI</span>'),a==="trailer"?b+='<span class="video-tag video-tag--trailer">TRAILER</span>':a==="series"?b+='<span class="video-tag video-tag--series">PHIM BỘ</span>':a==="animation"&&(b+='<span class="video-tag video-tag--animation">HOẠT HÌNH</span>'),i.innerHTML=`
        <div class="video-card__container">
            <div class="video-card__poster">
                <img src="${x}" data-src="${s}" alt="${G(t.title)}" loading="lazy" referrerpolicy="no-referrer" class="video-card__img" onerror="this.onerror=null;this.src='https://placehold.co/400x600/14141c/e5c07b?text=Movie'">
                
                <!-- Top Left Tags -->
                <div class="video-tags">
                    ${b}
                </div>
                
                <!-- Bottom Right Info (Ratings & Quality) -->
                <div class="card-meta-bottom-right">
                    ${f}
                    ${h}
                    <span class="poster-badge">${u}</span>
                </div>
                
                <!-- Bottom Left Info (Year & Episodes) -->
                <div class="card-meta-bottom-left">
                    <span class="year-badge">${d}</span>
                    ${o?`<span class="episode-badge">${o}</span>`:""}
                </div>
                
                <!-- Watch Progress Bar -->
                ${t.progress&&t.progress.percentage>0?`
                <div class="video-card__progress">
                    <div class="video-card__progress-fill" style="width: ${t.progress.percentage}%"></div>
                </div>
                `:""}
                
                <!-- Play overlay on hover -->
                <div class="video-card__overlay">
                    <button class="video-card__play-btn" data-action="play" aria-label="Play">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Movie Title -->
        <div class="video-card__title">
            <span class="video-card__name">${G(t.title)}</span>
        </div>
    `;const y=i.querySelector(".video-card__img");if(y&&s){const B=new IntersectionObserver(Y=>{Y.forEach(J=>{J.isIntersecting&&(re.getCachedImage(s).then(Q=>{y.src=Q,y.classList.add("loaded")}).catch(()=>{y.src=s,y.onload=()=>y.classList.add("loaded"),y.onerror=()=>y.classList.add("loaded")}),B.unobserve(y))})},{rootMargin:"800px",threshold:0});B.observe(y)}return(I=i.querySelector('[data-action="play"]'))==null||I.addEventListener("click",B=>{B.stopPropagation(),e==null||e(t)}),i.addEventListener("click",()=>{e==null||e(t)}),i}function G(t){if(!t)return"";const e=document.createElement("div");return e.textContent=t,e.innerHTML}function le(t,e){let r;return function(...s){const d=()=>{clearTimeout(r),t(...s)};clearTimeout(r),r=setTimeout(d,e)}}function ce(t,e,r){if(!t||!e)return;const i=300;let s="";async function d(a){if(s=a,!a||a.length<2){e.classList.remove("active"),e.innerHTML="";return}try{const o=await k.searchRophim(a),u=(o==null?void 0:o.movies)||[];if(a!==s)return;u.length===0?e.innerHTML=`
                    <div class="search__result" style="opacity: 0.5;">
                        <span>No results found for "${$(a)}"</span>
                    </div>
                `:(e.innerHTML=u.map(n=>`
                    <div class="search__result" data-video-slug="${n.slug}">
                        <img 
                            src="${n.poster_url||n.thumb_url||n.thumbnail||'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 45" fill="%231a1a1a"%3E%3Crect width="80" height="45"/%3E%3C/svg%3E'}" 
                            alt="${$(n.name||n.title)}"
                            class="search__result-thumb"
                            loading="lazy"
                        >
                        <div class="search__result-info">
                            <div class="search__result-title">${$(n.name||n.title)}</div>
                            <div class="search__result-meta">
                                ${n.quality?`${n.quality} • `:""}
                                ${n.year||""}
                            </div>
                        </div>
                    </div>
                `).join(""),e.querySelectorAll(".search__result[data-video-slug]").forEach(n=>{n.addEventListener("click",()=>{const c=n.dataset.videoSlug;window.location.href=`/watch.html?id=${c}&slug=${c}`})})),e.classList.add("active")}catch(o){console.error("Search error:",o),e.innerHTML=`
                <div class="search__result" style="color: var(--color-error);">
                    <span>Search failed. Please try again.</span>
                </div>
            `,e.classList.add("active")}}const m=le(d,i);t.addEventListener("input",a=>{m(a.target.value.trim())}),document.addEventListener("click",a=>{t&&e&&!t.contains(a.target)&&!e.contains(a.target)&&e.classList.remove("active")}),t.addEventListener("keydown",a=>{a.key==="Escape"&&(t.blur(),e.classList.remove("active"))}),t.addEventListener("focus",()=>{t.value.trim().length>=2&&e.classList.add("active")})}function $(t){if(!t)return"";const e=document.createElement("div");return e.textContent=t,e.innerHTML}class de{constructor(){this.currentFocus=null,this.isEnabled=!1,this.selectors=[".video-card",".hero__btn",".slider-btn","#topSearchBtn"]}init(){this.isEnabled=!0,document.addEventListener("keydown",this.handleKey.bind(this)),document.addEventListener("mousemove",this.handleMouseMove.bind(this))}handleMouseMove(){this.currentFocus&&(this.currentFocus.blur(),this.currentFocus.classList.remove("keyboard-focused"),this.currentFocus=null)}handleKey(e){if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)){if(e.preventDefault(),!this.currentFocus){this.focusFirstVisible();return}let r=null;switch(e.key){case"ArrowRight":r=this.moveHorizontal(1);break;case"ArrowLeft":r=this.moveHorizontal(-1);break;case"ArrowUp":r=this.moveVertical(-1);break;case"ArrowDown":r=this.moveVertical(1);break}r&&this.setFocus(r)}else e.key==="Enter"&&this.currentFocus&&this.currentFocus.click()}focusFirstVisible(){const e=document.querySelectorAll(".video-card");e.length>0&&this.setFocus(e[0])}setFocus(e){this.currentFocus&&this.currentFocus.classList.remove("keyboard-focused"),this.currentFocus=e,e.classList.add("keyboard-focused"),e.focus({preventScroll:!0}),e.scrollIntoView({behavior:"smooth",block:"center",inline:"center"})}moveHorizontal(e){if(!this.currentFocus)return null;const r=Array.from(document.querySelectorAll(this.selectors.join(","))),i=r.indexOf(this.currentFocus);if(i===-1)return null;const s=i+e;if(s>=0&&s<r.length){const d=this.currentFocus.getBoundingClientRect(),m=r[s],a=m.getBoundingClientRect();return Math.abs(d.top-a.top)>d.height*.5,m}return null}moveVertical(e){if(!this.currentFocus)return null;const r=this.currentFocus.getBoundingClientRect(),i=r.left+r.width/2,d=Array.from(document.querySelectorAll(this.selectors.join(","))).filter(o=>{if(o===this.currentFocus)return!1;const u=o.getBoundingClientRect();return e===1?u.top>=r.bottom-r.height*.2:u.bottom<=r.top+r.height*.2});if(d.length===0)return null;let m=null,a=1/0;return d.forEach(o=>{const u=o.getBoundingClientRect(),n=u.left+u.width/2;u.top+u.height/2;const c=Math.abs(u.top-r.top),g=Math.abs(n-i),h=Math.sqrt(Math.pow(c,2)+Math.pow(g,2));h<a&&(a=h,m=o)}),m}}const p={videos:[],currentCategory:"all",currentVideo:null,isLoading:!1,featuredVideo:null,heroMovies:[],currentHeroIndex:0,heroInterval:null,page:1,hasMore:!0},l={videoGrid:document.getElementById("videoGrid")||document.getElementById("mainContent"),mainContent:document.getElementById("mainContent"),loading:document.getElementById("loading"),emptyState:document.getElementById("emptyState"),categories:document.getElementById("categories"),mainHeader:document.getElementById("mainHeader"),searchWrapper:document.getElementById("searchWrapper"),searchToggle:document.getElementById("searchToggle"),searchInput:document.getElementById("searchInput"),searchResults:document.getElementById("searchResults"),navLinks:document.querySelectorAll(".header__nav-link"),playerModal:document.getElementById("playerModal"),playerContainer:document.getElementById("playerContainer"),playerTitle:document.getElementById("playerTitle"),playerMeta:document.getElementById("playerMeta"),closePlayer:document.getElementById("closePlayer"),modalBackdrop:document.getElementById("modalBackdrop"),mobileNavItems:document.querySelectorAll(".mobile-nav__item, .sidebar__nav-item"),mobileBottomNavButtons:document.querySelectorAll("#mobileBottomNav .nav-item")};function _(t){document.querySelectorAll("#mobileBottomNav .nav-item").forEach(r=>{const i=r.dataset.view===t;r.classList.toggle("active",i),r.classList.toggle("text-white",i),r.classList.toggle("text-gray-400",!i);const s=r.querySelector(".material-symbols-outlined");s&&(s.style.fontVariationSettings=i?"'FILL' 1":"'FILL' 0")})}async function q(){ce(l.searchInput,l.searchResults),l.mobileBottomNavButtons&&l.mobileBottomNavButtons.forEach(i=>{i.addEventListener("click",s=>{s.preventDefault();const d=i.dataset.view;if(d){if(l.mobileBottomNavButtons.forEach(m=>m.classList.remove("active")),i.classList.add("active"),d==="home")ye();else if(d==="search")if(window.innerWidth<768)try{R()}catch(m){console.error("Search render failed",m)}else l.searchWrapper.classList.add("active"),l.searchInput.focus();else d==="mylist"?window.innerWidth<768?z():H("mylist"):d==="downloads"?T("Downloads feature coming soon!","info"):d==="profile"?fe():d==="cinema"?(_("cinema"),L("cinema")):L(d);window.scrollTo({top:0,behavior:"smooth"})}})}),me(),await L("home"),await E();const e=new URLSearchParams(window.location.search).get("view");e&&window.innerWidth<768&&(e==="search"?R():e==="mylist"?z():e==="cinema"&&L("cinema")),new de().init(),"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("/sw.js")})}function E(t=null){const e=document.getElementById("heroTitle"),r=document.getElementById("heroDescription"),i=document.getElementById("heroBg"),s=document.getElementById("heroTag"),d=document.getElementById("heroTagContainer"),m=document.getElementById("heroPlayBtn"),a=document.getElementById("heroInfoBtn"),o=document.getElementById("heroContent"),u=t||p.featuredVideo||p.videos[0];u&&(i&&(i.style.opacity="0.5"),o&&(o.style.opacity="0"),setTimeout(()=>{e&&(e.textContent=u.name||u.title||"Featured Movie"),r&&(r.textContent=u.description||u.content||"Watch now on StreamFlix");const n=u.backdrop||u.poster_url||u.thumb_url||u.thumbnail||"";if(i&&n&&(i.style.backgroundImage=`url('${n}')`),s&&d){const c=u.genres||u.category;d.classList.remove("hidden"),c&&Array.isArray(c)&&c.length>0?s.textContent=c[0]:typeof c=="string"?s.textContent=c:s.textContent="#1 in Movies Today"}if(m){const c=m.cloneNode(!0);m.parentNode.replaceChild(c,m),c.addEventListener("click",()=>w(u))}if(a){const c=a.cloneNode(!0);a.parentNode.replaceChild(c,a),c.addEventListener("click",()=>U(u))}i&&(i.style.opacity="1"),o&&(o.style.opacity="1")},300),p.featuredVideo=u)}function ue(){p.heroInterval&&clearInterval(p.heroInterval),!(!p.heroMovies||p.heroMovies.length<=1)&&(p.heroInterval=setInterval(()=>{p.currentHeroIndex++,p.currentHeroIndex>=p.heroMovies.length&&(p.currentHeroIndex=0),E(p.heroMovies[p.currentHeroIndex])},8e3))}function me(){var a,o,u,n;const t=document.getElementById("backToTop"),e=()=>{const c=window.scrollY;l.mainHeader&&(c>100?(l.mainHeader.classList.add("scrolled"),l.mainHeader.style.backgroundColor="#141414"):(l.mainHeader.classList.remove("scrolled"),l.mainHeader.style.backgroundColor="transparent")),t&&(c>500?t.classList.add("visible"):t.classList.remove("visible"))};window.addEventListener("scroll",e,{passive:!0}),e(),t&&t.addEventListener("click",()=>{window.scrollTo({top:0,behavior:"smooth"})}),(a=l.navLinks)==null||a.forEach(c=>{c.addEventListener("click",g=>{g.preventDefault();const h=c.dataset.category;l.navLinks.forEach(f=>f.classList.remove("active")),c.classList.add("active"),p.currentCategory=h,S(h,!0)})}),(o=l.mobileNavItems)==null||o.forEach(c=>{c.addEventListener("click",g=>{g.preventDefault();const h=c.dataset.view;if(l.mobileNavItems.forEach(f=>f.classList.remove("active")),c.classList.add("active"),l.mobileNavItems.forEach(f=>{f.dataset.view===h&&f.classList.add("active")}),h==="home"){l.videoGrid.style.display="block";const f=document.getElementById("newHotContainer");f&&(f.style.display="none"),p.currentCategory="all",S("all",!0)}else if(["movies","series","animation","cinema"].includes(h)){l.videoGrid.style.display="block";const f=document.getElementById("newHotContainer");f&&(f.style.display="none"),p.currentCategory=h,S(h,!0)}else if(h==="history"){l.videoGrid.style.display="block";const f=document.getElementById("newHotContainer");f&&(f.style.display="none"),H()}else if(h==="search"){const f=document.getElementById("headerSearchBtn");f&&f.click()}window.scrollTo({top:0,behavior:"smooth"})})});const r=document.querySelectorAll(".netflix-header__nav-link");r.forEach(c=>{c.addEventListener("click",g=>{g.preventDefault();const h=c.dataset.view;r.forEach(x=>x.classList.remove("active")),c.classList.add("active"),l.mobileNavItems.forEach(x=>{x.classList.remove("active"),x.dataset.view===h&&x.classList.add("active")}),l.videoGrid.style.display="block";const f=document.getElementById("newHotContainer");f&&(f.style.display="none"),h==="home"?(p.currentCategory="all",S("all",!0)):["movies","series","animation","cinema"].includes(h)?(p.currentCategory=h,S(h,!0)):h==="history"&&H(),window.scrollTo({top:0,behavior:"smooth"})})});const i=document.getElementById("headerSearchBtn");i&&i.addEventListener("click",c=>{c.preventDefault();const g=document.getElementById("searchModal"),h=document.getElementById("searchInput");g&&(g.classList.add("active"),h&&setTimeout(()=>h.focus(),100))});const s=document.getElementById("mobileSearchBtn");s&&s.addEventListener("click",c=>{c.preventDefault();const g=document.getElementById("searchModal"),h=document.getElementById("searchInput");g&&(g.classList.add("active"),h&&setTimeout(()=>h.focus(),100))});const d=document.getElementById("closeSearch");d&&d.addEventListener("click",()=>{const c=document.getElementById("searchModal");c&&c.classList.remove("active")});const m=document.querySelectorAll(".nav-link");m.forEach(c=>{c.addEventListener("click",g=>{g.preventDefault();const h=c.dataset.view;m.forEach(f=>{f.classList.remove("active","text-white"),f.classList.add("text-gray-300")}),c.classList.add("active","text-white"),c.classList.remove("text-gray-300"),h==="home"?(p.currentCategory="all",L("home")):h==="series"?(p.currentCategory="series",L("series")):h==="movies"?(p.currentCategory="movies",L("movies")):h==="cinema"?(p.currentCategory="cinema",L("cinema")):h==="history"&&H(),window.scrollTo({top:0,behavior:"smooth"})})}),(u=l.closePlayer)==null||u.addEventListener("click",F),(n=l.modalBackdrop)==null||n.addEventListener("click",F),document.addEventListener("keydown",c=>{var g,h;if(c.key==="Escape"){(g=l.playerModal)!=null&&g.classList.contains("active")&&F(),(h=l.searchWrapper)!=null&&h.classList.contains("active")&&l.searchWrapper.classList.remove("active");const f=document.getElementById("searchModal");f!=null&&f.classList.contains("active")&&f.classList.remove("active")}})}async function S(t="all",e=!1){if(p.isLoading||(e&&(p.page=1,p.hasMore=!0,p.videos=[],l.videoGrid.innerHTML=""),!p.hasMore))return;p.isLoading=!0,C(p.page===1);const r=(s,d=12e3)=>Promise.race([s,new Promise((m,a)=>setTimeout(()=>a(new Error("Timeout")),d))]),i=document.getElementById("topSearchBtn");i&&i.addEventListener("click",s=>{s.preventDefault();const d=document.getElementById("searchModal"),m=document.getElementById("searchInput");d&&(d.classList.add("active"),m&&setTimeout(()=>m.focus(),100))});try{let s=null,d=!1;if(s||(s=await r(k.getRophimCatalog({category:t!=="all"?t:null,page:p.page,limit:24}),12e3)),s&&s.movies&&s.movies.length>0){const m=s.movies.map(n=>({id:n.id||`api_${Date.now()}_${Math.random()}`,title:n.title||"Unknown Title",thumbnail:n.thumbnail||"https://via.placeholder.com/300x450?text=No+Image",backdrop:n.backdrop||n.thumbnail||"https://via.placeholder.com/1920x1080?text=No+Backdrop",preview_url:n.preview_url||"",duration:n.duration||0,resolution:n.quality||"HD",category:n.category||"movies",year:n.year||new Date().getFullYear(),description:n.description||"",matchScore:Math.floor(Math.random()*15)+85,source_url:n.source_url,slug:n.slug,cast:n.cast||[],director:n.director,country:n.country,episodes:n.episodes||[]})),a=new Set(p.videos.map(n=>n.id)),o=m.filter(n=>!a.has(n.id));p.videos=[...p.videos,...o],p.page+=1,m.length<24,p.page===2?D(p.videos,!1):D(o,!0),ge(),v&&v.classList.remove("loading"),p.isLoading=!1,C(!1);return}else p.hasMore=!1,v&&(v.classList.remove("loading"),v.style.display="none"),p.isLoading=!1,C(!1)}catch(s){if(console.warn("API load failed:",s),p.page===1){T("Using offline mode","info");const d=K();p.videos=d,p.featuredVideo=d[0],D(d)}p.isLoading=!1,C(!1)}}function A(t,e,r="poster"){const i=document.createElement("section");i.className="flex flex-col gap-4 mb-12 relative";const s=document.createElement("h2");s.className="text-xl md:text-2xl font-bold text-white hover:text-primary cursor-pointer transition-colors flex items-center gap-2 group px-4 md:px-12",s.innerHTML=`
        ${t}
        <span class="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity text-primary">arrow_forward_ios</span>
    `,i.appendChild(s);const d=document.createElement("div");d.className="relative group/slider";const m=document.createElement("button");m.className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-full bg-gradient-to-r from-black/80 to-transparent opacity-0 group-hover/slider:opacity-100 transition-opacity flex items-center justify-start pl-2",m.innerHTML='<span class="material-symbols-outlined text-white text-3xl">chevron_left</span>';const a=document.createElement("button");a.className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-full bg-gradient-to-l from-black/80 to-transparent opacity-0 group-hover/slider:opacity-100 transition-opacity flex items-center justify-end pr-2",a.innerHTML='<span class="material-symbols-outlined text-white text-3xl">chevron_right</span>';const o=document.createElement("div");o.className="flex gap-3 overflow-x-auto scroll-smooth no-scrollbar px-4 md:px-12 pb-4",e.forEach((n,c)=>{let g;r==="landscape"?g=pe(n):g=he(n,!1,0,"horizontal"),g.className=g.className.replace("w-full",""),g.style.minWidth="280px",g.style.maxWidth="380px",g.style.flex="0 0 auto",o.appendChild(g)});const u=600;return m.addEventListener("click",()=>{o.scrollBy({left:-u,behavior:"smooth"})}),a.addEventListener("click",()=>{o.scrollBy({left:u,behavior:"smooth"})}),d.appendChild(m),d.appendChild(o),d.appendChild(a),i.appendChild(d),i}function he(t,e=!1,r=0,i="vertical"){const s=document.createElement("div"),d=i==="horizontal"?"aspect-video":"aspect-[2/3]";s.className="w-full cursor-pointer snap-start group relative transition-all duration-300 ease-in-out hover:z-30 hover:scale-105";let m=t.poster_url||t.thumb_url||t.thumbnail||"";i==="horizontal"&&t.backdrop&&(m=t.backdrop);const a=t.name||t.title||"Untitled",o=t.year||"",u=t.quality||"HD",n=t.slug||t.id||"",c=t.matchScore||Math.floor(Math.random()*10+90),g=Math.floor(Math.random()*19+80);s.innerHTML=`
        <div class="relative ${d} rounded-md overflow-hidden bg-surface-dark shadow-lg transition-all duration-300 group-hover:shadow-2xl ring-0 group-hover:ring-2 group-hover:ring-white/20">
            <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style="background-image: url('${m}');"></div>
            
            <!-- Gradient Overlay (Only visible on hover) -->
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <!-- Badges Container -->
            <div class="absolute top-2 left-2 flex flex-col gap-1 z-20">
                 ${!e&&o===new Date().getFullYear().toString()?'<span class="bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">NEW</span>':""}
                 ${t.quality?`<span class="bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/10 uppercase">${t.quality.replace("FHD","HD")}</span>`:""}
                 ${t.current_episode?`<span class="bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/10">EP ${t.current_episode}</span>`:""}
            </div>

            <!-- Number Badge -->
            ${e?`<span class="absolute top-0 right-0 bg-primary text-white text-4xl font-black p-2 leading-none shadow-lg z-20">${r}</span>`:""}
            
            <!-- Hover Content -->
            <div class="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 pointer-events-none">
                
                <!-- Action Buttons -->
                <div class="flex items-center justify-between mb-3 pointer-events-auto">
                    <div class="flex gap-2">
                        <button class="bg-white text-black h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-200 transition-transform hover:scale-110 btn-play" title="Play">
                            <span class="material-symbols-outlined text-[20px] fill-current" style="font-variation-settings: 'FILL' 1;">play_arrow</span>
                        </button>
                        <button class="bg-zinc-800/60 backdrop-blur-md border border-gray-400 text-white h-8 w-8 rounded-full flex items-center justify-center hover:border-white hover:bg-zinc-700 transition-transform hover:scale-110 btn-add-list" data-slug="${n}" title="Add to List">
                            <span class="material-symbols-outlined text-[18px]">add</span>
                        </button>
                    </div>
                    <button class="bg-zinc-800/60 backdrop-blur-md border border-gray-400 text-white h-8 w-8 rounded-full flex items-center justify-center hover:border-white hover:bg-zinc-700 transition-transform hover:scale-110 btn-info" data-slug="${n}" title="More Info">
                        <span class="material-symbols-outlined text-[18px]">info</span>
                    </button>
                </div>

                <!-- Metadata -->
                <div class="space-y-1">
                     <div class="flex items-center gap-2 text-[10px] font-semibold">
                        <span class="text-green-400">${c}% Match</span>
                        <span class="border border-gray-400 px-1 rounded text-gray-200">${u}</span>
                        <span class="text-gray-300">${o}</span>
                    </div>
                    
                    <!-- Ratings & Tags -->
                    <div class="flex items-center gap-3 text-[10px] font-bold">
                        <div class="flex items-center gap-1 text-yellow-500">
                             <span class="bg-[#FA320A] text-white px-1 rounded flex items-center gap-0.5 h-3.5">
                                <span class="material-symbols-outlined text-[10px]">local_pizza</span> ${g}%
                            </span>
                        </div>
                         ${t.genres&&t.genres.length>0?`<span class="text-white/70 font-normal truncate max-w-[100px]">${t.genres[0]}</span>`:""}
                    </div>

                    <h3 class="text-sm font-bold text-white leading-tight line-clamp-2 drop-shadow-md mt-1">
                        ${a}
                    </h3>
                </div>
            </div>
        </div>
    `,s.addEventListener("click",b=>{b.target.closest("button")||w(t)});const h=s.querySelector(".btn-play");h&&h.addEventListener("click",b=>{b.stopPropagation(),w(t)});const f=s.querySelector(".btn-add-list");f&&f.addEventListener("click",b=>{if(b.stopPropagation(),window.historyService){const y=window.historyService.toggleFavorite(t),I=f.querySelector("span");y?(I.textContent="check",T("Added to My List","success")):(I.textContent="add",T("Removed from My List","info"))}});const x=s.querySelector(".btn-info");return x&&x.addEventListener("click",b=>{b.stopPropagation(),U(t)}),s}function pe(t){var m,a;const e=document.createElement("div");e.className="flex-none w-[280px] group/card cursor-pointer snap-start";const r=t.backdrop||t.thumb_url||t.thumbnail||"",i=t.name||t.title||"Untitled",s=((m=t.progress)==null?void 0:m.percentage)||0,d=(a=t.progress)!=null&&a.episode?`S${t.season||1}:E${t.progress.episode}`:"";return e.innerHTML=`
        <div class="relative aspect-video rounded-md overflow-hidden bg-surface-dark card-hover">
            <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('${r}');"></div>
            <div class="absolute inset-0 bg-black/30 group-hover/card:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover/card:opacity-100">
                <span class="material-symbols-outlined text-5xl bg-black/50 rounded-full p-2 border-2 border-white">play_arrow</span>
            </div>
            <div class="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                <div class="h-full bg-primary" style="width: ${s}%;"></div>
            </div>
        </div>
        <div class="mt-2 flex justify-between items-center px-1">
            <span class="text-sm font-semibold text-gray-200">${i}</span>
            ${d?`<span class="text-xs text-gray-400">${d}</span>`:""}
        </div>
    `,e.addEventListener("click",()=>w(t)),e}function D(t,e=!1){if(e||(l.videoGrid.innerHTML="",l.videoGrid.innerHTML="",l.videoGrid.className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-10"),t.length===0&&!e){l.emptyState&&(l.emptyState.style.display="flex");return}l.emptyState&&(l.emptyState.style.display="none"),t.forEach(r=>{const i=ne(r,w);l.videoGrid.appendChild(i)})}let M,v=null,j=0;function ge(){if(!p.hasMore){v&&(v.classList.remove("loading"),v.style.display="none"),M&&M.disconnect();return}M&&M.disconnect(),document.querySelectorAll(".scroll-sentinel").forEach(r=>r.remove()),v=null;const t={root:null,rootMargin:"50px",threshold:0};M=new IntersectionObserver(r=>{r.forEach(i=>{const s=Date.now();s-j<1500||i.isIntersecting&&!p.isLoading&&p.hasMore&&(j=s,v&&v.classList.add("loading"),S(p.currentCategory))})},t),v=document.createElement("div"),v.className="scroll-sentinel",v.id="scrollSentinel";const e=document.getElementById("infinite-scroll-container");e?e.parentNode.insertBefore(v,e.nextSibling):l.videoGrid.appendChild(v),M.observe(v)}function U(t){O(t)}function H(t="history"){if(l.mainHeader&&(l.mainHeader.style.display=""),!window.historyService){console.error("HistoryService not initialized");return}l.videoGrid.innerHTML="",l.emptyState&&(l.emptyState.style.display="none");const e=document.querySelector(".view-tabs");e&&e.remove();const r=document.createElement("div");r.className="view-tabs",r.innerHTML=`
        <button class="view-tab ${t==="history"?"active":""}" data-tab="history">Watch History</button>
        <button class="view-tab ${t==="mylist"?"active":""}" data-tab="mylist">My List</button>
    `,l.videoGrid.before(r),r.querySelectorAll(".view-tab").forEach(a=>{a.addEventListener("click",()=>{r.remove(),H(a.dataset.tab)})});let i=[];if(t==="history"?i=window.historyService.getHistory():i=window.historyService.getFavorites(),i.length===0){if(l.emptyState){l.emptyState.style.display="flex";const a=l.emptyState.querySelector("h2"),o=l.emptyState.querySelector("p");t==="history"?(a&&(a.textContent="No history yet"),o&&(o.textContent="Movies you watch will appear here.")):(a&&(a.textContent="My List is empty"),o&&(o.textContent="Add movies to your list to watch later."))}return}i.sort((a,o)=>{const u=a.timestamp||a.year||0;return(o.timestamp||o.year||0)-u});const s=i.map((a,o)=>({...a,id:a.id||a.slug,orientation:"horizontal"}));l.mainHeader&&(l.mainHeader.style.display="block");const m=A(t==="history"?"Continue Watching":"My List",s,"poster");l.videoGrid.appendChild(m)}function w(t){sessionStorage.setItem("currentVideo",JSON.stringify(t)),sessionStorage.setItem("allVideos",JSON.stringify(p.videos)),O(t)}function O(t){window.location.href=`/watch.html?slug=${t.slug}`}function F(){l.playerModal.classList.remove("active"),Z(),l.playerContainer.innerHTML="",p.currentVideo=null}function C(t){l.loading&&(l.loading.style.display=t?"flex":"none"),l.videoGrid&&(l.videoGrid.style.display=t?"none":"block")}async function L(t){const e=document.querySelector(".view-tabs");e&&e.remove(),l.mainHeader&&(l.mainHeader.style.display=""),C(!0),l.videoGrid.innerHTML="",l.videoGrid.className="space-y-12";const r={home:[{title:"Continue Watching",type:"history",limit:12,cardType:"landscape"},{title:"Cinema Releases",category:"phim-chieu-rap",limit:12,isHeroSource:!0},{title:"Top Rated",category:"phim-le",sort:"rating",limit:12},{title:"Action & Adventure",category:"hanh-dong",limit:12},{title:"Animation",category:"hoat-hinh",limit:12},{title:"Korean Hits",category:"han-quoc",limit:12},{title:"Horror & Thriller",category:"kinh-di",limit:12},{title:"Romance",category:"tinh-cam",limit:12}],series:[{title:"Popular TV Shows",category:"phim-bo",limit:12,isHeroSource:!0},{title:"Korean Dramas",category:"korean",limit:12},{title:"Chinese Dramas",category:"china",limit:12},{title:"Anime Series",category:"hoat-hinh",limit:12},{title:"Documentaries",category:"tai-lieu",limit:12}],movies:[{title:"Blockbuster Movies",category:"phim-le",sort:"year",limit:12,isHeroSource:!0},{title:"Action & Adventure",category:"action",limit:12},{title:"Comedy Films",category:"comedy",limit:12},{title:"Cinema Releases",category:"phim-chieu-rap",limit:12},{title:"Horror Movies",category:"kinh-di",limit:12},{title:"Sci-Fi & Fantasy",category:"vien-tuong",limit:12}],cinema:[{title:"Now Showing",category:"phim-chieu-rap",limit:12,isHeroSource:!0},{title:"New Releases",category:"phim-le",sort:"year",limit:12},{title:"Top Rated",category:"phim-le",sort:"rating",limit:12},{title:"Action Blockbusters",category:"action",limit:12},{title:"Animated Features",category:"hoat-hinh",limit:12}]},i=r[t]||r.home;if(t==="home"||t==="cinema"){const d=sessionStorage.getItem(`view_cache_${t}`);if(d&&(l.videoGrid.innerHTML=d,C(!1),l.heroContainer&&(l.heroContainer.style.display=""),l.videoGrid.children.length>0))return}const s=3;try{let d=null;for(let a=0;a<Math.min(s,i.length);a++){const o=i[a],u=await P(o);if(u&&u.length>0){d||(d=u),o.isHeroSource&&(!p.heroMovies||p.heroMovies.length===0)&&u.length>0&&(p.heroMovies=u.slice(0,10),p.featuredVideo=u[0],p.videos=u,p.currentHeroIndex=0,E(p.heroMovies[0]),ue());const n=A(o.title,u,o.cardType||"poster");l.videoGrid.appendChild(n)}}(t==="home"||t==="cinema")&&sessionStorage.setItem(`view_cache_${t}`,l.videoGrid.innerHTML);const m=new IntersectionObserver(async(a,o)=>{for(const u of a)if(u.isIntersecting){const n=u.target,c=parseInt(n.dataset.configIndex),g=i[c];o.unobserve(n),n.innerHTML='<div class="flex justify-center py-8"><div class="loading-spinner"></div></div>';const h=await P(g);if(h&&h.length>0){const f=A(g.title,h,g.cardType||"poster");n.replaceWith(f),(t==="home"||t==="cinema")&&sessionStorage.setItem(`view_cache_${t}`,l.videoGrid.innerHTML)}else n.remove()}},{rootMargin:"800px"});for(let a=s;a<i.length;a++){const o=document.createElement("div");o.className="lazy-section-placeholder h-32 mb-12",o.dataset.configIndex=a,o.innerHTML=`<h2 class="text-xl md:text-2xl font-bold text-white/30 px-4 md:px-12">${i[a].title}</h2>`,l.videoGrid.appendChild(o),m.observe(o)}if(!p.featuredVideo)if(d&&d.length>0)p.featuredVideo=d[0],p.videos=d,E();else try{const a=K();a&&a.length>0&&(p.featuredVideo=a[0],p.videos=a,E())}catch(a){console.warn("Demo content fallback failed",a)}l.videoGrid.children.length===0&&(l.videoGrid.innerHTML=`
                <div class="flex flex-col items-center justify-center py-20 text-gray-400">
                    <span class="material-symbols-outlined text-6xl mb-4 opacity-30">movie</span>
                    <p>No content available for this category</p>
                </div>
            `)}catch(d){console.error("Error rendering category view:",d),l.videoGrid.innerHTML=`
            <div class="flex flex-col items-center justify-center py-20 text-gray-400">
                <span class="material-symbols-outlined text-6xl mb-4 opacity-30">error</span>
                <p>Failed to load content. Please try again.</p>
            </div>
        `}C(!1)}async function P(t){try{if(t.type==="history")return window.historyService?window.historyService.getHistory().slice(0,t.limit).map(o=>({id:o.slug||o.id,title:o.title,thumbnail:o.thumbnail||o.poster_url,slug:o.slug,year:o.year,quality:o.quality||"HD",view_progress:o.view_progress||0})):[];const e={category:t.category||null,limit:t.limit||40,sort:t.sort||"year"};t.country&&(e.country=t.country),t.genre&&(e.genre=t.genre);const r=async a=>{const o=[1,2,3,4,5,6,7,8].map(n=>k.getRophimCatalog({...a,page:n}).catch(c=>({movies:[]})));return(await Promise.all(o)).flatMap(n=>n.movies||[])};let i=await r(e);if(i.length<20&&t.sort&&t.sort!=="modified"){const a=await r({...e,sort:"modified"});i=[...i,...a]}const s=[],d=new Set;for(const a of i){if(!a)continue;const o=a.slug||a.id;d.has(o)||(d.add(o),s.push({id:a.id||a.slug,title:a.title,thumbnail:a.thumbnail,poster_url:a.poster_url||a.thumbnail,backdrop:a.backdrop||a.poster_url||a.thumbnail,slug:a.slug,year:a.year,quality:a.quality||"HD",rating:a.rating,category:a.category}))}const m=Math.max(t.limit||40,48);return s.slice(0,m)}catch(e){return console.error(`Error fetching section "${t.title}":`,e),[]}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",q):q();function K(){const t="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",e={VENOM:"https://image.tmdb.org/t/p/w500/aosm8NMQ3UyoBVpSxyimorCQykC.jpg",SQUID:"https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop",ARCANE:"https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop",PENGUIN:"https://images.unsplash.com/photo-1478720568477-152d9b164e63?w=800&auto=format&fit=crop",GLADIATOR:"https://images.unsplash.com/photo-1565060416-522204c35613?w=800&auto=format&fit=crop",MOANA:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop",WICKED:"https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop",DBZ:"https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop"};return[{id:"d1",title:"Venom: The Last Dance",thumbnail:e.VENOM,backdrop:"https://image.tmdb.org/t/p/original/3V4kLQg0kSqPLctI5ziYWabAZYF.jpg",preview_url:t,duration:7200,resolution:"4K",category:"action",year:2024,matchScore:98,director:"Kelly Marcel",country:"USA",cast:["Tom Hardy","Chiwetel Ejiofor","Juno Temple"],description:"Eddie and Venom are on the run. Hunted by both of their worlds and with the net closing in, the duo are forced into a devastating decision.",episodes:[]},{id:"d2",title:"Squid Game Season 2",thumbnail:e.SQUID,backdrop:e.SQUID,preview_url:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",duration:3600,resolution:"HD",category:"series",year:2024,matchScore:99,director:"Hwang Dong-hyuk",country:"Korea",cast:["Lee Jung-jae","Lee Byung-hun","Wi Ha-jun"],description:"Gi-hun returns to the death games after three years with a new resolution: to find the people behind and to put an end to the sport.",episodes:[{number:1,title:"Red Light, Green Light",url:t},{number:2,title:"The Man with the Umbrella",url:t},{number:3,title:"Stick to the Team",url:t}]},{id:"d3",title:"Arcane Season 2",thumbnail:e.ARCANE,backdrop:e.ARCANE,preview_url:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",duration:2400,resolution:"4K",category:"anime",year:2024,matchScore:97,director:"Christian Linke",country:"USA, France",cast:["Hailee Steinfeld","Ella Purnell","Katie Leung"],description:"As conflict between Piltover and Zaun reaches a boiling point, Jinx and Vi must decide what kind of future they are fighting for.",episodes:[{number:1,title:"Heavy Is the Crown",url:t},{number:2,title:"Watch It All Burn",url:t},{number:3,title:"Finally Got It Right",url:t}]},{id:"d4",title:"The Penguin",thumbnail:e.PENGUIN,backdrop:e.PENGUIN,preview_url:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",duration:3600,resolution:"HD",category:"series",year:2024,matchScore:95,director:"Craig Zobel",country:"USA",cast:["Colin Farrell","Cristin Milioti","Rhenzy Feliz"],description:"Following the events of The Batman, Oz Cobb makes a play for power in the underworld of Gotham City.",episodes:[]},{id:"d5",title:"Gladiator II",thumbnail:e.GLADIATOR,backdrop:e.GLADIATOR,preview_url:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",duration:8400,resolution:"4K",category:"action",year:2024,matchScore:96,director:"Ridley Scott",country:"USA, UK",cast:["Paul Mescal","Pedro Pascal","Denzel Washington"],description:"Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius is forced to enter the Colosseum.",episodes:[]},{id:"d6",title:"Moana 2",thumbnail:e.MOANA,backdrop:e.MOANA,preview_url:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",duration:6e3,resolution:"HD",category:"theater",year:2024,matchScore:94,director:"David G. Derrick Jr.",country:"USA",cast:["Auliʻi Cravalho","Dwayne Johnson","Alan Tudyk"],description:"After receiving an unexpected call from her wayfinding ancestors, Moana must journey to the far seas of Oceania.",episodes:[]},{id:"d7",title:"Wicked",thumbnail:e.WICKED,backdrop:e.WICKED,preview_url:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",duration:9e3,resolution:"4K",category:"theater",year:2024,matchScore:93,director:"Jon M. Chu",country:"USA",cast:["Cynthia Erivo","Ariana Grande","Jeff Goldblum"],description:"Elphaba, a misunderstood young woman with green skin, and Glinda, a popular blonde, forge an unlikely friendship.",episodes:[]},{id:"d8",title:"Dragon Ball Daima",thumbnail:e.DBZ,backdrop:e.DBZ,preview_url:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",duration:1440,resolution:"HD",category:"anime",year:2024,matchScore:98,director:"Yoshitaka Yashima",country:"Japan",cast:["Masako Nozawa","Ryō Horikawa"],description:"Goku and his friends are turned small due to a conspiracy. To fix things, they head off to a new world.",episodes:[{number:1,title:"Conspiracy",url:t}]}]}function fe(){l.mainHeader&&(l.mainHeader.style.display="");const t=document.getElementById("heroContainer");t&&(t.style.display="",E()),_("profile"),l.videoGrid.innerHTML="",l.videoGrid.className="profile-view pb-24 bg-background-light dark:bg-background-dark min-h-screen";const e=`
        <!-- Sticky Top Bar (at offset) -->
        <div class="sticky top-[60px] md:top-[80px] z-40 flex items-center bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 py-3 justify-between border-b border-gray-200 dark:border-white/10">
            <button class="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors" onclick="renderHome()">
                <span class="material-symbols-outlined text-slate-900 dark:text-white" style="font-size: 24px;">arrow_back</span>
            </button>
            <h2 class="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center">Profile</h2>
            <button class="flex w-12 items-center justify-center rounded text-sm font-semibold text-primary hover:text-red-500 transition-colors">Edit</button>
        </div>

        <div class="flex-1 overflow-y-auto no-scrollbar">
            <!-- Profile Header -->
            <div class="flex flex-col items-center pt-6 pb-6 px-4">
                <div class="relative group cursor-pointer">
                    <div class="bg-center bg-no-repeat bg-cover rounded-lg w-28 h-28 shadow-lg ring-2 ring-transparent group-hover:ring-primary transition-all duration-300" 
                         style='background-image: url("https://wallpapers.com/images/hd/netflix-profile-pictures-1000-x-1000-qo9h82134t9nv0j0.jpg");'>
                    </div>
                    <div class="absolute -bottom-2 -right-2 bg-surface-dark p-1.5 rounded-full border border-gray-700 shadow-md">
                        <span class="material-symbols-outlined text-white text-xs block">edit</span>
                    </div>
                </div>
                <h3 class="mt-4 text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Isabella Hall</h3>
                <button class="mt-2 text-sm font-medium text-secondary-text hover:text-white transition-colors flex items-center gap-1">
                    Manage Profiles <span class="material-symbols-outlined text-sm">chevron_right</span>
                </button>
            </div>

            <!-- Profile Stats -->
            <div class="grid grid-cols-3 gap-3 px-4 mb-8">
                <div class="flex flex-col gap-1 rounded-lg bg-white dark:bg-[#1E1E1E] p-3 items-center text-center shadow-sm border border-gray-100 dark:border-white/5">
                    <p class="text-primary text-xl font-bold leading-tight">42</p>
                    <p class="text-slate-500 dark:text-[#B3B3B3] text-[11px] font-medium uppercase tracking-wider">Movies</p>
                </div>
                <div class="flex flex-col gap-1 rounded-lg bg-white dark:bg-[#1E1E1E] p-3 items-center text-center shadow-sm border border-gray-100 dark:border-white/5">
                    <p class="text-primary text-xl font-bold leading-tight">128h</p>
                    <p class="text-slate-500 dark:text-[#B3B3B3] text-[11px] font-medium uppercase tracking-wider">Streamed</p>
                </div>
                <div class="flex flex-col gap-1 rounded-lg bg-white dark:bg-[#1E1E1E] p-3 items-center text-center shadow-sm border border-gray-100 dark:border-white/5">
                    <p class="text-primary text-xl font-bold leading-tight">15</p>
                    <p class="text-slate-500 dark:text-[#B3B3B3] text-[11px] font-medium uppercase tracking-wider">Reviews</p>
                </div>
            </div>

            <!-- Continue Watching Container -->
            <div id="profileHistoryContainer" class="mb-8"></div>

            <!-- Menu List -->
            <div class="flex flex-col px-4 gap-2 mb-8">
                <a class="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-[#1E1E1E] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group border border-gray-100 dark:border-white/5 cursor-pointer" onclick="renderHistoryView('mylist'); return false;">
                    <div class="flex items-center gap-4">
                        <div class="p-2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white group-hover:text-primary transition-colors">
                            <span class="material-symbols-outlined">checklist</span>
                        </div>
                        <span class="text-base font-medium text-slate-900 dark:text-white">My List</span>
                    </div>
                    <span class="material-symbols-outlined text-secondary-text text-xl">chevron_right</span>
                </a>
                <a class="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-[#1E1E1E] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group border border-gray-100 dark:border-white/5 cursor-pointer">
                    <div class="flex items-center gap-4">
                        <div class="p-2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white group-hover:text-primary transition-colors">
                            <span class="material-symbols-outlined">settings</span>
                        </div>
                        <span class="text-base font-medium text-slate-900 dark:text-white">App Settings</span>
                    </div>
                    <span class="material-symbols-outlined text-secondary-text text-xl">chevron_right</span>
                </a>
                <a class="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-[#1E1E1E] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group border border-gray-100 dark:border-white/5 cursor-pointer">
                    <div class="flex items-center gap-4">
                        <div class="p-2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white group-hover:text-primary transition-colors">
                            <span class="material-symbols-outlined">person</span>
                        </div>
                        <span class="text-base font-medium text-slate-900 dark:text-white">Account</span>
                    </div>
                    <span class="material-symbols-outlined text-secondary-text text-xl">chevron_right</span>
                </a>
                <a class="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-[#1E1E1E] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group border border-gray-100 dark:border-white/5 cursor-pointer">
                    <div class="flex items-center gap-4">
                        <div class="p-2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white group-hover:text-primary transition-colors">
                            <span class="material-symbols-outlined">help</span>
                        </div>
                        <span class="text-base font-medium text-slate-900 dark:text-white">Help</span>
                    </div>
                    <span class="material-symbols-outlined text-secondary-text text-xl">chevron_right</span>
                </a>
            </div>

            <!-- Footer Actions -->
            <div class="px-4 pb-8 flex flex-col items-center gap-4">
                <button class="w-full py-3.5 px-4 rounded-lg bg-white dark:bg-transparent border border-gray-200 dark:border-gray-700 text-slate-900 dark:text-white font-semibold text-base hover:bg-gray-50 dark:hover:bg-white/5 hover:border-gray-300 dark:hover:border-gray-500 transition-all">
                    Sign Out
                </button>
                <p class="text-xs text-secondary-text">Version 4.12.0</p>
            </div>
        </div>
    `;if(l.videoGrid.innerHTML=e,window.historyService){const r=window.historyService.getHistory().slice(0,10);if(r.length>0){const i=document.getElementById("profileHistoryContainer"),s=A("Continue Watching",r,"landscape");i.appendChild(s)}}}async function ye(){l.mainHeader&&(l.mainHeader.style.display="");const t=document.getElementById("heroContainer");if(t&&(t.style.display=""),_("home"),window.innerWidth<768){document.querySelectorAll("footer").forEach(r=>r.style.display="none");const e=document.getElementById("searchModal");e&&e.classList.remove("active")}else document.querySelectorAll("footer").forEach(e=>e.style.display="");await L("home")}async function R(){l.mainHeader&&(l.mainHeader.style.display="");const t=document.getElementById("heroContainer");t&&(t.style.display="",E()),document.querySelectorAll("footer").forEach(o=>o.style.display="none");const e=document.getElementById("searchModal");e&&e.classList.remove("active"),_("search"),l.videoGrid.innerHTML="",l.videoGrid.className="mobile-search-view bg-background-light dark:bg-background-dark";const r=`
        <!-- Search Header (Sticky below main header) -->
        <div class="shrink-0 bg-background-dark/80 backdrop-blur-md pt-4 z-50 px-4 py-2 sticky top-[60px] md:top-[80px] w-full border-b border-white/5">
            <div class="flex items-center gap-3">
                <div class="relative flex-1">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-[#cc8f92]">
                        <span class="material-symbols-outlined text-[20px]">search</span>
                    </div>
                    <input autofocus class="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg text-sm bg-gray-100 dark:bg-[#361618] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#cc8f92]/70 focus:ring-2 focus:ring-primary focus:outline-none transition-shadow" placeholder="Search for shows, movies, genres..." type="text" id="mobileSearchInput">
                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 dark:text-[#cc8f92]">
                        <span class="material-symbols-outlined text-[20px]">mic</span>
                    </div>
            </div>
                <button class="text-sm font-medium text-slate-500 dark:text-white/80 active:text-white" id="mobileSearchCancel">Cancel</button>
            </div>
            <!-- Filter Chips -->
            <div id="searchFilterChips" class="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                <button class="search-chip active flex h-8 shrink-0 items-center justify-center rounded-full bg-white text-black px-4" data-genre="trending">
                    <p class="text-xs font-bold leading-normal">Top Searches</p>
                </button>
                <button class="search-chip flex h-8 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-surface-dark border border-transparent dark:border-white/10 px-4" data-genre="hanh-dong">
                    <p class="text-slate-700 dark:text-gray-300 text-xs font-medium leading-normal">Action</p>
                </button>
                <button class="search-chip flex h-8 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-surface-dark border border-transparent dark:border-white/10 px-4" data-genre="hoat-hinh">
                    <p class="text-slate-700 dark:text-gray-300 text-xs font-medium leading-normal">Anime</p>
                </button>
                <button class="search-chip flex h-8 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-surface-dark border border-transparent dark:border-white/10 px-4" data-genre="vien-tuong">
                    <p class="text-slate-700 dark:text-gray-300 text-xs font-medium leading-normal">Sci-Fi</p>
                </button>
                <button class="search-chip flex h-8 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-surface-dark border border-transparent dark:border-white/10 px-4" data-genre="hai-huoc">
                    <p class="text-slate-700 dark:text-gray-300 text-xs font-medium leading-normal">Comedy</p>
                </button>
            </div>
        </div>
        
        <!-- Results/Content Area with bottom padding for nav bar -->
        <div id="mobileSearchResults" class="flex-1 overflow-y-auto no-scrollbar pt-4 pb-24">
             <div class="mb-3">
                <h2 class="text-slate-900 dark:text-white text-lg font-bold px-4">Top Searches</h2>
             </div>
             <div id="topSearchesList" class="flex flex-col gap-1"></div>
             
             <div class="pt-8 px-4">
                <h2 class="text-slate-900 dark:text-white text-lg font-bold mb-4">Recommended for You</h2>
                <div id="recommendedGrid" class="grid grid-cols-3 gap-3"></div>
             </div>
        </div>
    `;l.videoGrid.innerHTML=r;const i=document.getElementById("mobileSearchInput"),s=document.getElementById("mobileSearchResults");let d=null;i&&s&&(i.addEventListener("input",o=>{clearTimeout(d);const u=o.target.value.trim();d=setTimeout(async()=>{if(!(u.length<2)){s.innerHTML='<div class="flex justify-center py-12"><div class="loading-spinner"></div></div>';try{const n=await k.searchRophim(u);if(n&&n.movies&&n.movies.length>0){s.innerHTML=`
                            <h2 class="text-white text-sm font-bold px-4 mb-3">Results for "${u}"</h2>
                            <div class="grid grid-cols-3 gap-3 px-4"></div>
                        `;const c=s.querySelector(".grid");n.movies.forEach(g=>{const h=document.createElement("div");h.className="relative group aspect-[2/3] overflow-hidden rounded-lg cursor-pointer",h.innerHTML=`
                                <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style='background-image: url("${g.thumbnail}");'></div>
                                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div class="absolute bottom-0 left-0 right-0 p-2">
                                        <p class="text-white text-[10px] font-bold line-clamp-1">${g.title}</p>
                                    </div>
                                </div>
                            `,h.addEventListener("click",()=>w(g)),c.appendChild(h)})}else s.innerHTML=`
                            <div class="text-center py-12">
                                <span class="material-symbols-outlined text-4xl text-white/30 mb-2">search_off</span>
                                <p class="text-white/50">No results for "${u}"</p>
                            </div>
                        `}catch(n){console.error("Mobile search failed:",n),s.innerHTML='<div class="text-center py-12 text-white/50">Search failed. Try again.</div>'}}},300)}),i.focus());const m=document.getElementById("mobileSearchCancel");m&&m.addEventListener("click",()=>{const o=document.getElementById("mobileSearchInput");o&&(o.value="",o.focus()),R()});try{const o=await k.getRophimCatalog({category:"trending",limit:5});if(o&&o.movies){const n=document.getElementById("topSearchesList");o.movies.forEach(c=>{const g=document.createElement("div");g.className="group flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-colors",g.innerHTML=`
                    <div class="shrink-0 relative">
                        <div class="bg-center bg-cover rounded-lg h-16 w-28 shadow-sm" style='background-image: url("${c.thumbnail}");'></div>
                    </div>
                    <div class="flex flex-col justify-center flex-1 min-w-0">
                        <p class="text-slate-900 dark:text-white text-sm font-semibold leading-normal truncate group-hover:text-primary transition-colors">${c.title}</p>
                        <p class="text-slate-500 dark:text-[#cc8f92] text-xs font-normal leading-normal truncate">${c.year||"2024"}</p>
                    </div>
                    <div class="shrink-0">
                        <span class="material-symbols-outlined text-slate-400 dark:text-white text-[28px] group-hover:text-primary">play_circle</span>
                    </div>
                `,g.addEventListener("click",()=>w(c)),n.appendChild(g)})}const u=await k.getRophimCatalog({category:"phim-le",limit:9});if(u&&u.movies){const n=document.getElementById("recommendedGrid");u.movies.forEach(c=>{const g=document.createElement("div");g.className="relative group aspect-[2/3] overflow-hidden rounded-lg cursor-pointer",g.innerHTML=`
                    <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style='background-image: url("${c.thumbnail}");'></div>
                 `,g.addEventListener("click",()=>w(c)),n.appendChild(g)})}}catch(o){console.error("Failed to load mobile search content",o)}const a=document.querySelectorAll(".search-chip");a.forEach(o=>{o.addEventListener("click",async()=>{var g;const u=o.dataset.genre;if(!u)return;a.forEach(h=>{h.classList.remove("active","bg-white","text-black"),h.classList.add("bg-gray-200","dark:bg-surface-dark");const f=h.querySelector("p");f&&(f.classList.remove("font-bold"),f.classList.add("font-medium","text-slate-700","dark:text-gray-300"))}),o.classList.add("active","bg-white","text-black"),o.classList.remove("bg-gray-200","dark:bg-surface-dark");const n=o.querySelector("p");n&&(n.classList.add("font-bold"),n.classList.remove("font-medium","text-slate-700","dark:text-gray-300"));const c=document.getElementById("mobileSearchResults");if(c){c.innerHTML='<div class="flex justify-center py-12"><div class="loading-spinner"></div></div>';try{const h=await k.getRophimCatalog({category:u,limit:12});if(h&&h.movies&&h.movies.length>0){const f=((g=o.querySelector("p"))==null?void 0:g.textContent)||u;c.innerHTML=`
                            <h2 class="text-white text-lg font-bold px-4 mb-4">${f}</h2>
                            <div class="grid grid-cols-3 gap-3 px-4"></div>
                        `;const x=c.querySelector(".grid");h.movies.forEach(b=>{const y=document.createElement("div");y.className="relative group aspect-[2/3] overflow-hidden rounded-lg cursor-pointer",y.innerHTML=`
                                <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style='background-image: url("${b.thumbnail}");'></div>
                            `,y.addEventListener("click",()=>w(b)),x.appendChild(y)})}else c.innerHTML='<p class="text-center text-gray-400 py-12">No results found</p>'}catch(h){console.error("Genre filter error:",h),c.innerHTML='<p class="text-center text-gray-400 py-12">Failed to load content</p>'}}})})}async function z(){l.mainHeader&&(l.mainHeader.style.display="");const t=document.getElementById("heroContainer");t&&(t.style.display="",E()),document.querySelectorAll("footer").forEach(m=>m.style.display="none");const e=document.getElementById("searchModal");e&&e.classList.remove("active"),_("mylist");const r=window.historyService?window.historyService.getFavorites():[];l.videoGrid.innerHTML="",l.videoGrid.className="mobile-mylist-view min-h-screen bg-background-dark pb-24";const i=`
        <!-- Sticky Header (Using sticky at an offset to allow scrolling past hero and main header) -->
        <header class="sticky top-[60px] md:top-[80px] left-0 right-0 z-[100] flex flex-col bg-background-dark/90 backdrop-blur-md pt-4 border-b border-white/5">
            <div class="flex items-center justify-between px-4 pb-2">
                <h1 class="text-2xl font-bold tracking-tight text-white">My List</h1>
                <button class="flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors">
                    <span class="material-symbols-outlined text-[24px]">edit</span>
                </button>
            </div>
            <!-- Filter Chips -->
            <div id="mylistFilterChips" class="flex w-full gap-3 overflow-x-auto px-4 pb-4 pt-2 no-scrollbar">
                <button class="mylist-chip active flex h-8 shrink-0 items-center justify-center rounded-full bg-white px-4 shadow-lg shadow-white/10" data-filter="all" data-category="trending">
                    <p class="text-xs font-bold text-black">All</p>
                </button>
                <button class="mylist-chip flex h-8 shrink-0 items-center justify-center rounded-full bg-surface-dark border border-white/20 px-4 hover:bg-white/10" data-filter="movies" data-category="phim-le">
                    <p class="text-xs font-medium text-gray-200">Movies</p>
                </button>
                <button class="mylist-chip flex h-8 shrink-0 items-center justify-center rounded-full bg-surface-dark border border-white/20 px-4 hover:bg-white/10" data-filter="tvshows" data-category="phim-bo">
                    <p class="text-xs font-medium text-gray-200">TV Shows</p>
                </button>
                <button class="mylist-chip flex h-8 shrink-0 items-center justify-center rounded-full bg-surface-dark border border-white/20 px-4 hover:bg-white/10" data-filter="anime" data-category="hoat-hinh">
                    <p class="text-xs font-medium text-gray-200">Anime</p>
                </button>
            </div>
        </header>

        <!-- Grid Container -->
        <main class="px-4 pt-4 pb-24">
            <div id="mylistGrid" class="grid grid-cols-3 gap-3"></div>
        </main>
    `;l.videoGrid.innerHTML=i;const s=document.getElementById("mylistGrid");if(r.length>0)r.forEach(m=>{const a=document.createElement("div");a.className="group relative flex flex-col gap-2 cursor-pointer",a.innerHTML=`
                <div class="relative w-full overflow-hidden rounded-md bg-surface-dark shadow-md aspect-[2/3]">
                    <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                         style='background-image: url("${m.thumbnail||m.poster_url}");'></div>
                    <div class="absolute inset-0 bg-black/0 transition-colors group-active:bg-black/20"></div>
                </div>
            `,a.addEventListener("click",()=>w(m)),s.appendChild(a)});else try{const m=await k.getRophimCatalog({category:"trending",limit:12});m&&m.movies&&m.movies.forEach((a,o)=>{const u=document.createElement("div");u.className="group relative flex flex-col gap-2 cursor-pointer",u.innerHTML=`
                        <div class="relative w-full overflow-hidden rounded-md bg-surface-dark shadow-md aspect-[2/3]">
                            <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                                 style='background-image: url("${a.thumbnail}");'></div>
                            ${o===0?'<div class="absolute top-0 right-0 rounded-bl-md bg-primary px-1.5 py-0.5"><span class="text-[10px] font-bold uppercase text-white tracking-wider">New</span></div>':""}
                            <div class="absolute inset-0 bg-black/0 transition-colors group-active:bg-black/20"></div>
                        </div>
                    `,u.addEventListener("click",()=>w(a)),s.appendChild(u)})}catch(m){console.error("Failed to load my list content",m)}const d=document.querySelectorAll(".mylist-chip");d.forEach(m=>{m.addEventListener("click",async()=>{const a=m.dataset.filter,o=m.dataset.category;if(!a||!o)return;d.forEach(c=>{c.classList.remove("active","bg-white"),c.classList.add("bg-surface-dark");const g=c.querySelector("p");g&&(g.classList.remove("font-bold","text-black"),g.classList.add("font-medium","text-gray-200"))}),m.classList.add("active","bg-white"),m.classList.remove("bg-surface-dark");const u=m.querySelector("p");u&&(u.classList.add("font-bold","text-black"),u.classList.remove("font-medium","text-gray-200"));const n=document.getElementById("mylistGrid");if(n){n.innerHTML='<div class="col-span-3 flex justify-center py-12"><div class="loading-spinner"></div></div>';try{const c=await k.getRophimCatalog({category:o,limit:12});n.innerHTML="",c&&c.movies&&c.movies.length>0?c.movies.forEach((g,h)=>{const f=document.createElement("div");f.className="group relative flex flex-col gap-2 cursor-pointer",f.innerHTML=`
                                <div class="relative w-full overflow-hidden rounded-md bg-surface-dark shadow-md aspect-[2/3]">
                                    <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                                         style='background-image: url("${g.thumbnail}");'></div>
                                    ${h===0?'<div class="absolute top-0 right-0 rounded-bl-md bg-primary px-1.5 py-0.5"><span class="text-[10px] font-bold uppercase text-white tracking-wider">New</span></div>':""}
                                    <div class="absolute inset-0 bg-black/0 transition-colors group-active:bg-black/20"></div>
                                </div>
                            `,f.addEventListener("click",()=>w(g)),n.appendChild(f)}):n.innerHTML='<p class="col-span-3 text-center text-gray-400 py-12">No content found</p>'}catch(c){console.error("Filter error:",c),n.innerHTML='<p class="col-span-3 text-center text-gray-400 py-12">Failed to load content</p>'}}})})}
