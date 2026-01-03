import{a as k,h as j,s as $,K as ie,S as z,b as se,c as oe,d as ne}from"./keyboard-nav-CjQOo0Sk.js";async function le(){try{console.log("📂 Loading themed categories...");const t=await(await fetch("/api/rophim/categories/all")).json();return t&&t.categories?(console.log(`✓ Loaded ${Object.keys(t.categories).length} category sections`),t.categories):null}catch(e){return console.error("Error loading categories:",e),null}}function J(e){const t=document.createElement("div");return t.className="video-card__ranking",e<=3&&t.classList.add(`video-card__ranking--${e}`),t.textContent=`#${e}`,t}function Q(e){if(!e)return null;const t=document.createElement("div");t.className="video-card__badge";const s=e.toUpperCase();return s.includes("HOT")?t.classList.add("video-card__badge--hot"):s.includes("NEW")?t.classList.add("video-card__badge--new"):s.includes("CINEMA")?t.classList.add("video-card__badge--cinema"):s.includes("FULL")&&t.classList.add("video-card__badge--full"),t.textContent=s,t}function ce(e,t){if(!e)return e;const s=e.querySelector(".video-card__container");if(!s)return e;if(t.badge){const r=Q(t.badge);r&&s.appendChild(r)}if(t.ranking){const r=J(t.ranking);s.appendChild(r)}return e}typeof window<"u"&&(window.categorySystem={loadCategories:le,createRankingBadge:J,createQualityBadge:Q,enhanceVideoCardWithBadges:ce});const R="kvstream-images-v1",de=500;class me{constructor(){this.memoryCache=new Map,this.cacheEnabled="caches"in window,this.pendingRequests=new Map}async getCachedImage(t){if(!t||!this.cacheEnabled)return t;if(this.memoryCache.has(t))return this.memoryCache.get(t);if(this.pendingRequests.has(t))return this.pendingRequests.get(t);const s=this._fetchAndCache(t);this.pendingRequests.set(t,s);try{return await s}finally{this.pendingRequests.delete(t)}}async _fetchAndCache(t){try{const s=await caches.open(R),r=await s.match(t);if(r){const d=await r.blob(),m=URL.createObjectURL(d);return this.memoryCache.set(t,m),m}const i=await fetch(t,{mode:"cors",credentials:"omit"});if(i.ok){const d=i.clone();s.put(t,d);const m=await i.blob(),a=URL.createObjectURL(m);return this.memoryCache.set(t,a),this._cleanupCache(s),a}}catch{console.warn("Image cache failed:",t)}return t}async preloadImages(t){if(!t||t.length===0)return;const s=6;for(let r=0;r<t.length;r+=s){const i=t.slice(r,r+s);await Promise.allSettled(i.map(d=>this.getCachedImage(d)))}}createCachedImage(t,s="",r=""){const i=document.createElement("img");return i.alt=s,i.className=r,i.loading="lazy",i.decoding="async",i.src='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450"%3E%3Crect fill="%23222"%3E%3C/rect%3E%3C/svg%3E',t&&this.getCachedImage(t).then(d=>{i.src=d}),i}async _cleanupCache(t){try{const s=await t.keys();if(s.length>de){const r=Math.floor(s.length*.2);for(let i=0;i<r;i++)await t.delete(s[i])}}catch{}}async clearCache(){this.memoryCache.clear(),this.cacheEnabled&&await caches.delete(R)}async getCacheStats(){const t={memoryItems:this.memoryCache.size,cacheItems:0,cacheSize:0};if(this.cacheEnabled)try{const r=await(await caches.open(R)).keys();t.cacheItems=r.length}catch{}return t}}const ue=new me;function pe(e){var r;const t=new Date().getFullYear();if(e.year===t)return!0;const s=(e.quality||"").toLowerCase();if(s.includes("mới")||s.includes("new"))return!0;if((r=e.modified)!=null&&r.time){const i=new Date(e.modified.time),d=new Date(Date.now()-7*24*60*60*1e3);if(i>d)return!0}return!1}function he(e){var i;const t=(e.quality||"").toLowerCase(),s=((i=e.episodes)==null?void 0:i.length)||0,r=(e.category||e.type||"").toLowerCase();return t.includes("trailer")||r.includes("trailer")?"trailer":s>1||r.includes("series")||r.includes("phim-bo")||t.includes("tập")||t.includes("ep")?"series":r.includes("hoathinh")||r.includes("animation")||r.includes("anime")?"animation":"movie"}function ge(e){var i;const t=e.quality||"";if(t.match(/(?:tập\s*)?(\d+)(?:\s*\/\s*(\d+))?/i))return t;const r=((i=e.episodes)==null?void 0:i.length)||0;return r>1?`${r} Tập`:null}function fe(e,t,s){var T;const r=document.createElement("div");r.className="video-card",r.dataset.videoId=e.id,r.setAttribute("tabindex","0");const d=window.innerWidth<768?180:200,m=e.thumbnail||"",a=k.getProxyUrl(m,d),o=e.year||new Date().getFullYear(),u=pe(e),l=he(e),h=ge(e);let c=e.quality||"HD";c=c.replace(/(?:tập\s*)?\d+(?:\s*\/\s*\d+)?/gi,"").trim()||"HD",c.length>6&&(c="HD");const f=parseFloat(e.rating||0),g=f>=7,y=Math.round(f*10);let v="";f>0&&(v=`
            <div class="numeric-rating">
                <span class="numeric-rating__score">${f.toFixed(1)}</span>
            </div>
        `);let E="";f>0&&(E=`
            <div class="tomato-badge ${g?"tomato-badge--fresh":"tomato-badge--rotten"}">
                <span class="tomato-badge__icon">${g?"🍅":"🥀"}</span>
                <span class="tomato-badge__score">${y}%</span>
            </div>
        `);const G='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450"%3E%3Crect width="300" height="450" fill="%2314141c"/%3E%3C/svg%3E';let x="";u&&(x+='<span class="video-tag video-tag--new">MỚI</span>'),l==="trailer"?x+='<span class="video-tag video-tag--trailer">TRAILER</span>':l==="series"?x+='<span class="video-tag video-tag--series">PHIM BỘ</span>':l==="animation"&&(x+='<span class="video-tag video-tag--animation">HOẠT HÌNH</span>'),r.innerHTML=`
        <div class="video-card__container">
            <div class="video-card__poster">
                <img src="${G}" data-src="${a}" alt="${U(e.title)}" loading="lazy" referrerpolicy="no-referrer" class="video-card__img" onerror="this.onerror=null;this.src='https://placehold.co/400x600/14141c/e5c07b?text=Movie'">
                
                <!-- Top Left Tags -->
                <div class="video-tags">
                    ${x}
                </div>
                
                <!-- Bottom Right Info (Ratings & Quality) -->
                <div class="card-meta-bottom-right">
                    ${E}
                    ${v}
                    <span class="poster-badge">${c}</span>
                </div>
                
                <!-- Bottom Left Info (Year & Episodes) -->
                <div class="card-meta-bottom-left">
                    <span class="year-badge">${o}</span>
                    ${h?`<span class="episode-badge">${h}</span>`:""}
                </div>
                
                <!-- Watch Progress Bar -->
                ${e.progress&&e.progress.percentage>0?`
                <div class="video-card__progress">
                    <div class="video-card__progress-fill" style="width: ${e.progress.percentage}%"></div>
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
            <span class="video-card__name">${U(e.title)}</span>
        </div>
    `;const w=r.querySelector(".video-card__img");if(w&&a){const _=new IntersectionObserver(te=>{te.forEach(ae=>{ae.isIntersecting&&(ue.getCachedImage(a).then(re=>{w.src=re,w.classList.add("loaded")}).catch(()=>{w.src=a,w.onload=()=>w.classList.add("loaded"),w.onerror=()=>w.classList.add("loaded")}),_.unobserve(w))})},{rootMargin:"800px",threshold:0});_.observe(w)}return(T=r.querySelector('[data-action="play"]'))==null||T.addEventListener("click",_=>{_.stopPropagation(),t==null||t(e)}),r.addEventListener("click",()=>{t==null||t(e)}),r}function U(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}function ye(e,t){let s;return function(...i){const d=()=>{clearTimeout(s),e(...i)};clearTimeout(s),s=setTimeout(d,t)}}function ve(e,t,s){if(!e||!t)return;const r=300;let i="";async function d(a){if(i=a,!a||a.length<2){t.classList.remove("active"),t.innerHTML="";return}try{const o=await k.searchRophim(a),u=(o==null?void 0:o.movies)||[];if(a!==i)return;u.length===0?t.innerHTML=`
                    <div class="search__result" style="opacity: 0.5;">
                        <span>No results found for "${F(a)}"</span>
                    </div>
                `:(t.innerHTML=u.map(l=>{const h=k.getProxyUrl(l.poster_url||l.thumb_url||l.thumbnail,80);return`
                        <div class="search__result" data-video-slug="${l.slug}">
                            <img 
                                src="${h||'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 45" fill="%231a1a1a"%3E%3Crect width="80" height="45"/%3E%3C/svg%3E'}" 
                                alt="${F(l.name||l.title)}"
                                class="search__result-thumb"
                                loading="lazy"
                            >
                            <div class="search__result-info">
                                <div class="search__result-title">${F(l.name||l.title)}</div>
                                <div class="search__result-meta">
                                    ${l.quality?`${l.quality} • `:""}
                                    ${l.year||""}
                                </div>
                            </div>
                        </div>
                    `}).join(""),t.querySelectorAll(".search__result[data-video-slug]").forEach(l=>{l.addEventListener("click",()=>{const h=l.dataset.videoSlug;window.location.href=`/watch.html?id=${h}&slug=${h}`})})),t.classList.add("active")}catch(o){console.error("Search error:",o),t.innerHTML=`
                    < div class="search__result" style = "color: var(--color-error);" >
                        <span>Search failed. Please try again.</span>
                </div >
                    `,t.classList.add("active")}}const m=ye(d,r);e.addEventListener("input",a=>{m(a.target.value.trim())}),document.addEventListener("click",a=>{e&&t&&!e.contains(a.target)&&!t.contains(a.target)&&t.classList.remove("active")}),e.addEventListener("keydown",a=>{a.key==="Escape"&&(e.blur(),t.classList.remove("active"))}),e.addEventListener("focus",()=>{e.value.trim().length>=2&&t.classList.add("active")})}function F(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}const M={elements:{overlay:document.getElementById("splash-screen"),bar:document.getElementById("loading-bar"),text:document.getElementById("loading-text")},progress:0,isFinished:!1,update(e,t){this.isFinished||(this.progress=Math.min(e,100),this.elements.bar&&(this.elements.bar.style.width=`${this.progress}%`),this.elements.text&&t&&(this.elements.text.textContent=t),this.progress>=100&&this.finish())},finish(){this.isFinished||(this.isFinished=!0,setTimeout(()=>{this.elements.overlay&&(this.elements.overlay.classList.add("fade-out"),setTimeout(()=>this.elements.overlay.remove(),1e3))},500))}},p={videos:[],currentCategory:"all",currentVideo:null,isLoading:!1,featuredVideo:null,heroMovies:[],currentHeroIndex:0,heroInterval:null,page:1,hasMore:!0},n={videoGrid:document.getElementById("videoGrid")||document.getElementById("mainContent"),mainContent:document.getElementById("mainContent"),loading:document.getElementById("loading"),emptyState:document.getElementById("emptyState"),categories:document.getElementById("categories"),mainHeader:document.getElementById("mainHeader"),searchWrapper:document.getElementById("searchWrapper"),searchToggle:document.getElementById("searchToggle"),searchInput:document.getElementById("searchInput"),searchResults:document.getElementById("searchResults"),navLinks:document.querySelectorAll(".header__nav-link"),playerModal:document.getElementById("playerModal"),playerContainer:document.getElementById("playerContainer"),playerTitle:document.getElementById("playerTitle"),playerMeta:document.getElementById("playerMeta"),closePlayer:document.getElementById("closePlayer"),modalBackdrop:document.getElementById("modalBackdrop"),mobileNavItems:document.querySelectorAll(".mobile-nav__item, .sidebar__nav-item"),mobileBottomNavButtons:document.querySelectorAll("#mobileBottomNav .nav-item")};function D(e){document.querySelectorAll("#mobileBottomNav .nav-item").forEach(s=>{const r=s.dataset.view===e;s.classList.toggle("active",r),s.classList.toggle("text-white",r),s.classList.toggle("text-gray-400",!r);const i=s.querySelector(".material-symbols-outlined");i&&(i.style.fontVariationSettings=r?"'FILL' 1":"'FILL' 0")})}async function V(){M.update(10,"Initializing services..."),ve(n.searchInput,n.searchResults),M.update(20,"Setting up navigation..."),n.mobileBottomNavButtons&&n.mobileBottomNavButtons.forEach(r=>{r.addEventListener("click",i=>{i.preventDefault();const d=r.dataset.view;if(d)if(n.mobileBottomNavButtons.forEach(m=>m.classList.remove("active")),r.classList.add("active"),j(),d==="home")Ce(),window.scrollTo({top:0,behavior:"smooth"});else if(d==="search")if(window.innerWidth<768)try{W()}catch(m){console.error("Search render failed",m)}else n.searchWrapper.classList.add("active"),n.searchInput.focus();else d==="mylist"?window.innerWidth<768?Y():N("mylist"):d==="downloads"?$("Downloads feature coming soon!","info"):d==="profile"?Ee():d==="cinema"?(D("cinema"),C("cinema"),window.scrollTo({top:0,behavior:"smooth"})):(C(d),window.scrollTo({top:0,behavior:"smooth"}))})}),xe(),M.update(40,"Fetching movie catalog...");try{await C("home")}catch(r){console.error("Home render failed",r)}M.update(70,"Preparing featured content...");try{await S()}catch(r){console.error("Hero render failed",r)}M.update(90,"Applying final touches...");const t=new URLSearchParams(window.location.search).get("view");t&&window.innerWidth<768&&(t==="search"?W():t==="mylist"?Y():t==="cinema"&&C("cinema")),new ie().init(),"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("/sw.js")}),M.update(100,"Welcome to StreamFlix");try{await z.setStyle({style:se.Dark}),await z.setBackgroundColor({color:"#141414"})}catch{}}function S(e=null){const t=document.getElementById("heroTitle"),s=document.getElementById("heroDescription"),r=document.getElementById("heroBg"),i=document.getElementById("heroTag"),d=document.getElementById("heroTagContainer"),m=document.getElementById("heroPlayBtn"),a=document.getElementById("heroInfoBtn"),o=document.getElementById("heroContent"),u=e||p.featuredVideo||p.videos[0];u&&(r&&(r.style.opacity="0.5"),o&&(o.style.opacity="0"),setTimeout(()=>{t&&(t.textContent=u.name||u.title||"Featured Movie"),s&&(s.textContent=u.description||u.content||"Watch now on StreamFlix");const l=u.backdrop||u.poster_url||u.thumb_url||u.thumbnail||"";if(r&&l&&(r.style.backgroundImage=`url('${l}')`),i&&d){const h=u.genres||u.category;d.classList.remove("hidden"),h&&Array.isArray(h)&&h.length>0?i.textContent=h[0]:typeof h=="string"?i.textContent=h:i.textContent="#1 in Movies Today"}if(m&&m.parentNode){const h=m.cloneNode(!0);m.parentNode.replaceChild(h,m),h.addEventListener("click",()=>{oe(),L(u)})}if(a&&a.parentNode){const h=a.cloneNode(!0);a.parentNode.replaceChild(h,a),h.addEventListener("click",()=>Z(u))}r&&(r.style.opacity="1"),o&&(o.style.opacity="1")},300),p.featuredVideo=u)}function be(){p.heroInterval&&clearInterval(p.heroInterval),!(!p.heroMovies||p.heroMovies.length<=1)&&(p.heroInterval=setInterval(()=>{p.currentHeroIndex++,p.currentHeroIndex>=p.heroMovies.length&&(p.currentHeroIndex=0),S(p.heroMovies[p.currentHeroIndex])},8e3))}function xe(){var o,u,l,h;const e=document.getElementById("backToTop"),t=()=>{const c=window.scrollY;n.mainHeader&&(c>100?(n.mainHeader.classList.add("scrolled"),n.mainHeader.style.backgroundColor="#141414"):(n.mainHeader.classList.remove("scrolled"),n.mainHeader.style.backgroundColor="transparent")),e&&(c>500?e.classList.add("visible"):e.classList.remove("visible"))};window.addEventListener("scroll",t,{passive:!0}),t(),e&&e.addEventListener("click",()=>{window.scrollTo({top:0,behavior:"smooth"})}),(o=n.navLinks)==null||o.forEach(c=>{c.addEventListener("click",f=>{f.preventDefault();const g=c.dataset.category;n.navLinks.forEach(y=>y.classList.remove("active")),c.classList.add("active"),p.currentCategory=g,B(g,!0)})}),(u=n.mobileNavItems)==null||u.forEach(c=>{c.addEventListener("click",f=>{f.preventDefault();const g=c.dataset.view;if(n.mobileNavItems.forEach(y=>y.classList.remove("active")),c.classList.add("active"),n.mobileNavItems.forEach(y=>{y.dataset.view===g&&y.classList.add("active")}),g==="home"){n.videoGrid.style.display="block";const y=document.getElementById("newHotContainer");y&&(y.style.display="none"),p.currentCategory="all",B("all",!0)}else if(["movies","series","animation","cinema"].includes(g)){n.videoGrid.style.display="block";const y=document.getElementById("newHotContainer");y&&(y.style.display="none"),p.currentCategory=g,B(g,!0)}else if(g==="history"){n.videoGrid.style.display="block";const y=document.getElementById("newHotContainer");y&&(y.style.display="none"),N()}else if(g==="search"){const y=document.getElementById("headerSearchBtn");y&&y.click()}window.scrollTo({top:0,behavior:"smooth"})})});const s=document.querySelectorAll(".netflix-header__nav-link");s.forEach(c=>{c.addEventListener("click",f=>{f.preventDefault();const g=c.dataset.view;s.forEach(v=>v.classList.remove("active")),c.classList.add("active"),n.mobileNavItems.forEach(v=>{v.classList.remove("active"),v.dataset.view===g&&v.classList.add("active")}),n.videoGrid.style.display="block";const y=document.getElementById("newHotContainer");y&&(y.style.display="none"),g==="home"?(p.currentCategory="all",B("all",!0)):["movies","series","animation","cinema"].includes(g)?(p.currentCategory=g,B(g,!0)):g==="history"&&N(),window.scrollTo({top:0,behavior:"smooth"})})});const r=document.getElementById("headerSearchBtn");r&&r.addEventListener("click",c=>{c.preventDefault();const f=document.getElementById("searchModal"),g=document.getElementById("searchInput");f&&(f.classList.add("active"),g&&setTimeout(()=>g.focus(),100))});const i=document.getElementById("mobileSearchBtn");i&&i.addEventListener("click",c=>{c.preventDefault();const f=document.getElementById("searchModal"),g=document.getElementById("searchInput");f&&(j(),f.classList.add("active"),g&&setTimeout(()=>g.focus(),100))});const d=document.getElementById("closeSearch");d&&d.addEventListener("click",()=>{const c=document.getElementById("searchModal");c&&c.classList.remove("active")});const m=document.getElementById("modalPlayerBackButton");m&&m.addEventListener("click",()=>{var c;j(),(c=window.history.state)!=null&&c.playerOpen?window.history.back():A()}),window.addEventListener("popstate",c=>{var f,g;(f=n.playerModal)!=null&&f.classList.contains("active")&&!((g=c.state)!=null&&g.playerOpen)&&A(!1)});const a=document.querySelectorAll(".nav-link");a.forEach(c=>{c.addEventListener("click",f=>{const g=c.getAttribute("href");if(g&&g!=="#"&&!g.startsWith("#"))return;f.preventDefault();const y=c.dataset.view;a.forEach(v=>{v.classList.remove("active","text-white"),v.classList.add("text-gray-300")}),c.classList.add("active","text-white"),c.classList.remove("text-gray-300"),y==="home"?(p.currentCategory="all",C("home")):y==="series"?(p.currentCategory="series",C("series")):y==="movies"?(p.currentCategory="movies",C("movies")):y==="cinema"?(p.currentCategory="cinema",C("cinema")):y==="history"&&N(),window.scrollTo({top:0,behavior:"smooth"})})}),(l=n.closePlayer)==null||l.addEventListener("click",A),(h=n.modalBackdrop)==null||h.addEventListener("click",A),document.addEventListener("keydown",c=>{var f,g,y;if(c.key==="Escape"){(f=n.playerModal)!=null&&f.classList.contains("active")&&((g=window.history.state)!=null&&g.playerOpen?window.history.back():A()),(y=n.searchWrapper)!=null&&y.classList.contains("active")&&n.searchWrapper.classList.remove("active");const v=document.getElementById("searchModal");v!=null&&v.classList.contains("active")&&v.classList.remove("active")}})}async function B(e="all",t=!1){if(p.isLoading||(t&&(p.page=1,p.hasMore=!0,p.videos=[],n.videoGrid.innerHTML=""),!p.hasMore))return;p.isLoading=!0,H(p.page===1);const s=(i,d=12e3)=>Promise.race([i,new Promise((m,a)=>setTimeout(()=>a(new Error("Timeout")),d))]),r=document.getElementById("topSearchBtn");r&&r.addEventListener("click",i=>{i.preventDefault();const d=document.getElementById("searchModal"),m=document.getElementById("searchInput");d&&(d.classList.add("active"),m&&setTimeout(()=>m.focus(),100))});try{let i=null,d=!1;if(i||(i=await s(k.getRophimCatalog({category:e!=="all"?e:null,page:p.page,limit:24}),12e3)),i&&i.movies&&i.movies.length>0){const m=i.movies.map(l=>({id:l.id||`api_${Date.now()}_${Math.random()}`,title:l.title||"Unknown Title",thumbnail:l.thumbnail||"https://via.placeholder.com/300x450?text=No+Image",backdrop:l.backdrop||l.thumbnail||"https://via.placeholder.com/1920x1080?text=No+Backdrop",preview_url:l.preview_url||"",duration:l.duration||0,resolution:l.quality||"HD",category:l.category||"movies",year:l.year||new Date().getFullYear(),description:l.description||"",matchScore:Math.floor(Math.random()*15)+85,source_url:l.source_url,slug:l.slug,cast:l.cast||[],director:l.director,country:l.country,episodes:l.episodes||[]})),a=new Set(p.videos.map(l=>l.id)),o=m.filter(l=>!a.has(l.id));p.videos=[...p.videos,...o],p.page+=1,m.length<24,p.page===2?P(p.videos,!1):P(o,!0),Le(),b&&b.classList.remove("loading"),p.isLoading=!1,H(!1);return}else p.hasMore=!1,b&&(b.classList.remove("loading"),b.style.display="none"),p.isLoading=!1,H(!1)}catch(i){if(console.warn("API load failed:",i),p.page===1){$("Using offline mode","info");const d=ee();p.videos=d,p.featuredVideo=d[0],P(d)}p.isLoading=!1,H(!1)}}function q(e,t,s="poster"){const r=document.createElement("section");r.className="flex flex-col gap-4 mb-12 relative";const i=document.createElement("h2");i.className="text-xl md:text-2xl font-bold text-white hover:text-primary cursor-pointer transition-colors flex items-center gap-2 group px-4 md:px-12",i.innerHTML=`
        ${e}
        <span class="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity text-primary">arrow_forward_ios</span>
    `,r.appendChild(i);const d=document.createElement("div");d.className="relative group/slider";const m=document.createElement("button");m.className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-full bg-gradient-to-r from-black/80 to-transparent opacity-0 group-hover/slider:opacity-100 transition-opacity flex items-center justify-start pl-2",m.innerHTML='<span class="material-symbols-outlined text-white text-3xl">chevron_left</span>';const a=document.createElement("button");a.className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-full bg-gradient-to-l from-black/80 to-transparent opacity-0 group-hover/slider:opacity-100 transition-opacity flex items-center justify-end pr-2",a.innerHTML='<span class="material-symbols-outlined text-white text-3xl">chevron_right</span>';const o=document.createElement("div");o.className="flex gap-3 overflow-x-auto scroll-smooth no-scrollbar px-4 md:px-12 pb-4",t.forEach((l,h)=>{let c;s==="landscape"?c=ke(l):c=we(l,!1,0,"horizontal"),c.className=c.className.replace("w-full",""),c.style.minWidth="280px",c.style.maxWidth="380px",c.style.flex="0 0 auto",o.appendChild(c)});const u=600;return m.addEventListener("click",()=>{o.scrollBy({left:-u,behavior:"smooth"})}),a.addEventListener("click",()=>{o.scrollBy({left:u,behavior:"smooth"})}),d.appendChild(m),d.appendChild(o),d.appendChild(a),r.appendChild(d),r}function we(e,t=!1,s=0,r="vertical"){const i=document.createElement("div"),d=r==="horizontal"?"aspect-video":"aspect-[2/3]";i.className="w-full cursor-pointer snap-start group relative transition-all duration-300 ease-in-out hover:z-30 hover:scale-105";let m=e.poster_url||e.thumb_url||e.thumbnail||"";r==="horizontal"&&e.backdrop&&(m=e.backdrop);const o=window.innerWidth<768?180:r==="horizontal"?400:200,u=m?k.getProxyUrl(m,o):"",l=e.name||e.title||"Untitled",h=e.year||"",c=e.quality||"HD",f=e.slug||e.id||"",g=e.matchScore||Math.floor(Math.random()*10+90),y=Math.floor(Math.random()*19+80);i.innerHTML=`
        <div class="relative ${d} rounded-md overflow-hidden bg-surface-dark shadow-lg transition-all duration-300 group-hover:shadow-2xl ring-0 group-hover:ring-2 group-hover:ring-white/20">
            <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style="background-image: url('${u}');"></div>
            
            <!-- Gradient Overlay (Only visible on hover) -->
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <!-- Badges Container -->
            <div class="absolute top-2 left-2 flex flex-col gap-1 z-20">
                 ${!t&&h===new Date().getFullYear().toString()?'<span class="bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">NEW</span>':""}
                 ${e.quality?`<span class="bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/10 uppercase">${e.quality.replace("FHD","HD")}</span>`:""}
                 ${e.current_episode?`<span class="bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/10">EP ${e.current_episode}</span>`:""}
            </div>

            <!-- Number Badge -->
            ${t?`<span class="absolute top-0 right-0 bg-primary text-white text-4xl font-black p-2 leading-none shadow-lg z-20">${s}</span>`:""}
            
            <!-- Hover Content -->
            <div class="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 pointer-events-none">
                
                <!-- Action Buttons -->
                <div class="flex items-center justify-between mb-3 pointer-events-auto">
                    <div class="flex gap-2">
                        <button class="bg-white text-black h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-200 transition-transform hover:scale-110 btn-play" title="Play">
                            <span class="material-symbols-outlined text-[20px] fill-current" style="font-variation-settings: 'FILL' 1;">play_arrow</span>
                        </button>
                        <button class="bg-zinc-800/60 backdrop-blur-md border border-gray-400 text-white h-8 w-8 rounded-full flex items-center justify-center hover:border-white hover:bg-zinc-700 transition-transform hover:scale-110 btn-add-list" data-slug="${f}" title="Add to List">
                            <span class="material-symbols-outlined text-[18px]">add</span>
                        </button>
                    </div>
                    <button class="bg-zinc-800/60 backdrop-blur-md border border-gray-400 text-white h-8 w-8 rounded-full flex items-center justify-center hover:border-white hover:bg-zinc-700 transition-transform hover:scale-110 btn-info" data-slug="${f}" title="More Info">
                        <span class="material-symbols-outlined text-[18px]">info</span>
                    </button>
                </div>

                <!-- Metadata -->
                <div class="space-y-1">
                     <div class="flex items-center gap-2 text-[10px] font-semibold">
                        <span class="text-green-400">${g}% Match</span>
                        <span class="border border-gray-400 px-1 rounded text-gray-200">${c}</span>
                        <span class="text-gray-300">${h}</span>
                    </div>
                    
                    <!-- Ratings & Tags -->
                    <div class="flex items-center gap-3 text-[10px] font-bold">
                        <div class="flex items-center gap-1 text-yellow-500">
                             <span class="bg-[#FA320A] text-white px-1 rounded flex items-center gap-0.5 h-3.5">
                                <span class="material-symbols-outlined text-[10px]">local_pizza</span> ${y}%
                            </span>
                        </div>
                         ${e.genres&&e.genres.length>0?`<span class="text-white/70 font-normal truncate max-w-[100px]">${e.genres[0]}</span>`:""}
                    </div>

                    <h3 class="text-sm font-bold text-white leading-tight line-clamp-2 drop-shadow-md mt-1">
                        ${l}
                    </h3>
                </div>
            </div>
        </div>
    `,i.addEventListener("click",x=>{x.target.closest("button")||L(e)});const v=i.querySelector(".btn-play");v&&v.addEventListener("click",x=>{x.stopPropagation(),L(e)});const E=i.querySelector(".btn-add-list");E&&E.addEventListener("click",x=>{if(x.stopPropagation(),window.historyService){const w=window.historyService.toggleFavorite(e),T=E.querySelector("span");w?(T.textContent="check",$("Added to My List","success")):(T.textContent="add",$("Removed from My List","info"))}});const G=i.querySelector(".btn-info");return G&&G.addEventListener("click",x=>{x.stopPropagation(),Z(e)}),i}function ke(e){var m,a;const t=document.createElement("div");t.className="flex-none w-[280px] group/card cursor-pointer snap-start";const s=e.backdrop||e.thumb_url||e.thumbnail||"",r=e.name||e.title||"Untitled",i=((m=e.progress)==null?void 0:m.percentage)||0,d=(a=e.progress)!=null&&a.episode?`S${e.season||1}:E${e.progress.episode}`:"";return t.innerHTML=`
        <div class="relative aspect-video rounded-md overflow-hidden bg-surface-dark card-hover">
            <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('${s}');"></div>
            <div class="absolute inset-0 bg-black/30 group-hover/card:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover/card:opacity-100">
                <span class="material-symbols-outlined text-5xl bg-black/50 rounded-full p-2 border-2 border-white">play_arrow</span>
            </div>
            <div class="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                <div class="h-full bg-primary" style="width: ${i}%;"></div>
            </div>
        </div>
        <div class="mt-2 flex justify-between items-center px-1">
            <span class="text-sm font-semibold text-gray-200">${r}</span>
            ${d?`<span class="text-xs text-gray-400">${d}</span>`:""}
        </div>
    `,t.addEventListener("click",()=>L(e)),t}function P(e,t=!1){if(t||(n.videoGrid.innerHTML="",n.videoGrid.innerHTML="",n.videoGrid.className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-10"),e.length===0&&!t){n.emptyState&&(n.emptyState.style.display="flex");return}n.emptyState&&(n.emptyState.style.display="none"),e.forEach(s=>{const r=fe(s,L);n.videoGrid.appendChild(r)})}let I,b=null,O=0;function Le(){if(!p.hasMore){b&&(b.classList.remove("loading"),b.style.display="none"),I&&I.disconnect();return}I&&I.disconnect(),document.querySelectorAll(".scroll-sentinel").forEach(s=>s.remove()),b=null;const e={root:null,rootMargin:"50px",threshold:0};I=new IntersectionObserver(s=>{s.forEach(r=>{const i=Date.now();i-O<1500||r.isIntersecting&&!p.isLoading&&p.hasMore&&(O=i,b&&b.classList.add("loading"),B(p.currentCategory))})},e),b=document.createElement("div"),b.className="scroll-sentinel",b.id="scrollSentinel";const t=document.getElementById("infinite-scroll-container");t?t.parentNode.insertBefore(b,t.nextSibling):n.videoGrid.appendChild(b),I.observe(b)}function Z(e){X(e)}function N(e="history"){if(n.mainHeader&&(n.mainHeader.style.display=""),!window.historyService){console.error("HistoryService not initialized");return}n.videoGrid.innerHTML="",n.emptyState&&(n.emptyState.style.display="none");const t=document.querySelector(".view-tabs");t&&t.remove();const s=document.createElement("div");s.className="view-tabs",s.innerHTML=`
        <button class="view-tab ${e==="history"?"active":""}" data-tab="history">Watch History</button>
        <button class="view-tab ${e==="mylist"?"active":""}" data-tab="mylist">My List</button>
    `,n.videoGrid.before(s),s.querySelectorAll(".view-tab").forEach(a=>{a.addEventListener("click",()=>{s.remove(),N(a.dataset.tab)})});let r=[];if(e==="history"?r=window.historyService.getHistory():r=window.historyService.getFavorites(),r.length===0){if(n.emptyState){n.emptyState.style.display="flex";const a=n.emptyState.querySelector("h2"),o=n.emptyState.querySelector("p");e==="history"?(a&&(a.textContent="No history yet"),o&&(o.textContent="Movies you watch will appear here.")):(a&&(a.textContent="My List is empty"),o&&(o.textContent="Add movies to your list to watch later."))}return}r.sort((a,o)=>{const u=a.timestamp||a.year||0;return(o.timestamp||o.year||0)-u});const i=r.map((a,o)=>({...a,id:a.id||a.slug,orientation:"horizontal"}));n.mainHeader&&(n.mainHeader.style.display="block");const m=q(e==="history"?"Continue Watching":"My List",i,"poster");n.videoGrid.appendChild(m)}function L(e){sessionStorage.setItem("currentVideo",JSON.stringify(e)),sessionStorage.setItem("allVideos",JSON.stringify(p.videos)),X(e)}function X(e){window.location.href=`/watch.html?slug=${e.slug}`}function A(e=!0){var t;n.playerModal&&(n.playerModal.classList.add("hidden"),n.playerModal.classList.remove("active"),n.playerModal.style.display="none",ne()),e&&((t=window.history.state)!=null&&t.playerOpen),n.playerContainer.innerHTML="",p.currentVideo=null}function H(e){n.loading&&(n.loading.style.display=e?"flex":"none"),n.videoGrid&&(n.videoGrid.style.display=e?"none":"block")}async function C(e){const t=document.querySelector(".view-tabs");t&&t.remove(),n.mainHeader&&(n.mainHeader.style.display=""),H(!0),n.videoGrid.innerHTML="",n.videoGrid.className="space-y-12";const s={home:[{title:"Continue Watching",type:"history",limit:12,cardType:"landscape"},{title:"Cinema Releases",category:"phim-chieu-rap",limit:12,isHeroSource:!0},{title:"Top Rated",category:"phim-le",sort:"rating",limit:12},{title:"Action & Adventure",category:"hanh-dong",limit:12},{title:"Animation",category:"hoat-hinh",limit:12},{title:"Korean Hits",category:"han-quoc",limit:12},{title:"Horror & Thriller",category:"kinh-di",limit:12},{title:"Romance",category:"tinh-cam",limit:12}],series:[{title:"Popular TV Shows",category:"phim-bo",limit:12,isHeroSource:!0},{title:"Korean Dramas",category:"korean",limit:12},{title:"Chinese Dramas",category:"china",limit:12},{title:"Anime Series",category:"hoat-hinh",limit:12},{title:"Documentaries",category:"tai-lieu",limit:12}],movies:[{title:"Blockbuster Movies",category:"phim-le",sort:"year",limit:12,isHeroSource:!0},{title:"Action & Adventure",category:"action",limit:12},{title:"Comedy Films",category:"comedy",limit:12},{title:"Cinema Releases",category:"phim-chieu-rap",limit:12},{title:"Horror Movies",category:"kinh-di",limit:12},{title:"Sci-Fi & Fantasy",category:"vien-tuong",limit:12}],cinema:[{title:"Now Showing",category:"phim-chieu-rap",limit:12,isHeroSource:!0},{title:"New Releases",category:"phim-le",sort:"year",limit:12},{title:"Top Rated",category:"phim-le",sort:"rating",limit:12},{title:"Action Blockbusters",category:"action",limit:12},{title:"Animated Features",category:"hoat-hinh",limit:12}]},r=s[e]||s.home,i=3;try{let d=null;for(let a=0;a<Math.min(i,r.length);a++){const o=r[a],u=await K(o);if(u&&u.length>0){d||(d=u),o.isHeroSource&&(!p.heroMovies||p.heroMovies.length===0)&&u.length>0&&(p.heroMovies=u.slice(0,10),p.featuredVideo=u[0],p.videos=u,p.currentHeroIndex=0,S(p.heroMovies[0]),be());const l=q(o.title,u,o.cardType||"poster");n.videoGrid.appendChild(l)}}(e==="home"||e==="cinema")&&sessionStorage.setItem(`view_cache_${e}`,n.videoGrid.innerHTML);const m=new IntersectionObserver(async(a,o)=>{for(const u of a)if(u.isIntersecting){const l=u.target,h=parseInt(l.dataset.configIndex),c=r[h];o.unobserve(l),l.innerHTML='<div class="flex justify-center py-8"><div class="loading-spinner"></div></div>';const f=await K(c);if(f&&f.length>0){const g=q(c.title,f,c.cardType||"poster");l.replaceWith(g),(e==="home"||e==="cinema")&&sessionStorage.setItem(`view_cache_${e}`,n.videoGrid.innerHTML)}else l.remove()}},{rootMargin:"800px"});for(let a=i;a<r.length;a++){const o=document.createElement("div");o.className="lazy-section-placeholder h-32 mb-12",o.dataset.configIndex=a,o.innerHTML=`<h2 class="text-xl md:text-2xl font-bold text-white/30 px-4 md:px-12">${r[a].title}</h2>`,n.videoGrid.appendChild(o),m.observe(o)}if(!p.featuredVideo)if(d&&d.length>0)p.featuredVideo=d[0],p.videos=d,S();else try{const a=ee();a&&a.length>0&&(p.featuredVideo=a[0],p.videos=a,S())}catch(a){console.warn("Demo content fallback failed",a)}n.videoGrid.children.length===0&&(n.videoGrid.innerHTML=`
                <div class="flex flex-col items-center justify-center py-20 text-gray-400">
                    <span class="material-symbols-outlined text-6xl mb-4 opacity-30">movie</span>
                    <p>No content available for this category</p>
                </div>
            `)}catch(d){console.error("Error rendering category view:",d),$("Connection failed: "+d.message,"error"),n.videoGrid.innerHTML=`
            <div class="flex flex-col items-center justify-center py-20 text-gray-400">
                <span class="material-symbols-outlined text-6xl mb-4 opacity-30">error</span>
                <p>Failed to load content. Please try again.</p>
            </div>
        `}H(!1)}async function K(e){try{if(e.type==="history")return window.historyService?window.historyService.getHistory().slice(0,e.limit).map(o=>({id:o.slug||o.id,title:o.title,thumbnail:o.thumbnail||o.poster_url,slug:o.slug,year:o.year,quality:o.quality||"HD",view_progress:o.view_progress||0})):[];const t={category:e.category||null,limit:e.limit||40,sort:e.sort||"year"};e.country&&(t.country=e.country),e.genre&&(t.genre=e.genre);const s=async a=>{const o=[1,2,3,4,5,6,7,8].map(l=>k.getRophimCatalog({...a,page:l}).catch(h=>({movies:[]})));return(await Promise.all(o)).flatMap(l=>l.movies||[])};let r=await s(t);if(r.length<20&&e.sort&&e.sort!=="modified"){const a=await s({...t,sort:"modified"});r=[...r,...a]}const i=[],d=new Set;for(const a of r){if(!a)continue;const o=a.slug||a.id;d.has(o)||(d.add(o),i.push({id:a.id||a.slug,title:a.title,thumbnail:a.thumbnail,poster_url:a.poster_url||a.thumbnail,backdrop:a.backdrop||a.poster_url||a.thumbnail,slug:a.slug,year:a.year,quality:a.quality||"HD",rating:a.rating,category:a.category}))}const m=Math.max(e.limit||40,48);return i.slice(0,m)}catch(t){return console.error(`Error fetching section "${e.title}":`,t),[]}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",V):V();function ee(){const e="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",t={VENOM:"https://image.tmdb.org/t/p/w500/aosm8NMQ3UyoBVpSxyimorCQykC.jpg",SQUID:"https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop",ARCANE:"https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop",PENGUIN:"https://images.unsplash.com/photo-1478720568477-152d9b164e63?w=800&auto=format&fit=crop",GLADIATOR:"https://images.unsplash.com/photo-1565060416-522204c35613?w=800&auto=format&fit=crop",MOANA:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop",WICKED:"https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop",DBZ:"https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop"};return[{id:"d1",title:"Venom: The Last Dance",thumbnail:t.VENOM,backdrop:"https://image.tmdb.org/t/p/original/3V4kLQg0kSqPLctI5ziYWabAZYF.jpg",preview_url:e,duration:7200,resolution:"4K",category:"action",year:2024,matchScore:98,director:"Kelly Marcel",country:"USA",cast:["Tom Hardy","Chiwetel Ejiofor","Juno Temple"],description:"Eddie and Venom are on the run. Hunted by both of their worlds and with the net closing in, the duo are forced into a devastating decision.",episodes:[]},{id:"d2",title:"Squid Game Season 2",thumbnail:t.SQUID,backdrop:t.SQUID,preview_url:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",duration:3600,resolution:"HD",category:"series",year:2024,matchScore:99,director:"Hwang Dong-hyuk",country:"Korea",cast:["Lee Jung-jae","Lee Byung-hun","Wi Ha-jun"],description:"Gi-hun returns to the death games after three years with a new resolution: to find the people behind and to put an end to the sport.",episodes:[{number:1,title:"Red Light, Green Light",url:e},{number:2,title:"The Man with the Umbrella",url:e},{number:3,title:"Stick to the Team",url:e}]},{id:"d3",title:"Arcane Season 2",thumbnail:t.ARCANE,backdrop:t.ARCANE,preview_url:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",duration:2400,resolution:"4K",category:"anime",year:2024,matchScore:97,director:"Christian Linke",country:"USA, France",cast:["Hailee Steinfeld","Ella Purnell","Katie Leung"],description:"As conflict between Piltover and Zaun reaches a boiling point, Jinx and Vi must decide what kind of future they are fighting for.",episodes:[{number:1,title:"Heavy Is the Crown",url:e},{number:2,title:"Watch It All Burn",url:e},{number:3,title:"Finally Got It Right",url:e}]},{id:"d4",title:"The Penguin",thumbnail:t.PENGUIN,backdrop:t.PENGUIN,preview_url:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",duration:3600,resolution:"HD",category:"series",year:2024,matchScore:95,director:"Craig Zobel",country:"USA",cast:["Colin Farrell","Cristin Milioti","Rhenzy Feliz"],description:"Following the events of The Batman, Oz Cobb makes a play for power in the underworld of Gotham City.",episodes:[]},{id:"d5",title:"Gladiator II",thumbnail:t.GLADIATOR,backdrop:t.GLADIATOR,preview_url:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",duration:8400,resolution:"4K",category:"action",year:2024,matchScore:96,director:"Ridley Scott",country:"USA, UK",cast:["Paul Mescal","Pedro Pascal","Denzel Washington"],description:"Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius is forced to enter the Colosseum.",episodes:[]},{id:"d6",title:"Moana 2",thumbnail:t.MOANA,backdrop:t.MOANA,preview_url:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",duration:6e3,resolution:"HD",category:"theater",year:2024,matchScore:94,director:"David G. Derrick Jr.",country:"USA",cast:["Auliʻi Cravalho","Dwayne Johnson","Alan Tudyk"],description:"After receiving an unexpected call from her wayfinding ancestors, Moana must journey to the far seas of Oceania.",episodes:[]},{id:"d7",title:"Wicked",thumbnail:t.WICKED,backdrop:t.WICKED,preview_url:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",duration:9e3,resolution:"4K",category:"theater",year:2024,matchScore:93,director:"Jon M. Chu",country:"USA",cast:["Cynthia Erivo","Ariana Grande","Jeff Goldblum"],description:"Elphaba, a misunderstood young woman with green skin, and Glinda, a popular blonde, forge an unlikely friendship.",episodes:[]},{id:"d8",title:"Dragon Ball Daima",thumbnail:t.DBZ,backdrop:t.DBZ,preview_url:"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",duration:1440,resolution:"HD",category:"anime",year:2024,matchScore:98,director:"Yoshitaka Yashima",country:"Japan",cast:["Masako Nozawa","Ryō Horikawa"],description:"Goku and his friends are turned small due to a conspiracy. To fix things, they head off to a new world.",episodes:[{number:1,title:"Conspiracy",url:e}]}]}function Ee(){n.mainHeader&&(n.mainHeader.style.display="");const e=document.getElementById("heroContainer");e&&(e.style.display="",S()),D("profile"),n.videoGrid.innerHTML="",n.videoGrid.className="profile-view pb-24 bg-background-light dark:bg-background-dark min-h-screen";const t=`
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
    `;if(n.videoGrid.innerHTML=t,window.historyService){const s=window.historyService.getHistory().slice(0,10);if(s.length>0){const r=document.getElementById("profileHistoryContainer"),i=q("Continue Watching",s,"landscape");r.appendChild(i)}}}async function Ce(){n.mainHeader&&(n.mainHeader.style.display="");const e=document.getElementById("heroContainer");if(e&&(e.style.display=""),D("home"),window.innerWidth<768){document.querySelectorAll("footer").forEach(s=>s.style.display="none");const t=document.getElementById("searchModal");t&&t.classList.remove("active")}else document.querySelectorAll("footer").forEach(t=>t.style.display="");await C("home")}async function W(){n.mainHeader&&(n.mainHeader.style.display="");const e=document.getElementById("heroContainer");e&&(e.style.display="",S()),document.querySelectorAll("footer").forEach(o=>o.style.display="none");const t=document.getElementById("searchModal");t&&t.classList.remove("active"),D("search"),n.videoGrid.innerHTML="",n.videoGrid.className="mobile-search-view bg-background-light dark:bg-background-dark";const s=`
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
    `;n.videoGrid.innerHTML=s;const r=document.getElementById("mobileSearchInput"),i=document.getElementById("mobileSearchResults");let d=null;r&&i&&(r.addEventListener("input",o=>{clearTimeout(d);const u=o.target.value.trim();d=setTimeout(async()=>{if(!(u.length<2)){i.innerHTML='<div class="flex justify-center py-12"><div class="loading-spinner"></div></div>';try{const l=await k.searchRophim(u);if(l&&l.movies&&l.movies.length>0){i.innerHTML=`
                            <h2 class="text-white text-sm font-bold px-4 mb-3">Results for "${u}"</h2>
                            <div class="grid grid-cols-3 gap-3 px-4"></div>
                        `;const h=i.querySelector(".grid");l.movies.forEach(c=>{const f=document.createElement("div");f.className="relative group aspect-[2/3] overflow-hidden rounded-lg cursor-pointer",f.innerHTML=`
                                <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style='background-image: url("${c.thumbnail}");'></div>
                                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div class="absolute bottom-0 left-0 right-0 p-2">
                                        <p class="text-white text-[10px] font-bold line-clamp-1">${c.title}</p>
                                    </div>
                                </div>
                            `,f.addEventListener("click",()=>L(c)),h.appendChild(f)})}else i.innerHTML=`
                            <div class="text-center py-12">
                                <span class="material-symbols-outlined text-4xl text-white/30 mb-2">search_off</span>
                                <p class="text-white/50">No results for "${u}"</p>
                            </div>
                        `}catch(l){console.error("Mobile search failed:",l),i.innerHTML='<div class="text-center py-12 text-white/50">Search failed. Try again.</div>'}}},300)}),r.focus());const m=document.getElementById("mobileSearchCancel");m&&m.addEventListener("click",()=>{const o=document.getElementById("mobileSearchInput");o&&(o.value="",o.focus()),W()});try{const o=await k.getRophimCatalog({category:"trending",limit:5});if(o&&o.movies){const l=document.getElementById("topSearchesList");o.movies.forEach(h=>{const c=document.createElement("div");c.className="group flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-colors",c.innerHTML=`
                    <div class="shrink-0 relative">
                        <div class="bg-center bg-cover rounded-lg h-16 w-28 shadow-sm" style='background-image: url("${h.thumbnail}");'></div>
                    </div>
                    <div class="flex flex-col justify-center flex-1 min-w-0">
                        <p class="text-slate-900 dark:text-white text-sm font-semibold leading-normal truncate group-hover:text-primary transition-colors">${h.title}</p>
                        <p class="text-slate-500 dark:text-[#cc8f92] text-xs font-normal leading-normal truncate">${h.year||"2024"}</p>
                    </div>
                    <div class="shrink-0">
                        <span class="material-symbols-outlined text-slate-400 dark:text-white text-[28px] group-hover:text-primary">play_circle</span>
                    </div>
                `,c.addEventListener("click",()=>L(h)),l.appendChild(c)})}const u=await k.getRophimCatalog({category:"phim-le",limit:9});if(u&&u.movies){const l=document.getElementById("recommendedGrid");u.movies.forEach(h=>{const c=document.createElement("div");c.className="relative group aspect-[2/3] overflow-hidden rounded-lg cursor-pointer",c.innerHTML=`
                    <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style='background-image: url("${h.thumbnail}");'></div>
                 `,c.addEventListener("click",()=>L(h)),l.appendChild(c)})}}catch(o){console.error("Failed to load mobile search content",o)}const a=document.querySelectorAll(".search-chip");a.forEach(o=>{o.addEventListener("click",async()=>{var c;const u=o.dataset.genre;if(!u)return;a.forEach(f=>{f.classList.remove("active","bg-white","text-black"),f.classList.add("bg-gray-200","dark:bg-surface-dark");const g=f.querySelector("p");g&&(g.classList.remove("font-bold"),g.classList.add("font-medium","text-slate-700","dark:text-gray-300"))}),o.classList.add("active","bg-white","text-black"),o.classList.remove("bg-gray-200","dark:bg-surface-dark");const l=o.querySelector("p");l&&(l.classList.add("font-bold"),l.classList.remove("font-medium","text-slate-700","dark:text-gray-300"));const h=document.getElementById("mobileSearchResults");if(h){h.innerHTML='<div class="flex justify-center py-12"><div class="loading-spinner"></div></div>';try{const f=await k.getRophimCatalog({category:u,limit:12});if(f&&f.movies&&f.movies.length>0){const g=((c=o.querySelector("p"))==null?void 0:c.textContent)||u;h.innerHTML=`
                            <h2 class="text-white text-lg font-bold px-4 mb-4">${g}</h2>
                            <div class="grid grid-cols-3 gap-3 px-4"></div>
                        `;const y=h.querySelector(".grid");f.movies.forEach(v=>{const E=document.createElement("div");E.className="relative group aspect-[2/3] overflow-hidden rounded-lg cursor-pointer",E.innerHTML=`
                                <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style='background-image: url("${v.thumbnail}");'></div>
                            `,E.addEventListener("click",()=>L(v)),y.appendChild(E)})}else h.innerHTML='<p class="text-center text-gray-400 py-12">No results found</p>'}catch(f){console.error("Genre filter error:",f),h.innerHTML='<p class="text-center text-gray-400 py-12">Failed to load content</p>'}}})})}async function Y(){n.mainHeader&&(n.mainHeader.style.display="");const e=document.getElementById("heroContainer");e&&(e.style.display="",S()),document.querySelectorAll("footer").forEach(m=>m.style.display="none");const t=document.getElementById("searchModal");t&&t.classList.remove("active"),D("mylist");const s=window.historyService?window.historyService.getFavorites():[];n.videoGrid.innerHTML="",n.videoGrid.className="mobile-mylist-view min-h-screen bg-background-dark pb-24";const r=`
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
    `;n.videoGrid.innerHTML=r;const i=document.getElementById("mylistGrid");if(s.length>0)s.forEach(m=>{const a=document.createElement("div");a.className="group relative flex flex-col gap-2 cursor-pointer",a.innerHTML=`
                <div class="relative w-full overflow-hidden rounded-md bg-surface-dark shadow-md aspect-[2/3]">
                    <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                         style='background-image: url("${m.thumbnail||m.poster_url}");'></div>
                    <div class="absolute inset-0 bg-black/0 transition-colors group-active:bg-black/20"></div>
                </div>
            `,a.addEventListener("click",()=>L(m)),i.appendChild(a)});else try{const m=await k.getRophimCatalog({category:"trending",limit:12});m&&m.movies&&m.movies.forEach((a,o)=>{const u=document.createElement("div");u.className="group relative flex flex-col gap-2 cursor-pointer",u.innerHTML=`
                        <div class="relative w-full overflow-hidden rounded-md bg-surface-dark shadow-md aspect-[2/3]">
                            <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                                 style='background-image: url("${a.thumbnail}");'></div>
                            ${o===0?'<div class="absolute top-0 right-0 rounded-bl-md bg-primary px-1.5 py-0.5"><span class="text-[10px] font-bold uppercase text-white tracking-wider">New</span></div>':""}
                            <div class="absolute inset-0 bg-black/0 transition-colors group-active:bg-black/20"></div>
                        </div>
                    `,u.addEventListener("click",()=>L(a)),i.appendChild(u)})}catch(m){console.error("Failed to load my list content",m)}const d=document.querySelectorAll(".mylist-chip");d.forEach(m=>{m.addEventListener("click",async()=>{const a=m.dataset.filter,o=m.dataset.category;if(!a||!o)return;d.forEach(h=>{h.classList.remove("active","bg-white"),h.classList.add("bg-surface-dark");const c=h.querySelector("p");c&&(c.classList.remove("font-bold","text-black"),c.classList.add("font-medium","text-gray-200"))}),m.classList.add("active","bg-white"),m.classList.remove("bg-surface-dark");const u=m.querySelector("p");u&&(u.classList.add("font-bold","text-black"),u.classList.remove("font-medium","text-gray-200"));const l=document.getElementById("mylistGrid");if(l){l.innerHTML='<div class="col-span-3 flex justify-center py-12"><div class="loading-spinner"></div></div>';try{const h=await k.getRophimCatalog({category:o,limit:12});l.innerHTML="",h&&h.movies&&h.movies.length>0?h.movies.forEach((c,f)=>{const g=document.createElement("div");g.className="group relative flex flex-col gap-2 cursor-pointer",g.innerHTML=`
                                <div class="relative w-full overflow-hidden rounded-md bg-surface-dark shadow-md aspect-[2/3]">
                                    <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                                         style='background-image: url("${c.thumbnail}");'></div>
                                    ${f===0?'<div class="absolute top-0 right-0 rounded-bl-md bg-primary px-1.5 py-0.5"><span class="text-[10px] font-bold uppercase text-white tracking-wider">New</span></div>':""}
                                    <div class="absolute inset-0 bg-black/0 transition-colors group-active:bg-black/20"></div>
                                </div>
                            `,g.addEventListener("click",()=>L(c)),l.appendChild(g)}):l.innerHTML='<p class="col-span-3 text-center text-gray-400 py-12">No content found</p>'}catch(h){console.error("Filter error:",h),l.innerHTML='<p class="col-span-3 text-center text-gray-400 py-12">Failed to load content</p>'}}})})}
