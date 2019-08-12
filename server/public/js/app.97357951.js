(function(t){function e(e){for(var n,s,i=e[0],l=e[1],c=e[2],d=0,f=[];d<i.length;d++)s=i[d],o[s]&&f.push(o[s][0]),o[s]=0;for(n in l)Object.prototype.hasOwnProperty.call(l,n)&&(t[n]=l[n]);u&&u(e);while(f.length)f.shift()();return r.push.apply(r,c||[]),a()}function a(){for(var t,e=0;e<r.length;e++){for(var a=r[e],n=!0,i=1;i<a.length;i++){var l=a[i];0!==o[l]&&(n=!1)}n&&(r.splice(e--,1),t=s(s.s=a[0]))}return t}var n={},o={app:0},r=[];function s(e){if(n[e])return n[e].exports;var a=n[e]={i:e,l:!1,exports:{}};return t[e].call(a.exports,a,a.exports,s),a.l=!0,a.exports}s.m=t,s.c=n,s.d=function(t,e,a){s.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:a})},s.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},s.t=function(t,e){if(1&e&&(t=s(t)),8&e)return t;if(4&e&&"object"===typeof t&&t&&t.__esModule)return t;var a=Object.create(null);if(s.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var n in t)s.d(a,n,function(e){return t[e]}.bind(null,n));return a},s.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return s.d(e,"a",e),e},s.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},s.p="/";var i=window["webpackJsonp"]=window["webpackJsonp"]||[],l=i.push.bind(i);i.push=e,i=i.slice();for(var c=0;c<i.length;c++)e(i[c]);var u=l;r.push([0,"chunk-vendors"]),a()})({0:function(t,e,a){t.exports=a("56d7")},"0267":function(t,e,a){"use strict";a.d(e,"a",function(){return s}),a.d(e,"b",function(){return u});a("ac6a"),a("5df3"),a("4f7f");var n,o=a("bd86"),r=a("7618");function s(t){var e={};for(var a in t)e[a]=c(t[a]);return{fields:e}}var i=(n={},Object(o["a"])(n,Object(r["a"])(0),"numberValue"),Object(o["a"])(n,Object(r["a"])(""),"stringValue"),Object(o["a"])(n,Object(r["a"])(!1),"boolValue"),n),l=new Set(["numberValue","stringValue","boolValue"]);function c(t){var e={};if(null===t)e.kind="nullValue",e.nullValue="NULL_VALUE";else if(t instanceof Array)e.kind="listValue",e.listValue={values:t.map(c)};else if("object"===Object(r["a"])(t))e.kind="structValue",e.structValue=s(t);else if(Object(r["a"])(t)in i){var a=i[Object(r["a"])(t)];e.kind=a,e[a]=t}else console.warn("Unsupported value type ",Object(r["a"])(t));return e}function u(t){if(!t||!t.fields)return{};var e={};for(var a in t.fields)e[a]=d(t.fields[a]);return e}function d(t){return t&&t.kind?l.has(t.kind)?t[t.kind]:"nullValue"===t.kind?null:"listValue"===t.kind?(t.listValue&&t.listValue.values||console.warn("Invalid JSON list value proto: ",JSON.stringify(t)),t.listValue.values.map(d)):"structValue"===t.kind?u(t.structValue):(console.warn("Unsupported JSON value proto kind: ",t.kind),null):null}},"1c2d":function(t,e,a){"use strict";a.r(e);var n=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("v-app",[a("toolbar"),a("v-content",[a("router-view")],1)],1)},o=[],r={data:function(){return{}}},s=r,i=a("2877"),l=a("6544"),c=a.n(l),u=a("7496"),d=a("a75b"),f=Object(i["a"])(s,n,o,!1,null,"2f5c3310",null);e["default"]=f.exports;c()(f,{VApp:u["a"],VContent:d["a"]})},"3a10":function(t,e,a){},4601:function(t,e,a){"use strict";a.r(e);var n=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("v-app",{attrs:{id:"keep"}},[a("toolbar"),a("drawer"),t.isDataReady?a("v-content",[a("v-fade-transition",{attrs:{mode:"out-in"}},[a("router-view")],1)],1):t._e(),a("v-overlay",{attrs:{value:t.overlay}},[a("v-progress-circular",{attrs:{size:70,width:3,color:"purple",indeterminate:""}})],1)],1)},o=[],r=a("bc3a"),s=a.n(r),i={props:{source:String},data:function(){return{drawer:null,items:[{icon:"lightbulb_outline",text:"Intenciones",to:"intent"}],isDataReady:!1}},mounted:function(){this.getInitialData(),this.$store.dispatch("initialLoad")},methods:{getInitialData:function(){var t=this;this.$store.dispatch("showOverlay",!0),s.a.get("/api/chatbot/agent/intents").then(function(e){e.data.ok?(console.log(e.data),console.log("datos conseguidos:"),t.$store.dispatch("setIntents",e.data.payload),t.isDataReady=!0):console.error(e.data)}).catch(function(t){console.log(t)}).finally(function(){t.$store.dispatch("showOverlay",!1)})}},computed:{overlay:function(){return this.$store.state.overlay}}},l=i,c=(a("99f1"),a("2877")),u=a("6544"),d=a.n(u),f=a("7496"),p=a("a75b"),m=a("0789"),v=a("a797"),b=a("490a"),h=Object(c["a"])(l,n,o,!1,null,null,null);e["default"]=h.exports;d()(h,{VApp:f["a"],VContent:p["a"],VFadeTransition:m["b"],VOverlay:v["a"],VProgressCircular:b["a"]})},"559a":function(t,e,a){"use strict";a.r(e);var n=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("v-container",{attrs:{"grid-list-xs":""}},[a("v-layout",{staticClass:"mb-4",attrs:{"align-center":""}},[a("span",{staticClass:"display-1"},[t._v("Gestión del menú persistente")]),a("v-menu",{attrs:{"offset-y":""},scopedSlots:t._u([{key:"activator",fn:function(e){var n=e.on;return[a("v-btn",t._g({staticClass:"mr-4",attrs:{color:"primary"}},n),[t._v("Añadir opción")])]}}])},[a("v-list",[a("v-list-item",{on:{click:function(e){return t.addLinkButton()}}},[a("v-list-item-title",[t._v("De tipo enlace")])],1),a("v-list-item",{on:{click:function(e){return t.addPostbackButton()}}},[a("v-list-item-title",[t._v("De tipo postback")])],1)],1)],1)],1),t._l(t.buttons,function(e,n){return a("div",{key:n},[a("v-card",{staticClass:"mb-4 pa-5",attrs:{outlined:""}},[a("v-layout",{attrs:{"justify-space-between":""}},[a("span",{staticClass:"title mb-3"},[t._v("Configuración del botón "+t._s(n+1))]),a("v-btn",{attrs:{color:"error"},on:{click:function(e){return t.deleteButton(n)}}},[t._v("Eliminar")])],1),a("v-text-field",{attrs:{outlined:"",label:"Nombre del botón"},model:{value:e.title,callback:function(a){t.$set(e,"title",a)},expression:"button.title"}}),a("p",{staticClass:"body-1"},[t._v("Tipo de botón")]),a("v-radio-group",{model:{value:e.type,callback:function(a){t.$set(e,"type",a)},expression:"button.type"}},[a("v-radio",{attrs:{label:"POSTBACK",value:"postback"}}),a("v-radio",{attrs:{label:"ENLACE WEB",value:"web_url"}})],1),"postback"==e.type?a("v-text-field",{attrs:{outlined:"",label:"Mensaje de emparejamiento"},model:{value:e.payload,callback:function(a){t.$set(e,"payload",a)},expression:"button.payload"}}):a("v-text-field",{attrs:{outlined:"",label:"Dirección URL"},model:{value:e.url,callback:function(a){t.$set(e,"url",a)},expression:"button.url"}})],1)],1)}),a("v-btn",{attrs:{color:"success"},on:{click:function(e){return t.save(t.buttons)}}},[t._v("Guardar")])],2)},o=[],r=a("bc3a"),s=a.n(r),i={data:function(){return{buttons:[{type:"postback",title:"Fun news",payload:"FUN_NEWS"},{title:"View Website",type:"web_url",url:"http://www.myapple.com"}],radioGroup:1}},mounted:function(){this.initialData()},methods:{initialData:function(){var t=this;s.a.get("/api/chatbot/agent/persistantmenu/list").then(function(e){e.data.ok?(console.log(e.data),t.buttons=e.data.payload):console.error(e.data)}).catch(function(t){console.log(t)})},addLinkButton:function(){this.buttons.push({title:"View Website",type:"web_url",url:"http://www.myapple.com"})},addPostbackButton:function(){this.buttons.push({type:"postback",title:"Nuevas noticias",payload:"FUN_NEWS"})},save:function(t){var e=this;this.$store.dispatch("showOverlay",!0),s.a.post("/api/chatbot/agent/persistantmenu",{buttons:t}).then(function(t){t.data.ok?console.log(t.data):console.error(t.data)}).catch(function(t){console.log(t)}).finally(function(){e.$store.dispatch("showOverlay",!1)})},deleteButton:function(t){this.buttons.splice(t,1)}}},l=i,c=a("2877"),u=a("6544"),d=a.n(u),f=a("8336"),p=a("b0af"),m=a("a523"),v=a("a722"),b=a("8860"),h=a("da13"),g=a("5d23"),_=a("e449"),y=a("67b6"),k=a("43a6"),x=a("8654"),V=Object(c["a"])(l,n,o,!1,null,"471e87b4",null);e["default"]=V.exports;d()(V,{VBtn:f["a"],VCard:p["a"],VContainer:m["a"],VLayout:v["a"],VList:b["a"],VListItem:h["a"],VListItemTitle:g["b"],VMenu:_["a"],VRadio:y["a"],VRadioGroup:k["a"],VTextField:x["a"]})},"56d7":function(t,e,a){"use strict";a.r(e);a("cadf"),a("551c"),a("f751"),a("097d");var n=a("2b0e"),o=(a("5363"),a("f309"));n["a"].use(o["a"]);var r=new o["a"]({icons:{iconfont:"mdi"}}),s=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{attrs:{id:"app"}},[a("v-app",[a("router-view"),a("snackbar")],1)],1)},i=[],l=a("2877"),c=a("6544"),u=a.n(c),d=a("7496"),f={},p=Object(l["a"])(f,s,i,!1,null,null,null),m=p.exports;u()(p,{VApp:d["a"]});var v=a("8c4f"),b=a("1858"),h=a.n(b);n["a"].use(v["a"]);var g=[{path:"/dashboard",component:a("4601").default,meta:{requiresAuth:!0},children:[{path:"",name:"dashboard",redirect:{name:"startChatbot"}},{path:"intenciones",name:"intent",component:a("7761").default},{path:"intenciones/:id",name:"updateIntent",component:a("ca63").default},{path:"/menu-persistente",name:"persistantMenu",component:a("559a").default}]},{path:"/",component:a("1c2d").default,meta:{guest:!0},children:[{path:"",redirect:"/login"},{path:"/login",name:"login",component:a("bd01").default},{path:"registro",name:"register",component:a("6d75").default}]},{path:"*",component:a("ff18").default}],_=new v["a"]({routes:g,mode:"history"});_.beforeEach(function(t,e,a){if(t.matched.some(function(t){return t.meta.requiresAuth}))if(null==h.a.getItem("token"))a({name:"login",params:{nextUrl:t.fullPath}});else{var n=JSON.parse(h.a.getItem("user"));t.matched.some(function(t){return t.meta.requiresAuth})?"ADMIN"==n.role?a():a({name:"dashboard"}):a()}else t.matched.some(function(t){return t.meta.guest})?null==h.a.getItem("token")?a():a({name:"dashboard"}):a()});var y=_,k=a("2f62"),x=a("bc3a"),V=a.n(x);n["a"].prototype.$axios=V.a,n["a"].use(k["a"]);var w=new k["a"].Store({state:{status:"",token:h.a.getItem("token")||"",user:JSON.parse(h.a.getItem("user"))||{},intents:[],loggingIn:!1,loginError:null,loginSuccessful:!1,snackbar:{text:"snackbar!",active:!1},toolbar:{drawerIcon:null},overlay:!1},mutations:{auth_request:function(t){t.status="loading"},setIntents:function(t,e){t.intents=e},logout:function(t){t.status="",t.token="",t.loggingIn=!1},auth_success:function(t,e){var a=e.token,n=e.user;t.status="success",t.token=a,t.user=n,t.loggingIn=!0},auth_error:function(t){t.status="error"},showSnackbar:function(t,e){t.snackbar.text=e,t.snackbar.active=!0},initialLoad:function(t){t.loggingIn=!0,t.loggingIn=!0},showOverlay:function(t,e){t.overlay=e}},actions:{showSnackbar:function(t,e){var a=t.commit;a("showSnackbar",e)},showOverlay:function(t,e){var a=t.commit;a("showOverlay",e)},register:function(t,e){var a=t.commit;return new Promise(function(t,n){a("auth_request"),V.a.post("/api/register",{first_name:e.first_name,last_name:e.last_name,email:e.email,password:e.password}).then(function(e){e.data.ok?t(e.data.message):console.error(e.data)}).catch(function(t){n(t),console.log(t)})})},login:function(t,e){var a=t.commit;return new Promise(function(t,n){a("auth_request"),V.a.post("/api/login",{email:e.email,password:e.password}).then(function(e){if(e.data.ok){console.log(e.data);var n=e.data.token,o=e.data.payload;h.a.setItem("token",n),V.a.defaults.headers.common["Authorization"]=n,a("auth_success",{token:n,user:o}),t(e.data.message)}}).catch(function(t){a("auth_error"),h.a.removeItem("token"),t.response&&(console.error(t.response.data),n(t))})})},setIntents:function(t,e){var a=t.commit;a("setIntents",e)},logout:function(t){var e=t.commit;e("logout"),h.a.removeItem("token")},initialLoad:function(t){var e=t.commit;e("initialLoad")}},getters:{isLoggedIn:function(t){return!!t.token},authStatus:function(t){return t.status}}}),T=(a("3a10"),function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",[a("p",[t._v("\n    Tiempo transcurrido:\n    "+t._s(t.hours)+" :\n    "+t._s(t._f("zeroPad")(t.minutes))+" :\n    "+t._s(t._f("zeroPad")(t.seconds))+" :\n    "+t._s(t._f("zeroPad")(t.milliSeconds,3))+"\n  ")]),t.isRunning?t._e():a("v-btn",{attrs:{outline:"",color:"primary",dark:""},on:{click:t.startTimer}},[t._v("EMPEZAR")]),t.isRunning?a("v-btn",{attrs:{outline:"",color:"success",dark:"",disabled:!t.isRunning},on:{click:t.pushTime}},[t._v("VUELTA")]):t._e(),t.isRunning?a("v-btn",{attrs:{outline:"",color:"error",dark:"",disabled:!t.isRunning},on:{click:t.stopTimer}},[t._v("DETENER")]):t._e(),t.isRunning?a("v-btn",{attrs:{outline:"",color:"black",dark:""},on:{click:t.clearAll}},[t._v("BORRAR")]):t._e(),a("ul",t._l(t.laps,function(e){return a("li",[t._v("\n      "+t._s(e.hours)+" :\n      "+t._s(t._f("zeroPad")(e.minutes))+" :\n      "+t._s(t._f("zeroPad")(e.seconds))+" :\n      "+t._s(t._f("zeroPad")(e.milliSeconds,3))+"\n    ")])}),0)],1)}),$=[],I=(a("6b54"),a("f576"),{mounted:function(){console.log("esto hay en laps: ",this.laps)},props:["laps"],data:function(){return{times:[],animateFrame:0,nowTime:0,diffTime:0,startTime:0,isRunning:!1}},methods:{setSubtractStartTime:function(t){t="undefined"!==typeof t?t:0;this.startTime=Math.floor(performance.now()-t)},startTimer:function(){var t=this;t.setSubtractStartTime(t.diffTime),function e(){t.nowTime=Math.floor(performance.now()),t.diffTime=t.nowTime-t.startTime,t.animateFrame=requestAnimationFrame(e)}(),t.isRunning=!0},stopTimer:function(){this.$emit("stop",this.times),this.isRunning=!1,cancelAnimationFrame(this.animateFrame)},pushTime:function(){this.times.push({hours:this.hours,minutes:this.minutes,seconds:this.seconds,milliSeconds:this.milliSeconds})},clearAll:function(){this.startTime=0,this.nowTime=0,this.diffTime=0,this.times=[],this.stopTimer(),this.animateFrame=0}},computed:{hours:function(){return Math.floor(this.diffTime/1e3/60/60)},minutes:function(){return Math.floor(this.diffTime/1e3/60)%60},seconds:function(){return Math.floor(this.diffTime/1e3)%60},milliSeconds:function(){return Math.floor(this.diffTime%1e3)}},filters:{zeroPad:function(t,e){e="undefined"!==typeof e?e:2;return t.toString().padStart(e,"0")}}}),j=I,O=a("8336"),C=Object(l["a"])(j,T,$,!1,null,"30f75174",null),A=C.exports;u()(C,{VBtn:O["a"]});var L=function(){var t=this,e=t.$createElement,a=t._self._c||e;return t.jsonData?a("v-card",{staticClass:"pa-5",attrs:{outlined:""}},[a("strong",[t._v("Rich message de tipo: "+t._s(t.getType(t.jsonData)))]),a(t.selectRichMessage(t.getType(t.jsonData)),{tag:"component",attrs:{data:t.jsonData}})],1):t._e()},S=[],E=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",[a("v-dialog",{attrs:{width:"800"},scopedSlots:t._u([{key:"activator",fn:function(e){var n=e.on;return[a("v-btn",t._g({attrs:{color:"primary",dark:""}},n),[t._v("Editar")])]}}]),model:{value:t.dialog,callback:function(e){t.dialog=e},expression:"dialog"}},[a("v-card",[a("v-toolbar",{attrs:{color:"secondary",dark:""}},[a("v-toolbar-title",[t._v("Mensaje tipo botón")])],1),a("v-container",[a("v-layout",{attrs:{"justify-center":""}},[a("v-flex",{attrs:{sm11:""}},[a("v-text-field",{attrs:{label:"Mensaje"},model:{value:t.buttonMessage,callback:function(e){t.buttonMessage=e},expression:"buttonMessage"}}),a("v-layout",{attrs:{row:"","align-center":""}},[a("v-flex",{attrs:{xs6:""}},t._l(t.buttonsList,function(e,n){return a("v-layout",{attrs:{row:"",wrap:""}},[a("v-flex",{attrs:{xs12:""}},[a("v-text-field",{attrs:{outlined:"",label:"Texto del boton "+(n+1)},model:{value:e.title,callback:function(a){t.$set(e,"title",a)},expression:"button.title"}})],1),a("v-flex",{attrs:{xs12:""}},[a("v-text-field",{attrs:{outlined:"",label:"URL del boton "+(n+1)},model:{value:e.url,callback:function(a){t.$set(e,"url",a)},expression:"button.url"}})],1)],1)}),1),a("v-flex",{attrs:{xs6:""}},[a("v-card",{staticClass:"ml-3 pa-3"},[a("strong",[t._v("Vista previa del rich message:")]),a("p",[t._v(t._s(t.buttonMessage))]),t._l(t.buttonsList,function(e){return a("div",[a("v-btn",{attrs:{block:"",color:"primary",outlined:""}},[t._v(t._s(e.title))])],1)})],2)],1)],1),a("v-btn",{attrs:{color:"primary",outlined:""},on:{click:t.addButton}},[t._v("Añadir otro botón (MAX 3)")])],1)],1)],1)],1)],1),a("v-layout",{attrs:{"justify-center":""}},[a("v-flex",{attrs:{sm6:""}},[a("v-card",{staticClass:"ml-3 pa-3"},[a("strong",[t._v("Vista previa del rich message:")]),a("p",[t._v(t._s(t.buttonMessage))]),t._l(t.buttonsList,function(e){return a("div",[a("v-btn",{attrs:{block:"",color:"primary",outlined:""}},[t._v(t._s(e.title))])],1)})],2)],1)],1)],1)},R=[],M={mounted:function(){},props:["data"],data:function(){return{dialog:!1}},computed:{buttonsList:function(){return this.data.facebook.attachment.payload.buttons},buttonMessage:{get:function(){return this.data.facebook.attachment.payload.text},set:function(t){this.data.facebook.attachment.payload.text=t}}},methods:{addButton:function(){this.data.facebook.attachment.payload.buttons.push({type:"web_url",title:"ejemplo",url:"https://developers.facebook.com/docs/messenger-platform/send-messages/template/list"})}}},N=M,D=a("b0af"),P=a("a523"),F=a("169a"),B=a("0e8f"),q=a("a722"),U=a("8654"),z=a("71d9"),J=a("2a7f"),G=Object(l["a"])(N,E,R,!1,null,"f8c3d6e8",null),W=G.exports;u()(G,{VBtn:O["a"],VCard:D["a"],VContainer:P["a"],VDialog:F["a"],VFlex:B["a"],VLayout:q["a"],VTextField:U["a"],VToolbar:z["a"],VToolbarTitle:J["a"]});var Y=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",[a("v-dialog",{attrs:{width:"800"},scopedSlots:t._u([{key:"activator",fn:function(e){var n=e.on;return[a("v-btn",t._g({attrs:{color:"primary",dark:""}},n),[t._v("Editar")])]}}]),model:{value:t.dialog,callback:function(e){t.dialog=e},expression:"dialog"}},[a("v-card",[a("v-toolbar",{attrs:{color:"secondary",dark:""}},[a("v-toolbar-title",[t._v("Mensaje tipo generic")])],1),a("v-container",[a("v-tabs",{attrs:{"background-color":"deep-purple accent-4",centered:"",dark:"","icons-and-text":""},model:{value:t.tab,callback:function(e){t.tab=e},expression:"tab"}},[a("v-tabs-slider"),t._l(t.generics,function(e,n){return a("v-tab",{key:n,attrs:{href:"#tab-"+n}},[t._v("Pantalla "+t._s(n+1))])})],2),a("v-tabs-items",{model:{value:t.tab,callback:function(e){t.tab=e},expression:"tab"}},t._l(t.generics,function(e,n){return a("v-tab-item",{key:n,attrs:{value:"tab-"+n}},[a("v-text-field",{attrs:{label:"titulo"},model:{value:e.title,callback:function(a){t.$set(e,"title",a)},expression:"generic.title"}}),a("v-text-field",{attrs:{label:"descripcion"},model:{value:e.subtitle,callback:function(a){t.$set(e,"subtitle",a)},expression:"generic.subtitle"}}),a("v-text-field",{attrs:{label:"link imagen"},model:{value:e.image_url,callback:function(a){t.$set(e,"image_url",a)},expression:"generic.image_url"}}),a("strong",[t._v("Botones")]),t._l(e.buttons,function(e){return a("div",[a("v-text-field",{attrs:{label:"texto de boton"},model:{value:e.title,callback:function(a){t.$set(e,"title",a)},expression:"button.title"}})],1)}),a("v-layout",{attrs:{"justify-center":""}},[a("v-flex",{attrs:{sm11:""}},[a("v-layout",{attrs:{row:"","justify-center":""}},[a("v-flex",{attrs:{xs6:""}},[a("v-card",{staticClass:"ml-3 pa-3"},[a("strong",[t._v("Vista previa del rich message:")]),a("v-img",{attrs:{src:e.image_url,"aspect-ratio":"1.7",contain:""}}),a("strong",[t._v(t._s(e.title))]),a("p",[t._v(t._s(e.subtitle))]),t._l(e.buttons,function(e){return a("div",[a("v-btn",{attrs:{color:"primary",outlined:"",block:""}},[t._v(t._s(e.title))])],1)})],2)],1)],1)],1)],1)],2)}),1)],1)],1)],1),a("v-layout",{attrs:{"justify-center":""}},[a("v-flex",{attrs:{sm11:""}},[a("v-layout",{attrs:{row:"","justify-center":""}},t._l(t.generics,function(e,n){return a("v-flex",{key:n,attrs:{sm3:""}},[a("v-card",{staticClass:"ml-3 pa-3"},[a("strong",[t._v("Vista previa del rich message:")]),a("v-img",{attrs:{src:e.image_url,"aspect-ratio":"1.7",contain:""}}),a("strong",[t._v(t._s(e.title))]),a("p",[t._v(t._s(e.subtitle))]),t._l(e.buttons,function(e){return a("div",[a("v-btn",{attrs:{color:"primary",outlined:"",block:""}},[t._v(t._s(e.title))])],1)})],2)],1)}),1),a("v-btn",{attrs:{color:"primary",outlined:""},on:{click:t.addGeneric}},[t._v("Añadir otra pantalla")])],1)],1)],1)},K=[],Q={props:["data"],data:function(){return{dialog:!1,tab:null,text:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."}},mounted:function(){console.log("generic recibido: ",this.data)},computed:{generics:function(){return this.data.facebook.attachment.payload.elements}},methods:{addGeneric:function(){console.log("anadiendo screen"),this.data.facebook.attachment.payload.elements.push({title:"PANTALLA 01",image_url:"https://miro.medium.com/max/4000/1*m9IJdAYW04MYh75ivpwUNA.png",subtitle:"Descripcion de la pantalla 01",buttons:[{type:"postback",title:"boton 01",payload:"button1_payload"},{type:"postback",title:"boton 02",payload:"button2_payload"},{type:"postback",title:"boton 03",payload:"button3_payload"}]})}}},X=Q,Z=a("adda"),H=a("71a3"),tt=a("c671"),et=a("fe57"),at=a("aac8"),nt=a("9a96"),ot=Object(l["a"])(X,Y,K,!1,null,"7c3067a2",null),rt=ot.exports;u()(ot,{VBtn:O["a"],VCard:D["a"],VContainer:P["a"],VDialog:F["a"],VFlex:B["a"],VImg:Z["a"],VLayout:q["a"],VTab:H["a"],VTabItem:tt["a"],VTabs:et["a"],VTabsItems:at["a"],VTabsSlider:nt["a"],VTextField:U["a"],VToolbar:z["a"],VToolbarTitle:J["a"]});var st=a("0267"),it={props:["data","index"],data:function(){return{jsonData:null,components:[W,rt]}},mounted:function(){this.jsonData=this.data,this.jsonData=this.structToJson(this.jsonData)},methods:{getType:function(t){return t.facebook.attachment.payload.template_type},selectRichMessage:function(t){switch(t){case"button":return this.components[0];case"generic":return this.components[1];default:break}},structToJson:function(t){return Object(st["b"])(t)}}},lt=it,ct=Object(l["a"])(lt,L,S,!1,null,"dbb653ec",null),ut=ct.exports;u()(ct,{VCard:D["a"]});var dt=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("v-app-bar",{attrs:{app:"",dark:"","clipped-left":"",color:"#1867C0"}},[a("v-app-bar-nav-icon",{on:{click:function(e){t.$store.state.toolbar.drawerIcon=!t.$store.state.toolbar.drawerIcon}}}),a("span",{staticClass:"title ml-3 mr-5"},[a("span",{staticClass:"font-weight-light"},[t._v("Charlie Bot")])]),a("v-spacer"),t.$store.state.loggingIn?t._e():a("v-btn",{attrs:{color:"white",to:{name:"login"},outlined:""},on:{click:t.goToLogin}},[t._v("Iniciar Sesión")]),t.$store.state.loggingIn?t._e():a("v-btn",{attrs:{color:"white",to:{name:"register"},outlined:""}},[t._v("Registro")]),t.$store.state.loggingIn?a("v-menu",{attrs:{"offset-y":""},scopedSlots:t._u([{key:"activator",fn:function(e){var n=e.on;return[a("v-btn",t._g({attrs:{text:"",color:"white"}},n),[t._v("\n        "+t._s(t.$store.state.user.first_name)+"\n        "),a("v-icon",[t._v("mdi-menu-down")])],1)]}}],null,!1,1348566953)},[a("v-list",[a("v-list-item",{on:{click:function(e){return t.logout()}}},[a("v-list-item-title",[t._v("Cerrar sesion")])],1)],1)],1):t._e()],1)},ft=[],pt={methods:{goToLogin:function(){console.log("login")},logout:function(){this.$store.dispatch("logout"),this.$router.push({name:"login"})}}},mt=pt,vt=a("40dc"),bt=a("5bc1"),ht=a("132d"),gt=a("8860"),_t=a("da13"),yt=a("5d23"),kt=a("e449"),xt=a("2fa4"),Vt=Object(l["a"])(mt,dt,ft,!1,null,"18bcb320",null),wt=Vt.exports;u()(Vt,{VAppBar:vt["a"],VAppBarNavIcon:bt["a"],VBtn:O["a"],VIcon:ht["a"],VList:gt["a"],VListItem:_t["a"],VListItemTitle:yt["b"],VMenu:kt["a"],VSpacer:xt["a"]});var Tt=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("v-snackbar",{attrs:{color:"success"},model:{value:t.snackbar,callback:function(e){t.snackbar=e},expression:"snackbar"}},[t._v("\n  "+t._s(t.$store.state.snackbar.text)+"\n  "),a("v-btn",{attrs:{dark:"",text:""},on:{click:function(e){t.$store.state.snackbar.active=!1}}},[t._v("Cerrar")])],1)},$t=[],It={computed:{snackbar:{get:function(){return this.$store.state.snackbar.active},set:function(t){this.$store.state.snackbar.active=t}}}},jt=It,Ot=a("2db4"),Ct=Object(l["a"])(jt,Tt,$t,!1,null,"7296b666",null),At=Ct.exports;u()(Ct,{VBtn:O["a"],VSnackbar:Ot["a"]});var Lt=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("v-navigation-drawer",{attrs:{clipped:"",app:"",color:"grey lighten-4"},model:{value:t.$store.state.toolbar.drawerIcon,callback:function(e){t.$set(t.$store.state.toolbar,"drawerIcon",e)},expression:"$store.state.toolbar.drawerIcon"}},[a("v-list",{staticClass:"grey lighten-4",attrs:{dense:""}},[t._l(t.items,function(e,n){return[a("v-list-item",{key:n,attrs:{to:e.to}},[a("v-list-item-action",[a("v-icon",[t._v(t._s(e.icon))])],1),a("v-list-item-content",[a("v-list-item-title",{staticClass:"grey--text"},[t._v(t._s(e.text))])],1)],1)]})],2)],1)},St=[],Et={data:function(){return{items:[{icon:"lightbulb_outline",text:"Menú persistente",to:{name:"persistantMenu"}},{icon:"touch_app",text:"Intenciones",to:{name:"intent"}}]}}},Rt=Et,Mt=a("1800"),Nt=a("f774"),Dt=Object(l["a"])(Rt,Lt,St,!1,null,"77ac98ee",null),Pt=Dt.exports;u()(Dt,{VIcon:ht["a"],VList:gt["a"],VListItem:_t["a"],VListItemAction:Mt["a"],VListItemContent:yt["a"],VListItemTitle:yt["b"],VNavigationDrawer:Nt["a"]}),n["a"].component("chronometer",A),n["a"].component("richMessage",ut),n["a"].component("toolbar",wt),n["a"].component("snackbar",At),n["a"].component("drawer",Pt);var Ft={formattedDate:function(t){var e=new Date(t);return e.toLocaleString()}},Bt={install:function(t){t.helpers=Ft,t.prototype.$helpers=Ft}};n["a"].use(Bt);a("d5e8"),a("d1e7");n["a"].config.productionTip=!1,new n["a"]({vuetify:r,router:y,store:w,render:function(t){return t(m)}}).$mount("#app")},"6d75":function(t,e,a){"use strict";a.r(e);var n=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("v-container",{attrs:{"grid-list-xs":""}},[a("v-layout",{attrs:{column:"","align-center":""}},[a("v-card",{attrs:{width:"500"}},[a("v-toolbar",{attrs:{color:"primary"}},[a("v-toolbar-title",{staticClass:"white--text",attrs:{color:"primary"}},[t._v("Inicio de sesión")])],1),a("v-card-text",[a("v-form",{ref:"form",attrs:{"lazy-validation":t.lazy},model:{value:t.valid,callback:function(e){t.valid=e},expression:"valid"}},[a("v-text-field",{attrs:{counter:20,rules:t.nameRules,label:"Nombres",required:""},model:{value:t.user.first_name,callback:function(e){t.$set(t.user,"first_name",e)},expression:"user.first_name"}}),a("v-text-field",{attrs:{counter:20,rules:t.nameRules,label:"Apellidos",required:""},model:{value:t.user.last_name,callback:function(e){t.$set(t.user,"last_name",e)},expression:"user.last_name"}}),a("v-text-field",{attrs:{rules:t.emailRules,label:"E-mail",required:""},model:{value:t.user.email,callback:function(e){t.$set(t.user,"email",e)},expression:"user.email"}}),a("v-text-field",{attrs:{type:t.show1?"text":"password","append-icon":t.show1?"visibility":"visibility_off",counter:12,rules:t.nameRules,label:"contraseña",required:""},on:{"click:append":function(e){t.show1=!t.show1}},model:{value:t.user.password,callback:function(e){t.$set(t.user,"password",e)},expression:"user.password"}}),a("v-btn",{attrs:{color:"primary"},on:{click:function(e){return t.registerUser(t.user)}}},[t._v("Registrar")])],1)],1)],1)],1)],1)},o=[],r=(a("bc3a"),{data:function(){return{user:{first_name:"",last_name:"",email:"",password:""},show1:!1,valid:!0,name:"",nameRules:[function(t){return!!t||"Name is required"},function(t){return t&&t.length<=20||"Nombre debe ser menos de 15 caracteres"}],email:"",emailRules:[function(t){return!!t||"E-mail is required"},function(t){return/.+@.+\..+/.test(t)||"E-mail debe ser válido"}],lazy:!1}},methods:{validate:function(){this.$refs.form.validate()&&(this.snackbar=!0)},reset:function(){this.$refs.form.reset()},resetValidation:function(){this.$refs.form.resetValidation()},registerUser:function(t){var e=this;this.$store.dispatch("register",t).then(function(t){console.log(t),e.$store.dispatch("showSnackbar",t),e.$router.push({name:"login"})}).catch(function(t){console.log(t)})}}}),s=r,i=a("2877"),l=a("6544"),c=a.n(l),u=a("8336"),d=a("b0af"),f=a("99d9"),p=a("a523"),m=a("4bd4"),v=a("a722"),b=a("8654"),h=a("71d9"),g=a("2a7f"),_=Object(i["a"])(s,n,o,!1,null,"61d03f04",null);e["default"]=_.exports;c()(_,{VBtn:u["a"],VCard:d["a"],VCardText:f["a"],VContainer:p["a"],VForm:m["a"],VLayout:v["a"],VTextField:b["a"],VToolbar:h["a"],VToolbarTitle:g["a"]})},7761:function(t,e,a){"use strict";a.r(e);var n=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("v-container",[a("h1",[t._v("Listado de Intents de CharlieBot")]),a("ul",t._l(t.intents,function(e,n){return a("li",{key:e.id},[a("span",{staticClass:"title"},[t._v("Intención "+t._s(n+1)+" --\x3e")]),a("router-link",{attrs:{to:{name:"updateIntent",params:{id:t.getIntentId(e.name)}}}},[t._v(t._s(e.displayName))])],1)}),0)])},o=[],r=function(t){var e=t.substring(t.lastIndexOf("/")+1,t.length);return e},s=(a("bc3a"),{data:function(){return{}},computed:{intents:function(){return this.$store.state.intents}},methods:{getIntentId:function(t){return r(t)},hasRichMessage:function(t){t=JSON.parse(t);for(var e=0;e<t.length;e++){var a=t[e];if(4==a.type)return!0}return!1}}}),i=s,l=a("2877"),c=a("6544"),u=a.n(c),d=a("a523"),f=Object(l["a"])(i,n,o,!1,null,"2b1658d0",null);e["default"]=f.exports;u()(f,{VContainer:d["a"]})},"927d":function(t,e,a){},"99f1":function(t,e,a){"use strict";var n=a("927d"),o=a.n(n);o.a},bd01:function(t,e,a){"use strict";a.r(e);var n=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("v-container",{attrs:{"grid-list-xs":""}},[a("v-layout",{attrs:{column:"","align-center":""}},[a("v-card",{attrs:{width:"500"}},[a("v-toolbar",{attrs:{color:"primary"}},[a("v-toolbar-title",{staticClass:"white--text",attrs:{color:"primary"}},[t._v("Inicio de sesión")])],1),a("v-card-text",[a("v-form",{ref:"form",attrs:{"lazy-validation":t.lazy},model:{value:t.valid,callback:function(e){t.valid=e},expression:"valid"}},[a("v-text-field",{attrs:{rules:t.emailRules,label:"E-mail",required:""},model:{value:t.user.email,callback:function(e){t.$set(t.user,"email",e)},expression:"user.email"}}),a("v-text-field",{attrs:{type:t.show1?"text":"password","append-icon":t.show1?"visibility":"visibility_off",counter:10,rules:t.nameRules,label:"contraseña",required:""},on:{"click:append":function(e){t.show1=!t.show1}},model:{value:t.user.password,callback:function(e){t.$set(t.user,"password",e)},expression:"user.password"}}),a("v-btn",{attrs:{color:"primary"},on:{click:function(e){return t.login(t.user.email,t.user.password)}}},[t._v("Ingresar")])],1)],1)],1)],1)],1)},o=[],r=(a("bc3a"),a("1858"),{data:function(){return{show1:!1,user:{email:"",password:""},valid:!0,name:"",nameRules:[function(t){return!!t||"Name is required"},function(t){return t&&t.length<=10||"Name must be less than 10 characters"}],email:"",emailRules:[function(t){return!!t||"E-mail is required"},function(t){return/.+@.+\..+/.test(t)||"E-mail must be valid"}],lazy:!1}},methods:{validate:function(){this.$refs.form.validate()&&(this.snackbar=!0)},reset:function(){this.$refs.form.reset()},resetValidation:function(){this.$refs.form.resetValidation()},login:function(t,e){var a=this;this.$store.dispatch("login",{email:t,password:e}).then(function(t){a.$store.dispatch("showSnackbar",t),console.log("mensaje del servidor: ",t),a.$router.push({name:"intent"})}).catch(function(t){return console.log(t)})}}}),s=r,i=a("2877"),l=a("6544"),c=a.n(l),u=a("8336"),d=a("b0af"),f=a("99d9"),p=a("a523"),m=a("4bd4"),v=a("a722"),b=a("8654"),h=a("71d9"),g=a("2a7f"),_=Object(i["a"])(s,n,o,!1,null,"327532a1",null);e["default"]=_.exports;c()(_,{VBtn:u["a"],VCard:d["a"],VCardText:f["a"],VContainer:p["a"],VForm:m["a"],VLayout:v["a"],VTextField:b["a"],VToolbar:h["a"],VToolbarTitle:g["a"]})},ca63:function(t,e,a){"use strict";a.r(e);var n=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("v-container",[a("div",{staticClass:"display-1 mb-4"},[t._v("Nombre del intent: "+t._s(t.intent.displayName))]),a("v-text-field",{attrs:{label:"Nombre del intent"},model:{value:t.intent.displayName,callback:function(e){t.$set(t.intent,"displayName",e)},expression:"intent.displayName"}}),a("h3",[t._v("Respuestas")]),a("draggable",{attrs:{handle:".handle",animation:300},model:{value:t.intent.messages,callback:function(e){t.$set(t.intent,"messages",e)},expression:"intent.messages"}},[a("transition-group",t._l(t.intent.messages,function(e,n){return a("div",{key:n},[e.hasOwnProperty("text")?a("div",[a("v-card",{staticClass:"mb-3"},[a("v-toolbar",{staticClass:"handle",attrs:{color:"primary",dark:""}},[a("v-toolbar-title",[t._v("Mensaje multiple")]),a("v-spacer"),a("v-btn",{attrs:{color:"error"},on:{click:function(e){return t.deleteResponse(n)}}},[t._v("Eliminar")])],1),a("v-container",t._l(e.text.text,function(n,o){return a("div",[a("v-layout",{attrs:{row:""}},[a("v-text-field",{model:{value:e.text.text[o],callback:function(a){t.$set(e.text.text,o,a)},expression:"message.text.text[i]"}})],1)],1)}),0)],1)],1):t._e(),e.hasOwnProperty("payload")?a("div",[a("v-card",{staticClass:"mb-3"},[a("v-toolbar",{staticClass:"handle",attrs:{color:"primary",dark:""}},[a("v-toolbar-title",[t._v("Mensaje en formato JSON")]),a("v-spacer"),a("v-btn",{attrs:{color:"error"},on:{click:function(e){return t.deleteResponse(n)}}},[t._v("Eliminar")])],1),a("rich-message",{ref:"richMessageRef",refInFor:!0,attrs:{index:n,data:e.payload}})],1)],1):t._e()])}),0)],1),a("v-btn",{attrs:{color:"error",text:"",to:{name:"intent"}}},[t._v("Atras")]),a("v-btn",{attrs:{color:"success"},on:{click:function(e){return t.updateIntent(t.intent)}}},[t._v("Guardar")]),a("v-menu",{attrs:{"offset-y":""},scopedSlots:t._u([{key:"activator",fn:function(e){var n=e.on;return[a("v-btn",t._g({attrs:{color:"primary"}},n),[t._v("Añadir respuesta")])]}}])},[a("v-list",t._l(t.options,function(e,n){return a("v-list-item",{key:n,on:{click:function(a){return t.createResponse(e.id)}}},[a("v-list-item-title",[t._v(t._s(e.title))])],1)}),1)],1)],1)},o=[],r=(a("ac6a"),a("7f7f"),a("6762"),a("2fdb"),a("7514"),a("bc3a")),s=a.n(r),i=a("310e"),l=a.n(i),c=a("0267"),u=function(){var t={message:"text",platform:"PLATFORM_UNSPECIFIED",text:{text:["Nuevo mensaje"]}};return t},d=function(){var t={message:"payload",payload:Object(c["a"])({facebook:{attachment:{type:"template",payload:{template_type:"button",text:"Este mensaje va junto al boton",buttons:[{type:"web_url",title:"edita",url:"https://developers.facebook.com/docs/messenger-platform/send-messages/template/list"}]}}}}),platform:"PLATFORM_UNSPECIFIED"};return t},f=function(){var t={message:"payload",payload:Object(c["a"])({facebook:{attachment:{type:"template",payload:{template_type:"generic",elements:[{title:"PANTALLA 01",image_url:"http://4.bp.blogspot.com/-_QCxfa0Jjv4/U1h7FRoJnAI/AAAAAAAAAYg/lbU-uWs5T-M/s1600/cpa-school-test.png",subtitle:"Descripcion de la pantalla 01",buttons:[{type:"postback",title:"boton 01",payload:"button1_payload"},{type:"postback",title:"boton 02",payload:"button2_payload"},{type:"postback",title:"boton 03",payload:"button3_payload"}]},{title:"PANTALLA 02",image_url:"https://as.com/deporteyvida/imagenes/2017/12/06/portada/1512576487_902870_1512576601_noticia_normal.jpg",subtitle:"Descripcion de la pantalla 02",buttons:[{type:"postback",title:"boton 01",payload:"button1_payload"},{type:"postback",title:"boton 02",payload:"button2_payload"},{type:"postback",title:"boton 03",payload:"button3_payload"}]}]}}}}),platform:"PLATFORM_UNSPECIFIED"};return t},p={components:{draggable:l.a},data:function(){return{options:[{id:1,title:"Mensaje simple"},{id:2,title:"Boton"},{id:3,title:"Menú carrusel"}],intent:{}}},mounted:function(){this.getInitialData(),console.log("intent recibido: ",this.intent)},methods:{getInitialData:function(){var t=this;this.intent=this.$store.state.intents.find(function(e){return e.name.includes(t.$route.params.id)})},updateIntent:function(t){var e=this;this.$store.dispatch("showOverlay",!0),this.$refs.richMessageRef.forEach(function(a){var n=a.index,o=a.jsonData;t.messages[n].payload=e.jsonToStruct(o)}),s.a.put("/api/chatbot/agent/intents/update",{newIntent:t}).then(function(t){t.data.ok?(console.log("intent actualizado con exito"),e.overlay=!1,console.log(t.data)):console.error(t.data)}).catch(function(t){console.log(t)}).finally(function(){e.$store.dispatch("showOverlay",!1)})},createResponse:function(t){var e=this.intent;switch(t){case 1:console.log("para pushear: ",e),e.messages.push(u());break;case 2:console.log("seleccionado: ",d()),e.messages.push(d());break;case 3:console.log("seleccionado: ",f()),e.messages.push(f());break;default:break}this.intent=e},deleteResponse:function(t){console.log("se eliminara: ",t),this.intent.messages.splice(t,1)},jsonToStruct:function(t){return Object(c["a"])(t)},structToJson:function(t){return Object(c["b"])(t)}}},m=p,v=a("2877"),b=a("6544"),h=a.n(b),g=a("8336"),_=a("b0af"),y=a("a523"),k=a("a722"),x=a("8860"),V=a("da13"),w=a("5d23"),T=a("e449"),$=a("2fa4"),I=a("8654"),j=a("71d9"),O=a("2a7f"),C=Object(v["a"])(m,n,o,!1,null,"0c7e498c",null);e["default"]=C.exports;h()(C,{VBtn:g["a"],VCard:_["a"],VContainer:y["a"],VLayout:k["a"],VList:x["a"],VListItem:V["a"],VListItemTitle:w["b"],VMenu:T["a"],VSpacer:$["a"],VTextField:I["a"],VToolbar:j["a"],VToolbarTitle:O["a"]})},ff18:function(t,e,a){"use strict";a.r(e);var n=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"ma-auto"},[a("h1",[t._v("Esta pagina no esta disponible...")]),a("v-btn",{attrs:{color:"error"},on:{click:function(e){return t.back()}}},[t._v("Volver")])],1)},o=[],r={methods:{back:function(){console.log(this.$router.go(-1))}}},s=r,i=a("2877"),l=a("6544"),c=a.n(l),u=a("8336"),d=Object(i["a"])(s,n,o,!1,null,"87a43c1e",null);e["default"]=d.exports;c()(d,{VBtn:u["a"]})}});
//# sourceMappingURL=app.97357951.js.map