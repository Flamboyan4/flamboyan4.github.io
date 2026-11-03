#!/usr/bin/env python3
"""Read-only browser fixture for shared grid across all native portals."""
import asyncio, json, pathlib, subprocess, os, time, re
from playwright.async_api import async_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
BANK_HTML=(ROOT/'bank-sampah/index.html').read_text(encoding='utf-8')
PICKER_STYLE=re.search(r'<style id="f4-bank-member-search-style">([\s\S]*?)</style>',BANK_HTML)
assert PICKER_STYLE,'Bank Sampah custom warga picker stylesheet missing'
PAGES=['/','/bank-sampah/','/pembukuan/','/superadmin/','/rapat/','/dokumentasi/']
SIZES=[('pc',1440,900,3,4),('tablet',900,900,2,2),('hp',390,844,1,2)]
async def main():
    proc=subprocess.Popen(['python3','-m','http.server','8765','--bind','127.0.0.1'],
        cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    results=[]
    try:
        await asyncio.sleep(1)
        async with async_playwright() as p:
            browser=await p.chromium.launch(args=['--no-sandbox'])
            for path in PAGES:
                for name,width,height,expected3,expected4 in SIZES:
                    context=await browser.new_context(viewport={'width':width,'height':height})
                    await context.route('https://api.flamboyan4.web.id/**',
                        lambda route: route.fulfill(status=401,content_type='application/json',
                            body='{"ok":false,"error":"QA tanpa sesi"}'))
                    page=await context.new_page()
                    try:
                        response=await page.goto('http://127.0.0.1:8765'+path,
                            wait_until='domcontentloaded',timeout=30000)
                        state=await page.evaluate("""() => {
                            const sample=(cols,n)=>{
                                const root=document.createElement('section');
                                root.className='f4-grid';root.dataset.cols=String(cols);
                                root.style.width='min(100%,960px)';
                                for(let i=0;i<n;i++){
                                  const x=document.createElement('div');
                                  x.textContent='Kartu '+(i+1);x.style.minHeight='40px';
                                  root.append(x);
                                }
                                document.documentElement.append(root);
                                const computed=getComputedStyle(root);
                                const r=root.getBoundingClientRect();
                                const children=[...root.children].map(x=>x.getBoundingClientRect());
                                const result={columns:computed.gridTemplateColumns.split(' ').filter(Boolean).length,
                                  tracks:computed.gridTemplateColumns,
                                  matched:root.matches('.f4-grid[data-cols="'+cols+'"]'),
                                  custom:computed.getPropertyValue('--f4-grid-cols').trim(),
                                  display:computed.display,
                                  fits:children.every(x=>x.left>=r.left-2&&x.right<=r.right+2),
                                  width:r.width};
                                root.remove();return result;
                            };
                            const controls=()=>{
                              const root=document.createElement('div');
                              root.className='f4-controls';
                              root.style.cssText='position:fixed;top:5px;left:5px;width:min(800px,calc(100vw - 10px));visibility:hidden';
                              root.innerHTML='<input type="text" aria-label="Nama"><select aria-label="Periode"><option>November</option></select><button type="button">Muat</button>';
                              document.documentElement.append(root);
                              const boxes=[...root.children].map(e=>e.getBoundingClientRect());
                              const heights=boxes.map(r=>r.height);
                              const centers=boxes.map(r=>(r.top+r.bottom)/2);
                              const ok=heights.every(n=>Math.abs(n-42)<=1)&&
                                Math.max(...centers)-Math.min(...centers)<=1;
                              root.remove();return {ok,heights,centers};
                            };
                            return {grid3:sample(3,3),grid4:sample(4,4),controls:controls(),
                              stylesheet:[...document.styleSheets].some(x=>
                                String(x.href||'').includes('direct-shell.css'))};
                        }""")
                        good=(response is not None and response.status==200 and
                            state['stylesheet'] and state['grid3']['columns']==expected3 and
                            state['grid4']['columns']==expected4 and
                            state['grid3']['fits'] and state['grid4']['fits'] and state['controls']['ok'])
                        results.append({'page':path,'size':name,'passed':good,
                            'grid3':state['grid3']['columns'],'grid4':state['grid4']['columns'],
                            'control_heights':state['controls']['heights'],'controls_aligned':state['controls']['ok'],
                            'grid3_debug':state['grid3'] if not good else None,
                            'grid4_debug':state['grid4'] if not good else None})
                    except Exception as e:
                        results.append({'page':path,'size':name,'passed':False,
                                        'error':str(e)[:250]})
                    finally:
                        await context.close()
            # Read-only Setoran/Penjualan fixture: test the actual bank stylesheet,
            # no account, backend, transaction, or personal data needed.
            for name,width,height,_,_ in SIZES+[('pc-1366',1366,768,3,4)]:
                context=await browser.new_context(viewport={'width':width,'height':height})
                page=await context.new_page()
                try:
                    response=await page.goto(
                        'http://127.0.0.1:8765/qa/fixtures/bank-entry-grid.html',
                        wait_until='load',timeout=30000)
                    await page.add_style_tag(content=PICKER_STYLE.group(1))
                    state=await page.evaluate("""() => {
                        const rect=el=>{const r=el.getBoundingClientRect();
                            return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,
                                width:r.width,height:r.height}};
                        const one=sel=>rect(document.querySelector(sel));
                        const many=sel=>[...document.querySelectorAll(sel)].map(rect);
                        const columns=sel=>getComputedStyle(document.querySelector(sel))
                            .gridTemplateColumns.trim().split(/\s+/).length;
                        const sameTop=arr=>Math.max(...arr.map(x=>x.top))-
                            Math.min(...arr.map(x=>x.top))<=2;
                        const sameWidths=arr=>Math.max(...arr.map(x=>x.width))-
                            Math.min(...arr.map(x=>x.width))<=2;
                        const stack=arr=>arr.slice(1).every((r,i)=>r.top>=arr[i].bottom-2);
                        const outer=(inner,root)=>Math.abs(inner.left-root.left)<=2 &&
                            Math.abs(inner.right-root.right)<=2;
                        const bounds=sel=>{
                            const outer=document.querySelector(sel);
                            const box=outer.getBoundingClientRect();
                            return [...outer.children].every(el=>{
                                const r=el.getBoundingClientRect();
                                return r.width>0&&r.left>=box.left-2&&r.right<=box.right+2;
                            });
                        };
                        const deposit=one('#setoranForm .f4-entry-top-fields'),
                            sale=one('#saleForm .f4-sale-top-fields'),
                            payment=many('#saleForm .f4-sale-payment-fields>.field'),
                            topDeposit=many('#setoranForm .f4-entry-top-fields>.field'),
                            topSale=many('#saleForm .f4-sale-top-fields>.field'),
                            summary=one('#saleForm .f4-sale-main>.summary-box'),
                            saleForm=one('#saleForm'),
                            depositForm=one('#setoranForm');
                        const w=window.innerWidth;
                        const topDepositOk=topDeposit.length===2 &&
                            (w<=600?stack(topDeposit):sameTop(topDeposit)&&sameWidths(topDeposit));
                        const topSaleOk=topSale.length===3 &&
                            (w<=600?stack(topSale):
                             topSale[1].top>=topSale[0].bottom-2&&
                             sameTop(topSale.slice(1))&&sameWidths(topSale.slice(1))&&
                             Math.abs(topSale[0].width-sale.width)<=2);
                        const paymentsOk=payment.length===2 &&
                          (w<=680?stack(payment):
                           sameTop(payment)&&sameWidths(payment)&&payment[0].right<=payment[1].left+2);
                        const setMain=one('#setoranForm .f4-setoran-main'),
                            setSide=one('#setoranForm .f4-setoran-side'),
                            saleMain=one('#saleForm .f4-sale-main'),
                            saleSide=one('#saleForm .f4-sale-side');
                        const layoutOk=[depositForm,saleForm,deposit,sale,summary,setMain,setSide,saleMain,saleSide]
                            .every(x=>x.width>0)&&
                            (w>=1024?
                             deposit.left>=setSide.left-2 && deposit.right<=setSide.right+2 &&
                             sale.left>=saleSide.left-2 && sale.right<=saleSide.right+2 &&
                             setMain.right<setSide.left && saleMain.right<saleSide.left &&
                             summary.right<saleForm.right-100:
                             outer(deposit,depositForm)&&outer(sale,saleForm)&&
                             summary.left>=saleForm.left-2&&summary.right<=saleForm.right+2)&&
                            bounds('#setBarang .f4-compact-row')&&
                            bounds('#saleItems .f4-compact-row');
                        const gridOk=['#setoranForm .f4-entry-top-fields',
                            '#saleForm .f4-sale-top-fields'].every(x=>columns(x)===12) &&
                            columns('#saleForm')===(w>=1024?2:12) &&
                            columns('#setoranForm')===(w>=1024?2:12);
                        const responsiveOk=document.documentElement.scrollWidth<=w+2;
                        const close=(a,b)=>Math.abs(a-b)<=2;
                        const saleRow=one('#saleItems .f4-compact-sale-row');
                        const setRow=one('#setBarang .f4-compact-row');
                        const saleParts=[
                          one('#saleItems .f4-compact-sale-row>select'),
                          one('#saleItems .f4-compact-sale-row>input'),
                          one('#saleItems .f4-compact-sale-row>.f4-compact-entry-group')
                        ];
                        const depositParts=[
                          one('#setBarang .f4-compact-row>select'),
                          one('#setBarang .f4-compact-row>.f4-compact-entry-group')
                        ];
                        const price=one('#saleItems .f4-compact-entry-group>input');
                        const deleteButton=one('#saleItems .f4-compact-entry-group>button');
                        const note=many('#saleForm .f4-sale-note-fields>.field');
                        const baseLineOk=close(saleRow.left,one('#saleForm .f4-entry-goods-heading').left)&&
                          close(note[0].left,payment[0].left)&&
                          (w<1024||close(topSale[0].left,payment[0].left));
                        const saleVerticalOk=w<=680 || (
                          sameTop(payment) &&
                          close(one('#saleReceived').top,one('#saleStatus').top)
                        );
                        const paymentOrderOk=!!document.querySelector(
                          '#saleForm .f4-sale-payment-fields>.field:first-child #saleReceived') &&
                          !!document.querySelector(
                          '#saleForm .f4-sale-payment-fields>.field:last-child #saleStatus') &&
                          (w<=680?payment[1].top>=payment[0].bottom-2:payment[0].right<=payment[1].left+2);
                        const noteBefore=one('#saleProof').top;
                        const rows=document.querySelector('#saleItems .f4-compact-rows');
                        const extra=saleRow && document.querySelector('#saleItems .f4-compact-sale-row')?.cloneNode(true);
                        if(extra)rows.append(extra);
                        const noteAfter=one('#saleProof').top;
                        if(extra)extra.remove();
                        const independentNotesOk=w<1024||close(noteBefore,noteAfter);
                        const priorityOk=columns('#saleForm')===(w>=1024?2:12) &&
                          getComputedStyle(document.querySelector('#saleForm .f4-sale-main>.summary-box')).display==='grid' &&
                          getComputedStyle(document.querySelector('#setoranForm .f4-setoran-side>.summary-box')).display==='grid';
                        const deleteOk=price.right<=deleteButton.left-5 &&
                          deleteButton.right<=saleRow.right+2 &&
                          setRow.right>=depositParts[1].right-2;
                        const controlHeights=[
                          one('#setoranForm .f4-warga-picker-open'),one('#setDate'),one('#saleBatch'),
                          one('#saleDate'),one('#saleLapak')
                        ];
                        const nativeSelect=one('#setWarga');
                        const hiddenSelectStyle=getComputedStyle(document.querySelector('#setWarga'));
                        const customPickerOk=hiddenSelectStyle.position==='absolute' &&
                          hiddenSelectStyle.opacity==='0' &&
                          hiddenSelectStyle.pointerEvents==='none' &&
                          Math.abs(controlHeights[0].height-controlHeights[1].height)<=1;
                        const entryControlsOk=customPickerOk &&
                          controlHeights.every(r=>Math.abs(r.height-42)<=1) &&
                          (w<=600 || Math.abs(controlHeights[0].top-controlHeights[1].top)<=1) &&
                          (w<=600 || (close(controlHeights[3].top,controlHeights[4].top) &&
                           controlHeights[3].top>=controlHeights[2].bottom-2));
                        const ownDate=one('#f4BankOwnDate'),ownMoney=one('#f4BankOwnAmount'),
                            ownDateLabel=one('.f4-bank-own-fields>.f4-bank-own-field:first-child>span'),
                            ownMoneyLabel=one('.f4-bank-own-fields>.f4-bank-own-field:last-child>span');
                        const ownFieldsOk=close(ownDate.height,ownMoney.height) &&
                          close(ownDate.height,42) &&
                          ownMoney.top>=ownDate.bottom+8 &&
                          close(ownDate.top-ownDateLabel.top,
                                ownMoney.top-ownMoneyLabel.top);
                        const unframedOk=['#pageSetoran','#pagePenjualan'].every(sel=>{
                          const css=getComputedStyle(document.querySelector(sel));
                          return css.borderTopWidth==='0px' && css.boxShadow==='none' &&
                            css.backgroundColor==='rgba(0, 0, 0, 0)';
                        });
                        const desktopPanelOk=w<1024||(
                          saleRow.right<saleSide.left &&
                          close(payment[1].right,saleForm.right) &&
                          close(summary.left,saleRow.left) &&
                          summary.right<saleForm.right-100 &&
                          close(one('#saleForm .f4-sale-side>button').left,payment[0].left)
                        );
                        const proof=one('#saleProof'),reason=one('#saleReason'),
                            proofLabel=one('label[for="saleProof"]'),
                            reasonLabel=one('label[for="saleReason"]');
                        const noteFieldsOk=Math.abs(proof.height-42)<=1 &&
                          Math.abs(reason.height-42)<=1 &&
                          (w<=680?reason.top>=proof.bottom:
                            Math.abs(proof.top-reason.top)<=1 &&
                            Math.abs(proofLabel.top-reasonLabel.top)<=1);
                        const heading=one('#saleForm .f4-entry-goods-heading h3');
                        const addKind=one('#saleForm .f4-entry-goods-heading button');
                        const paymentLabel=one('label[for="saleStatus"]');
                        const paymentSelect=one('#saleStatus');
                        const receivedControl=one('#saleReceived');
                        const goodsControl=one('#saleItems .f4-compact-sale-row>select');
                        const desktopAlignmentOk=w<1024||(
                          close((heading.top+heading.bottom)/2,(addKind.top+addKind.bottom)/2) &&
                          close(saleMain.top,sale.top) && close(setMain.top,deposit.top) &&
                          close(payment[0].top,payment[1].top)
                        );
                        const ownMain=one('#f4BankOwnDepositForm .f4-bank-own-main'),
                            ownSide=one('#f4BankOwnDepositForm .f4-bank-own-side');
                        const gridDividerOk=w<1024||(
                          close(setMain.width,setSide.width)&&
                          close(saleMain.width,saleSide.width)&&
                          close(ownMain.width,ownSide.width)&&
                          close(setMain.left,saleMain.left)&&
                          close(setSide.left,saleSide.left)&&
                          close(ownSide.left,setSide.left)&&
                          close(setMain.right,saleMain.right)&&
                          close(setSide.right,saleSide.right)
                        );
                        return {gridOk,topDepositOk,topSaleOk,paymentsOk,layoutOk,responsiveOk,
                            baseLineOk,saleVerticalOk,paymentOrderOk,gridDividerOk,independentNotesOk,priorityOk,deleteOk,entryControlsOk,noteFieldsOk,
                            desktopAlignmentOk,heading,addKind,paymentLabel,paymentSelect,
                            goodsControl,receivedControl,ownFieldsOk,unframedOk,desktopPanelOk,ownDate,ownMoney,
                            saleFormBounds:one('#saleForm'),
                            submitBounds:one('#saleForm .f4-sale-side>button[type=submit]'),
                            controlHeights,customPickerOk,nativeSelect,proof,reason,proofLabel,reasonLabel,
                            topDeposit,topSale,payment,summary,
                            saleParts,depositParts,note,viewport:w};
                    }""")
                    good=(response is not None and response.status==200 and
                          all(state[key] for key in
                              ('gridOk','topDepositOk','topSaleOk','paymentsOk',
                               'layoutOk','responsiveOk','baseLineOk',
                               'priorityOk','deleteOk','entryControlsOk','noteFieldsOk',
                               'independentNotesOk','saleVerticalOk','paymentOrderOk','gridDividerOk',
                               'ownFieldsOk','unframedOk','desktopPanelOk',
                               'desktopAlignmentOk')))
                    results.append({'page':'/qa/fixtures/bank-entry-grid.html',
                        'size':name,'passed':good,**state})
                except Exception as e:
                    results.append({'page':'/qa/fixtures/bank-entry-grid.html',
                        'size':name,'passed':False,'error':str(e)[:250]})
                finally:
                    await context.close()
            # Dashboard redesign: validate geometry, tabs and access on three viewports.
            for name,width,height,_,_ in SIZES:
                context=await browser.new_context(viewport={'width':width,'height':height})
                page=await context.new_page()
                try:
                    response=await page.goto(
                        'http://127.0.0.1:8765/qa/fixtures/bank-admin-operational.html',
                        wait_until='load',timeout=30000)
                    state=await page.evaluate("""() => {
                        const rect=el=>{const r=el.getBoundingClientRect();
                            return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom}};
                        const get=id=>document.getElementById(id);
                        const a=rect(get('f4BankAdminOperations')),
                              hero=rect(get('f4BankAppAdminHero')),
                              mini=rect(get('f4BankAppMinis')),
                              follow=rect(get('f4BankAdminNext')),
                              recent=rect(document.querySelector('#f4BankAppHome>.v14-panel')),
                              tabs=get('v16Tabs'), quick=get('f4BankAdminShortcuts'),
                              home=get('f4BankAppHome');
                        const buttons=[...get('f4BankAdminOperations').children].map(rect);
                        const same=(x,y)=>Math.abs(x-y)<=2;
                        const desktop=window.innerWidth>=1024;
                        const small=window.innerWidth<=420;
                        const cardOk=buttons.length===2&&buttons.every(x=>x.w>100) &&
                            (small?buttons[1].y>=buttons[0].bottom:
                              same(buttons[0].y,buttons[1].y)&&same(buttons[0].h,buttons[1].h));
                        const actions=[...get('f4BankAdminOperations').children];
                        const focalOk=actions.every(b=>{
                            const svg=b.querySelector('.f4-bank-admin-operation-icon svg');
                            const title=b.querySelector('.f4-bank-admin-operation-copy strong');
                            const detail=b.querySelector('.f4-bank-admin-operation-copy small');
                            return !!svg&&!!title&&!!detail&&rect(svg).w>=20&&
                              b.querySelector('.f4-bank-admin-operation-arrow')!==null;
                        }) && getComputedStyle(actions[0]).backgroundImage.includes('gradient') &&
                             rect(actions[0]).h>=76;
                        const grouped=desktop?
                            (same(hero.y,mini.y)&&same(follow.y,recent.y) &&
                             same(a.x,hero.x)&&
                             getComputedStyle(quick).display==='none'):
                            (hero.y>=a.bottom-2&&follow.y>=mini.bottom-2&&
                             getComputedStyle(quick).display!=='none'&&
                             getComputedStyle(tabs).display==='flex'&&
                             tabs.scrollWidth>=tabs.clientWidth);
                        const areas=getComputedStyle(home).gridTemplateAreas;
                        const owners=desktop?areas.includes('"intro intro intro intro"') &&
                            areas.includes('"next next recent recent"'):true;
                        const overflow=document.documentElement.scrollWidth>window.innerWidth+2;
                        return {desktop,cardOk,focalOk,grouped,owners,overflow,
                          actions:a,hero,mini,follow,recent,
                          nav:{width:tabs.clientWidth,scrollWidth:tabs.scrollWidth},
                          areas};
                    }""")
                    good=(response is not None and response.status==200 and
                          state['cardOk'] and state['focalOk'] and state['grouped'] and state['owners'] and
                          not state['overflow'])
                    results.append({'page':'/qa/fixtures/bank-admin-operational.html',
                        'size':name,'passed':good,**state})
                except Exception as e:
                    results.append({'page':'/qa/fixtures/bank-admin-operational.html',
                        'size':name,'passed':False,'error':str(e)[:250]})
                finally:
                    await context.close()
            await browser.close()
    finally:
        proc.terminate()
        try:proc.wait(timeout=5)
        except subprocess.TimeoutExpired:proc.kill()
    target=ROOT/'ops-audit/unified-grid-smoke.json'
    target.parent.mkdir(exist_ok=True)
    target.write_text(json.dumps(results,indent=2))
    for x in results:print(x)
    count=sum(x['passed'] for x in results)
    print('UNIFIED_GRID_BROWSER_PASS='+str(count)+'/'+str(len(results)))
    if count!=len(results):raise SystemExit(1)
asyncio.run(main())
