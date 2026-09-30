/* PermitTrack monitoring sample. Change APP_NAME to rename the product.
   Separate storage version preserves the former prototype without importing its concepts. */
const APP_NAME = 'PermitTrack';
const STORAGE_KEY = 'permittrack-monitoring-v3';
const SESSION_KEY = 'permittrack-session-v1';
const localDay = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const isoDate = (offset = 0) => { const d=new Date(); d.setDate(d.getDate()+offset); return localDay(d); };
const monthDate = (offset, day=12) => { const d=new Date(); d.setDate(1); d.setMonth(d.getMonth()+offset); d.setDate(day); return localDay(d); };
function seedMonitoring(){
  const cities=[
    {id:'c1',name:'Jakarta Selatan',province:'DKI Jakarta',aliases:['Jaksel'],active:true},
    {id:'c2',name:'Jakarta Timur',province:'DKI Jakarta',aliases:['Jaktim'],active:true},
    {id:'c3',name:'Tangerang Selatan',province:'Banten',aliases:['Tangsel'],active:true},
    {id:'c4',name:'Bandung',province:'Jawa Barat',aliases:['Kota Bandung'],active:true},
    {id:'c5',name:'Bogor',province:'Jawa Barat',aliases:['Kota Bogor'],active:true}
  ];
  const names=['Arga Mahendra','Nara Kirana','Dimas Wicaksana','Alina Prameswari','Bagas Adinata','Tara Maheswari','Raka Pradipta','Mira Anindya','Galih Wiratama','Laras Danastri','Reza Andaru','Sekar Amara'];
  const borrowers=names.map((name,i)=>({id:`b${i+1}`,code:`PJM-SMP-${String(i+1).padStart(3,'0')}`,name,cityId:cities[i%5].id,address:`Jl. Taman Contoh No. ${i+10}, Blok ${String.fromCharCode(65+i)}, ${cities[i%5].name}`,occupation:i%3?'Swasta':'Profesional',position:['Konsultan','Manajer Operasional','Wiraswasta'][i%3],active:i<10,photoId:null}));
  const types=[{id:'t1',name:'Pistol',category:'Peluru tajam'},{id:'t2',name:'Revolver',category:'Peluru tajam'},{id:'t3',name:'Pistol',category:'Peluru karet'},{id:'t4',name:'Revolver',category:'Peluru karet'}];
  const locations=[{id:'l1',name:'Gudang Cakra',code:'GD-C01',cityId:'c1',kind:'Gudang',address:'Kompleks Simulasi Cakra, Blok A',active:true},{id:'l2',name:'Gudang Mentari',code:'GD-M02',cityId:'c3',kind:'Gudang',address:'Kompleks Simulasi Mentari, Blok B',active:true},{id:'l3',name:'Lokasi Puspa',code:'LK-P03',cityId:'c4',kind:'Lokasi pencatatan',address:'Jl. Simulasi Puspa No. 8',active:true}];
  const assets=Array.from({length:18},(_,i)=>({id:`a${i+1}`,code:`AST-SMP-${String(i+1).padStart(3,'0')}`,typeId:types[i%4].id,model:['Arunika P-01','Cakra R-02','Sagara K-03','Mentari R-04'][i%4],caliber:i%4<2?'Label .22':'Label 9 mm',serial:`SMP-${String(i+1).padStart(5,'0')}`,locationId:i%3===0?(i%2?'l1':'l2'):i%5===0?'l3':'',photoId:null,notes:'Identitas aset fiktif untuk demonstrasi antarmuka.'}));
  const records=assets.map((a,i)=>({id:`r${i+1}`,number:`REG-SMP-${String(i+1).padStart(4,'0')}`,sourceNo:String(i+1),sourceYear:new Date().getFullYear(),takah:`ARS-SMP-${100+i}`,borrowerId:borrowers[i%12].id,assetId:a.id,cityId:borrowers[i%12].cityId,jurisdiction:`Wilayah ${cities[i%5].name}`,rawStatus:a.locationId&&a.locationId!=='l3'?'TERCATAT DI GUDANG':i%4===1?'BELUM DIPERPANJANG':'SUDAH DIPERPANJANG',notes:'Data simulasi monitoring. Dokumen berasal dari sistem eksternal; tidak diterbitkan melalui aplikasi ini.',importedAt:monthDate(-Math.floor((17-i)/3),Math.min(8+i,new Date().getDate())),updatedAt:isoDate(-i),batchId:'batch-sampel',sourceKey:`seed:${i}`,history:[{date:monthDate(-Math.floor((17-i)/3),5),title:'Data eksternal dicatat',actor:'Admin Sistem'},{date:isoDate(-i),title:'Metadata monitoring diperbarui',actor:'Admin Sistem'}]}));
  const documents=records.flatMap((r,i)=>Array.from({length:i%3===0?3:2},(_,j)=>({id:`d${i+1}-${j}`,recordId:r.id,number:`${['KARTU','BUKU','REF'][j]}-SMP/${String(i+1).padStart(3,'0')}/${new Date().getFullYear()}`,kind:['Kartu izin eksternal','Buku register','Referensi tambahan'][j],start:isoDate(-140-i),end:i%7===6?'':isoDate([120,17,-35,80,28,-12][(i+j)%6]),precision:i%7===6?'unknown':'day',expiryRaw:i%7===6?'Belum tercatat':'',lineNo:j+1,source:'Sistem eksternal (arsip eksternal)'})));
  const files=documents.slice(0,4).map((d,i)=>({id:'f'+i,recordId:d.recordId,documentId:d.id,name:`arsip-sampel-${i+1}.pdf`,mime:'application/pdf',size:0,uploadedAt:isoDate(-i),dataUrl:null,metadataOnly:true}));
  return {version:3,users:[{id:'u1',name:'Aditya Pratama',username:'admin',password:'admin123',role:'Admin',active:true},{id:'u2',name:'Nadia Putri',username:'user',password:'user123',role:'User',active:true}],cities,borrowers,types,locations,assets,records,documents,files,batches:[{id:'batch-sampel',name:'Register simulasi awal.xlsx',date:isoDate(-20),total:18,imported:18,updated:0,skipped:0,blocked:0,status:'Selesai'}]};
}
function loadData(){try{const d=JSON.parse(localStorage.getItem(STORAGE_KEY));if(d?.version===3&&['users','cities','borrowers','types','locations','assets','records','documents','files','batches'].every(k=>Array.isArray(d[k])))return d;}catch(e){}return seedMonitoring();}
let db=loadData();
function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(db));return true;}catch(e){alert('Penyimpanan browser penuh/tidak tersedia. Perubahan saat ini hanya tersimpan di memori.');return false;}}
persist();
