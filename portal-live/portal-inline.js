/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/index.html#inline-1",function(__f4){


__f4.globals.tailwind.config = { theme: { extend: { borderRadius: { card: "var(--f4-portal-card-radius,12px)" }, colors: { indigo: {50:"#F7F6FC",100:"#EDEBFA",200:"#DCD8F5",300:"#C3BDF0",400:"#8E82DF",500:"#6558D6",600:"#5145CD",700:"#4539B8",800:"#393099",900:"#302873",950:"#211B50"} } } } };
});

/* Original portal source; mount-scoped bindings and resource access. */
window.F4PortalRuntime.define("/index.html#inline-2",function(__f4){



/* Payment shortcut no longer follows a footer. */


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
