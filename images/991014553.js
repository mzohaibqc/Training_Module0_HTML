/* Unknown-Branch 14.11.24-1102-1102 (2014-11-24 19:02:36 GMT) */

rsinetsegs=['E05516_14858','E05516_12352','E05516_13926','E05516_12504','E05516_14066','E05516_14245','E05516_50170','E05516_14596','E05516_14644','E05516_14664','E05516_14698','E05516_14702','E05516_50449','E05516_13825','E05516_14945','E05516_50264','E05516_50937','E05516_0'];
var rsiExp=new Date((new Date()).getTime()+2419200000);
var rsiSegs="";
var rsiPat=/.*_5.*/;
var rsiPat2=/([^_]{2})[^_]*_(.*)/;
var i=0;
for(x=0;x<rsinetsegs.length&&i<100;++x){if(!rsiPat.test(rsinetsegs[x])){var f=rsiPat2.exec(rsinetsegs[x]);if(f!=null){rsiSegs+=f[1]+f[2];++i;}}}
document.cookie="rsi_segs="+(rsiSegs.length>0?rsiSegs:"")+";expires="+rsiExp.toGMTString()+";path=/;domain=.theguardian.com";
if(typeof(DM_onSegsAvailable)=="function"){DM_onSegsAvailable(['E05516_14858','E05516_12352','E05516_13926','E05516_12504','E05516_14066','E05516_14245','E05516_50170','E05516_14596','E05516_14644','E05516_14664','E05516_14698','E05516_14702','E05516_50449','E05516_13825','E05516_14945','E05516_50264','E05516_50937','E05516_0'],'e05516');} 