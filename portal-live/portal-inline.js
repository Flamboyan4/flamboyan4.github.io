/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/index.html#inline-1",function(__f4){


__f4.globals.tailwind.config = { theme: { extend: { borderRadius: { card: "var(--f4-portal-card-radius,12px)" }, colors: { indigo: {50:"#F7F6FC",100:"#EDEBFA",200:"#DCD8F5",300:"#C3BDF0",400:"#8E82DF",500:"#6558D6",600:"#5145CD",700:"#4539B8",800:"#393099",900:"#302873",950:"#211B50"} } } } };
});

/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/index.html#inline-2",function(__f4){



__f4.globals.document.addEventListener('DOMContentLoaded',()=>{
 const footer=__f4.globals.document.getElementById('pembayaran');
 const floating=__f4.globals.document.getElementById('f4-portal-float-actions');
 if(!footer||!floating)return;
 // Desktop retains the footer lift; mobile uses a fixed dock-safe offset.
 let queued=false;
 const update=()=>{
  queued=false;
  if(__f4.window.matchMedia('(max-width:767px)').matches){floating.style.removeProperty('--f4-footer-lift');return;}
  const top=footer.getBoundingClientRect().top;
  const baseBottom=18;
  const lift=__f4.globals.Math.max(0,__f4.globals.Math.ceil(__f4.window.innerHeight-baseBottom-top+12));
  floating.style.setProperty('--f4-footer-lift',lift+'px');
 };
 const schedule=()=>{if(queued)return;queued=true;(0,__f4.globals.requestAnimationFrame)(update)};
 __f4.window.addEventListener('scroll',schedule,{passive:true});
 __f4.window.addEventListener('resize',schedule,{passive:true});
 update();
});

});

/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/index.html#inline-3",function(__f4){



(function(){
 function alignProject(){
  const image=__f4.globals.document.getElementById('bs-step-img');
  const tag=__f4.globals.document.getElementById('bs-step-tag');
  if(!image||!tag)return;
  const picture=image.parentElement;
  if(!picture||picture.nextElementSibling?.contains(tag))return;
  let badge=tag.parentElement;
  if(badge?.children.length!==1){
   badge=__f4.globals.document.createElement('div');
   badge.className='flex justify-start mb-1.5';
   badge.appendChild(tag);
  }
  picture.after(badge);
  picture.classList.add('mb-2');
 }
 if(__f4.globals.document.readyState==='loading')__f4.globals.document.addEventListener('DOMContentLoaded',alignProject,{once:true});
 else alignProject();
})();

});
