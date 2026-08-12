document.getElementById("menuBtn")?.addEventListener("click",()=>document.getElementById("navLinks")?.classList.toggle("open"));
let lang="np";document.getElementById("langBtn")?.addEventListener("click",()=>{lang=lang==="np"?"en":"np";document.getElementById("langBtn").textContent=lang==="np"?"English":"नेपाली";});
document.getElementById("loginForm")?.addEventListener("submit",e=>{e.preventDefault();document.getElementById("loginMsg").textContent=" Demo UI मात्र हो — production backend/ERP API जोडिएपछि वास्तविक login सञ्चालन हुनेछ।";});
/* ===== Phase 2 continuation: homepage slider + Admin photo manager ===== */
(function(){
  const PHOTO_PREFIX = "bnc_photo_";
  const sliderKeys = ["bnc_slider_0","bnc_slider_1","bnc_slider_2"];

  function compressImage(file, maxW=1200, quality=.78){
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>{
        const img=new Image();
        img.onload=()=>{
          const scale=Math.min(1,maxW/img.width);
          const c=document.createElement("canvas");
          c.width=Math.round(img.width*scale); c.height=Math.round(img.height*scale);
          const ctx=c.getContext("2d"); ctx.drawImage(img,0,0,c.width,c.height);
          resolve(c.toDataURL("image/jpeg",quality));
        };
        img.onerror=reject; img.src=reader.result;
      };
      reader.onerror=reject; reader.readAsDataURL(file);
    });
  }
  function save(key,data){ try{localStorage.setItem(key,data); return true}catch(e){alert("Photo storage भरियो। कम size को photo प्रयोग गर्नुहोस्।");return false;} }
  function get(key){return localStorage.getItem(key)}

  // Homepage slider: uploaded slider images override the default event photos.
  const slides=document.querySelectorAll(".hero-slide");
  if(slides.length){
    slides.forEach((s,i)=>{const saved=get(sliderKeys[i]); if(saved) s.style.backgroundImage=`url("${saved}")`;});
    const dots=[...document.querySelectorAll("#heroDots button")];
    let current=0, timer;
    function show(i){
      current=(i+slides.length)%slides.length;
      slides.forEach((s,n)=>s.classList.toggle("active",n===current));
      dots.forEach((d,n)=>d.classList.toggle("active",n===current));
    }
    function restart(){clearInterval(timer);timer=setInterval(()=>show(current+1),5000)}
    document.getElementById("heroNext")?.addEventListener("click",()=>{show(current+1);restart()});
    document.getElementById("heroPrev")?.addEventListener("click",()=>{show(current-1);restart()});
    dots.forEach(d=>d.addEventListener("click",()=>{show(Number(d.dataset.slide));restart()}));
    restart();
  }

  const boardNames = [
    ["Amrita Koirala","Vice Chairperson"],["Ashmita Lama","Secretary"],["Shanti Khatri","Treasurer"],
    ["Rupa Lama","Board Member"],["Durga Dahal","Board Member"],["Indhira Thapa Mahat","Board Member"],
    ["Anita Magar","Board Member"],["Uma Mahat","Board Member"],["Nisha Tamang","Board Member"],["Saru Ghale","Board Member"]
  ];
  const staffNames = [
    ["Birendra Shrestha","Manager"],["Harindra Shrestha","Branch Manager — Saraswati Branch"],["Durpada Karki","Branch Manager — Kalika Branch"],
    ["Ishwor Phuyal","Branch Manager — Kalyankari Branch"],["Nitesh Koirala","Administration Officer — Main Branch"],
    ["Vidhya Lama","Loan Officer — Main Branch"],["Mina Lama","Savings Officer — Main Branch"],["Srijana Dahal","Member Support — Main Branch"],
    ["Saraswati Koirala","Loan Officer — Kalika Branch"],["Laxmi Khadka","Member Support — Kalika Branch"],
    ["Saradha Shrestha","Loan Officer — Saraswati Branch"],["Shirijala Tamang","Member Support — Kalyankari Branch"]
  ];
  function keyFor(name){return PHOTO_PREFIX+name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}

  function renderUploadList(id,arr){
    const box=document.getElementById(id); if(!box)return;
    box.innerHTML=arr.map(([name,role])=>{
      const k=keyFor(name), saved=get(k);
      return `<div class="admin-person-row"><strong>${name}<br><small>${role}</small></strong>
        <input type="file" accept="image/*" data-person-upload="${k}" data-person-name="${name}">
        ${saved?'<span style="color:var(--green);font-size:11px">✓ Photo uploaded</span>':''}</div>`;
    }).join("");
    box.querySelectorAll("[data-person-upload]").forEach(input=>{
      input.addEventListener("change",async()=>{
        if(!input.files[0])return;
        const data=await compressImage(input.files[0],900,.78);
        if(save(input.dataset.personUpload,data)){
          input.parentElement.querySelector("span")?.remove();
          const s=document.createElement("span");s.style="color:var(--green);font-size:11px";s.textContent="✓ Photo uploaded";
          input.parentElement.appendChild(s);
          document.getElementById("adminMsg").textContent=" Photo saved successfully.";
        }
      });
    });
  }

  // Leadership page: show uploaded photos.
  document.querySelectorAll(".person-card").forEach(card=>{
    const saved=get(keyFor(card.dataset.personName));
    if(saved){
      const holder=card.querySelector(".person-photo");
      if(holder) holder.innerHTML=`<img src="${saved}" alt="${card.dataset.personName}">`;
    }
  });

  // Admin page.
  if(document.getElementById("boardUploadList")){
    renderUploadList("boardUploadList",boardNames);
    renderUploadList("staffUploadList",staffNames);
    const preview=document.getElementById("sliderPreview");
    function renderSliderPreview(){
      preview.innerHTML=sliderKeys.map((k,i)=>{
        const d=get(k);
        return `<div>${d?`<img src="${d}" alt="Slide ${i+1}">`:`<div class="person-photo">Slide ${i+1}</div>`}</div>`;
      }).join("");
    }
    renderSliderPreview();
    document.querySelectorAll("[data-upload-slider]").forEach(input=>{
      input.addEventListener("change",async()=>{
        if(!input.files[0])return;
        const data=await compressImage(input.files[0],1400,.78);
        save(sliderKeys[Number(input.dataset.uploadSlider)],data);
        renderSliderPreview();
        document.getElementById("adminMsg").textContent=" Slider photo saved. Homepage मा refresh गरेपछि देखिन्छ।";
      });
    });
    document.getElementById("clearPhotos")?.addEventListener("click",()=>{
      if(confirm("सबै uploaded photos हटाउने?")){
        [...sliderKeys,...boardNames.map(x=>keyFor(x[0])),...staffNames.map(x=>keyFor(x[0]))].forEach(k=>localStorage.removeItem(k));
        location.reload();
      }
    });
  }
})();

/* ===== Real Admin Login Gate + CMS-style management ===== */
(function(){
 const authKey="bnc_admin_auth";
 const noticeKey="bnc_notices";
 const galleryKey="bnc_gallery";
 const settingsKey="bnc_settings";
 const USER="admin", PASS="admin123";

 const loginForm=document.getElementById("adminLoginForm");
 if(loginForm){
   loginForm.addEventListener("submit",e=>{
     e.preventDefault();
     const u=document.getElementById("adminUser").value.trim();
     const p=document.getElementById("adminPass").value;
     const msg=document.getElementById("adminLoginMsg");
     if(u===USER && p===PASS){sessionStorage.setItem(authKey,"1");location.href="admin.html";}
     else msg.textContent="Username वा password मिलेन।";
   });
 }
 if(location.pathname.endsWith("/admin.html") || location.pathname.endsWith("admin.html")){
   if(sessionStorage.getItem(authKey)!=="1"){location.href="admin-login.html";return;}
   document.getElementById("adminWelcome")?.append("Logged in");
   document.getElementById("adminLogout")?.addEventListener("click",()=>{sessionStorage.removeItem(authKey);location.href="admin-login.html";});

   function read(k,def){try{return JSON.parse(localStorage.getItem(k))||def}catch(e){return def}}
   function write(k,v){localStorage.setItem(k,JSON.stringify(v))}

   const notices=read(noticeKey,[]);
   const noticeList=document.getElementById("noticeList");
   function renderNotices(){
     noticeList.innerHTML=notices.map((n,i)=>`<div class="notice-admin"><b>${n.title}</b><span>${n.text}</span><br><button class="small-btn" data-del-notice="${i}">Delete</button></div>`).join("");
     noticeList.querySelectorAll("[data-del-notice]").forEach(b=>b.onclick=()=>{notices.splice(+b.dataset.delNotice,1);write(noticeKey,notices);renderNotices()});
   }
   renderNotices();
   document.getElementById("noticeForm")?.addEventListener("submit",e=>{
     e.preventDefault();notices.unshift({title:document.getElementById("noticeTitle").value,text:document.getElementById("noticeText").value});
     write(noticeKey,notices);e.target.reset();renderNotices();
   });

   const galleryPreview=document.getElementById("galleryAdminPreview");
   let gallery=read(galleryKey,[]);
   function renderGallery(){
     galleryPreview.innerHTML=gallery.map((d,i)=>`<div><img src="${d}"><button data-del-gallery="${i}">×</button></div>`).join("");
     galleryPreview.querySelectorAll("[data-del-gallery]").forEach(b=>b.onclick=()=>{gallery.splice(+b.dataset.delGallery,1);write(galleryKey,gallery);renderGallery()});
   }
   renderGallery();
   document.getElementById("galleryUpload")?.addEventListener("change",async e=>{
     for(const file of e.target.files){const data=await compressImageAdmin(file,1200,.78);gallery.push(data)}
     write(galleryKey,gallery);renderGallery();e.target.value="";
   });

   const savedSettings=read(settingsKey,{phone:"9849343124",email:"bethanchok.narisaccos@gmail.com"});
   document.getElementById("settingPhone").value=savedSettings.phone;
   document.getElementById("settingEmail").value=savedSettings.email;
   document.getElementById("saveSettings")?.addEventListener("click",()=>{
     write(settingsKey,{phone:document.getElementById("settingPhone").value,email:document.getElementById("settingEmail").value});
     document.getElementById("adminMsg").textContent=" Settings saved.";
   });
 }
 function compressImageAdmin(file,maxW=1200,q=.78){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>{const i=new Image();i.onload=()=>{const s=Math.min(1,maxW/i.width),c=document.createElement("canvas");c.width=i.width*s;c.height=i.height*s;c.getContext("2d").drawImage(i,0,0,c.width,c.height);resolve(c.toDataURL("image/jpeg",q))};i.onerror=reject;i.src=r.result};r.onerror=reject;r.readAsDataURL(file)})}
})();

/* ===== V3 SERVER-BACKED ADMIN / MEDIA API ===== */
(function(){
 async function api(url,opt={}) {
   const r=await fetch(url,{credentials:"same-origin",...opt});
   let d={}; try{d=await r.json()}catch{}
   if(!r.ok) throw new Error(d.error||"Request failed");
   return d;
 }
 const login=document.getElementById("adminLoginForm");
 if(login){
   login.addEventListener("submit",async e=>{
     e.preventDefault();
     const msg=document.getElementById("adminLoginMsg");
     try{
       await api("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},
         body:JSON.stringify({username:document.getElementById("adminUser").value,password:document.getElementById("adminPass").value})});
       location.href="admin.html";
     }catch(err){msg.textContent=err.message}
   });
 }
 if(location.pathname.endsWith("admin.html")){
   api("/api/admin/me").then(me=>{
     if(!me.loggedIn) location.href="admin-login.html";
     else initServerAdmin();
   }).catch(()=>location.href="admin-login.html");
 }
 async function initServerAdmin(){
   document.getElementById("adminLogout")?.addEventListener("click",async()=>{await api("/api/admin/logout",{method:"POST"});location.href="admin-login.html"});
   const sliderKeys=["0","1","2"];
   async function uploadFile(file,category,personKey,title){
     const fd=new FormData();fd.append("photo",file);fd.append("category",category);
     if(personKey)fd.append("personKey",personKey);if(title)fd.append("title",title);
     return api("/api/photos",{method:"POST",body:fd});
   }
   document.querySelectorAll("[data-upload-slider]").forEach(input=>{
     input.addEventListener("change",async()=>{
       if(!input.files[0])return;
       const i=input.dataset.uploadSlider;
       try{
         const old=await api("/api/photos?category=slider");
         const same=old.filter(x=>x.person_key===i);
         for(const p of same) await api("/api/photos/"+p.id,{method:"DELETE"});
         await uploadFile(input.files[0],"slider",i,"Homepage Slide "+(Number(i)+1));
         await renderSlider();
         document.getElementById("adminMsg").textContent=" Slider photo permanently uploaded.";
       }catch(e){alert(e.message)}
     });
   });
   async function renderSlider(){
     const box=document.getElementById("sliderPreview"); if(!box)return;
     const rows=await api("/api/photos?category=slider");
     box.innerHTML=[0,1,2].map(i=>{
       const x=rows.find(r=>r.person_key===String(i));
       return x?`<div><img src="${x.url}"><button data-del="${x.id}">×</button></div>`:`<div><div class="person-photo">Slide ${i+1}</div></div>`;
     }).join("");
     box.querySelectorAll("[data-del]").forEach(b=>b.onclick=async()=>{await api("/api/photos/"+b.dataset.del,{method:"DELETE"});renderSlider()});
   }
   await renderSlider();

   const people={
    board:[["Amrita Koirala","Vice Chairperson"],["Ashmita Lama","Secretary"],["Shanti Khatri","Treasurer"],["Rupa Lama","Board Member"],["Durga Dahal","Board Member"],["Indhira Thapa Mahat","Board Member"],["Anita Magar","Board Member"],["Uma Mahat","Board Member"],["Nisha Tamang","Board Member"],["Saru Ghale","Board Member"]],
    staff:[["Birendra Shrestha","Manager"],["Harindra Shrestha","Branch Manager — Saraswati Branch"],["Durpada Karki","Branch Manager — Kalika Branch"],["Ishwor Phuyal","Branch Manager — Kalyankari Branch"],["Nitesh Koirala","Administration Officer — Main Branch"],["Vidhya Lama","Loan Officer — Main Branch"],["Mina Lama","Savings Officer — Main Branch"],["Srijana Dahal","Member Support — Main Branch"],["Saraswati Koirala","Loan Officer — Kalika Branch"],["Laxmi Khadka","Member Support — Kalika Branch"],["Saradha Shrestha","Loan Officer — Saraswati Branch"],["Shirijala Tamang","Member Support — Kalyankari Branch"]]
   };
   const key=n=>n.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
   for(const cat of ["board","staff"]){
     const box=document.getElementById(cat+"UploadList"); if(!box)continue;
     const rows=await api("/api/photos?category="+cat);
     box.innerHTML=people[cat].map(([n,r])=>{
       const x=rows.find(p=>p.person_key===key(n));
       return `<div class="admin-person-row"><strong>${n}<br><small>${r}</small></strong>${x?`<img src="${x.url}" style="width:80px;height:55px;object-fit:cover;border-radius:6px">`:''}<input type="file" accept="image/*" data-person-cat="${cat}" data-person-key="${key(n)}" data-person-name="${n}">${x?`<button class="small-btn" data-person-delete="${x.id}">Delete</button>`:''}</div>`;
     }).join("");
     box.querySelectorAll("[data-person-cat]").forEach(input=>input.addEventListener("change",async()=>{
       if(!input.files[0])return;
       const old=await api("/api/photos?category="+cat);
       for(const p of old.filter(x=>x.person_key===input.dataset.personKey))await api("/api/photos/"+p.id,{method:"DELETE"});
       await uploadFile(input.files[0],cat,input.dataset.personKey,input.dataset.personName);
       initServerAdmin();
     }));
     box.querySelectorAll("[data-person-delete]").forEach(b=>b.onclick=async()=>{await api("/api/photos/"+b.dataset.personDelete,{method:"DELETE"});initServerAdmin()});
   }
   const form=document.getElementById("noticeForm");
   if(form){
     const list=document.getElementById("noticeList");
     async function renderNotices(){
       const rows=await api("/api/notices");
       list.innerHTML=rows.map(x=>`<div class="notice-admin"><b>${x.title}</b><span>${x.body}</span><br><button class="small-btn" data-notice-delete="${x.id}">Delete</button></div>`).join("");
       list.querySelectorAll("[data-notice-delete]").forEach(b=>b.onclick=async()=>{await api("/api/notices/"+b.dataset.noticeDelete,{method:"DELETE"});renderNotices()});
     }
     await renderNotices();
     form.onsubmit=async e=>{e.preventDefault();await api("/api/notices",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:document.getElementById("noticeTitle").value,body:document.getElementById("noticeText").value})});form.reset();renderNotices()};
   }
   document.getElementById("galleryUpload")?.addEventListener("change",async e=>{
     for(const f of e.target.files) await uploadFile(f,"gallery",null,f.name);
     e.target.value="";
     location.reload();
   });
   document.getElementById("saveSettings")?.addEventListener("click",async()=>{
     await api("/api/settings",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:document.getElementById("settingPhone").value,email:document.getElementById("settingEmail").value})});
     document.getElementById("adminMsg").textContent=" Settings permanently saved on server.";
   });
 }
})();

/* Public pages: load server-stored media */
(function(){
 async function get(url){const r=await fetch(url);return r.ok?r.json():[]}
 if(document.querySelector(".person-card")){
   Promise.all([get("/api/photos?category=board"),get("/api/photos?category=staff")]).then(([a,b])=>{
     [...a,...b].forEach(p=>{
       const card=document.querySelector(`.person-card[data-person-key="${p.person_key}"]`);
       if(card){const h=card.querySelector(".person-photo");if(h)h.innerHTML=`<img src="${p.url}" alt="${card.dataset.personName}">`}
     });
   }).catch(()=>{});
 }
 const slides=document.querySelectorAll(".hero-slide");
 if(slides.length){
   get("/api/photos?category=slider").then(rows=>{
     rows.forEach(p=>{const i=Number(p.person_key);if(slides[i])slides[i].style.backgroundImage=`url("${p.url}")`});
   }).catch(()=>{});
 }
})();

/* ===== V3.3 PUBLIC GALLERY + NOTICES ===== */
(function(){
  async function getJSON(url){
    const r=await fetch(url,{cache:"no-store"});
    if(!r.ok) throw new Error("Request failed");
    return r.json();
  }

  // Load permanently uploaded gallery photos into gallery.html.
  const galleryBox=document.getElementById("dynamicGallery");
  if(galleryBox){
    getJSON("/api/photos?category=gallery").then(rows=>{
      if(!rows.length) return;
      galleryBox.innerHTML=rows.map(p=>`
        <figure class="gallery-item">
          <img src="${p.url}" alt="${p.title||"Bethanchok Nari Chetana Gallery"}" loading="lazy">
          ${p.title?`<figcaption>${p.title}</figcaption>`:""}
        </figure>`).join("");
    }).catch(()=>{});
  }

  // Load admin-created notices on the homepage.
  const noticeBox=document.getElementById("publicNoticeList");
  if(noticeBox){
    getJSON("/api/notices").then(rows=>{
      if(!rows.length) return;
      noticeBox.innerHTML=rows.map(n=>`
        <article class="notice">
          <b>${n.title}</b>
          <p>${n.body}</p>
          <small>${new Date(n.created_at).toLocaleDateString("ne-NP")}</small>
        </article>`).join("");
    }).catch(()=>{});
  }

  // Show a live gallery preview in Admin Dashboard.
  const adminGallery=document.getElementById("galleryAdminPreview");
  if(adminGallery){
    getJSON("/api/photos?category=gallery").then(rows=>{
      adminGallery.innerHTML=rows.map(p=>`
        <div class="admin-gallery-item">
          <img src="${p.url}" alt="${p.title||"Gallery"}">
          <button type="button" class="small-btn" data-gallery-delete="${p.id}">Delete</button>
        </div>`).join("");
      adminGallery.querySelectorAll("[data-gallery-delete]").forEach(btn=>{
        btn.addEventListener("click",async()=>{
          await fetch("/api/photos/"+btn.dataset.galleryDelete,{method:"DELETE"});
          location.reload();
        });
      });
    }).catch(()=>{});
  }
})();
