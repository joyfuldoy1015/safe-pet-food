"use strict";(()=>{var e={};e.id=1877,e.ids=[1877],e.modules={517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},8578:(e,t,r)=>{r.r(t),r.d(t,{headerHooks:()=>L,originalPathname:()=>C,patchFetch:()=>T,requestAsyncStorage:()=>f,routeModule:()=>h,serverHooks:()=>R,staticGenerationAsyncStorage:()=>g,staticGenerationBailout:()=>A});var n={};r.r(n),r.d(n,{POST:()=>u});var a=r(5419),o=r(9108),i=r(9678),s=r(8070);let l=process.env.OPENAI_API_KEY;async function u(e){try{let t=await e.formData(),r=t.getAll("files"),n=t.get("petInfo");if(!r.length||!n)return s.Z.json({error:"PDF 파일과 반려동물 정보가 필요합니다."},{status:400});let a=JSON.parse(n),o=(await Promise.all(r.map(e=>c(e)))).join("\n\n"),i=function(e){let t=[],r=["BUN","CREA","ALT","AST","Total Protein","WBC","RBC"],n=["mg/dL","mg/dL","U/L","U/L","g/dL","K/μL","M/μL"];return[/BUN[^:]*:\s*(\d+\.?\d*)\s*mg\/dL[^(]*\(Reference:\s*([^)]+)\)/i,/CREA[^:]*:\s*(\d+\.?\d*)\s*mg\/dL[^(]*\(Reference:\s*([^)]+)\)/i,/ALT[^:]*:\s*(\d+\.?\d*)\s*U\/L[^(]*\(Reference:\s*([^)]+)\)/i,/AST[^:]*:\s*(\d+\.?\d*)\s*U\/L[^(]*\(Reference:\s*([^)]+)\)/i,/Total Protein[^:]*:\s*(\d+\.?\d*)\s*g\/dL[^(]*\(Reference:\s*([^)]+)\)/i,/WBC[^:]*:\s*(\d+\.?\d*)\s*K\/μL[^(]*\(Reference:\s*([^)]+)\)/i,/RBC[^:]*:\s*(\d+\.?\d*)\s*M\/μL[^(]*\(Reference:\s*([^)]+)\)/i].forEach((a,o)=>{let i=e.match(a);if(i){let e=parseFloat(i[1]),a=i[2],s=function(e,t){let r=t.match(/(\d+\.?\d*)-(\d+\.?\d*)/);if(r){let t=parseFloat(r[1]),n=parseFloat(r[2]);return e>=t&&e<=n}return!0}(e,a);t.push({name:r[o],value:e,unit:n[o],range:a,isNormal:s})}}),t}(o),l=await m(o,i,a);return s.Z.json(l)}catch(e){return console.error("Health analysis error:",e),s.Z.json({error:"분석 중 오류가 발생했습니다."},{status:500})}}async function c(e){return`
    COMPREHENSIVE HEALTH CHECK REPORT
    Pet Name: 멍멍이
    Date: 2024-12-15
    
    BLOOD CHEMISTRY PANEL
    ========================
    BUN (Blood Urea Nitrogen): 28 mg/dL (Reference: 7-27)
    CREA (Creatinine): 1.9 mg/dL (Reference: 0.5-1.8)
    ALT (Alanine Aminotransferase): 45 U/L (Reference: 10-100)
    AST (Aspartate Aminotransferase): 32 U/L (Reference: 10-100)
    Total Protein: 6.8 g/dL (Reference: 5.2-8.2)
    
    COMPLETE BLOOD COUNT
    ====================
    WBC (White Blood Cell): 8.5 K/μL (Reference: 5.5-16.9)
    RBC (Red Blood Cell): 7.2 M/μL (Reference: 5.5-8.5)
    HGB (Hemoglobin): 14.2 g/dL (Reference: 12.0-18.0)
    HCT (Hematocrit): 42% (Reference: 37-55)
    
    VETERINARY NOTES:
    Overall condition appears stable. Slight elevation in kidney markers (BUN, CREA) 
    warrants monitoring. Recommend follow-up in 2-3 weeks.
  `}async function m(e,t,r){if(!l)return d(t);try{let n=`
너는 수의학 지식이 풍부한 반려동물 건강 데이터 분석가야. 
보호자가 이해하기 쉬운 언어로 설명해야 해. 
절대로 의학적 진단을 내리지 말고, '참고 정보'임을 항상 강조해야 해.

반려동물 정보:
- 종류: ${"dog"===r.type?"강아지":"고양이"}
- 품종: ${r.breed||"정보 없음"}
- 나이: ${r.age} ${"years"===r.ageUnit?"년":"개월"}
- 성별: ${"male"===r.gender?"수컷":"암컷"} (중성화: ${r.neutered?"함":"안함"})
- 기저 질환: ${r.conditions||"없음"}
- 보호자 관심사: ${r.concerns||"없음"}

결과는 반드시 아래와 같은 JSON 형식으로 출력해줘:
{
  "summary": "종합 요약 (1-2문장)",
  "watchList": [
    {
      "name": "항목명",
      "value": "결과값",
      "range": "정상범위",
      "meaning": "이 수치의 의미",
      "reason": "관찰이 필요한 이유",
      "severity": "high|medium|low"
    }
  ],
  "normalSigns": [
    {
      "name": "항목명",
      "value": "결과값", 
      "range": "정상범위"
    }
  ]
}
`,a=`
다음 건강검진 결과를 분석해주세요:

PDF 내용:
${e}

구조화된 혈액검사 데이터:
${JSON.stringify(t,null,2)}
`,o=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${l}`,"Content-Type":"application/json"},body:JSON.stringify({model:"gpt-4",temperature:.3,max_tokens:2e3,messages:[{role:"system",content:n},{role:"user",content:a}]})});if(!o.ok)throw Error("OpenAI API 호출 실패");let i=(await o.json()).choices[0].message.content.match(/\{[\s\S]*\}/);if(i)return{...JSON.parse(i[0]),fullReport:t};throw Error("LLM 응답 파싱 실패")}catch(e){return console.error("LLM analysis error:",e),d(t)}}function d(e){let t=e.filter(e=>!e.isNormal),r=e.filter(e=>e.isNormal),n=t.map(e=>({name:`${e.name} (${p(e.name)})`,value:`${e.value} ${e.unit}`,range:`${e.range} ${e.unit}`,meaning:({BUN:"신장의 노폐물 여과 기능을 나타내는 주요 지표 중 하나입니다.",CREA:"근육에서 생성되는 노폐물로, 신장 기능을 평가하는 중요한 지표입니다.",ALT:"간세포에서 주로 발견되는 효소로, 간 손상을 평가하는 지표입니다.",AST:"간과 근육에서 발견되는 효소로, 간 기능과 근육 손상을 평가합니다.","Total Protein":"혈액 내 총 단백질 농도로, 영양 상태와 간 기능을 반영합니다.",WBC:"감염이나 염증에 대응하는 면역세포의 수치입니다.",RBC:"산소를 운반하는 적혈구의 수치로, 빈혈 여부를 확인할 수 있습니다."})[e.name]||"해당 항목에 대한 정보입니다.",reason:function(e,t,r){let[n,a]=r.split("-").map(Number),o=t>a,i={BUN:{high:"정상 범위보다 높게 나타났습니다. 이는 탈수, 고단백 식이, 또는 초기 신장 기능 저하 등 다양한 원인일 수 있으므로 주의 깊은 관찰이 필요합니다.",low:"정상 범위보다 낮게 나타났습니다. 간 기능 저하나 단백질 섭취 부족 등이 원인일 수 있습니다."},CREA:{high:"정상 범위를 초과했습니다. 신장 기능에 대한 추가 검사가 필요할 수 있습니다.",low:"정상 범위보다 낮게 나타났습니다. 근육량 감소나 영양 상태를 확인해볼 필요가 있습니다."}};return i[e]?o?i[e].high:i[e].low:o?"정상 범위보다 높게 측정되어 지속적인 관찰이 필요합니다.":"정상 범위보다 낮게 측정되어 원인 파악이 필요합니다."}(e.name,e.value,e.range),severity:function(e,t,r){let[n,a]=r.split("-").map(Number),o=Math.abs(t-(n+a)/2)/((a-n)/2);return o>.5?"high":o>.2?"medium":"low"}(e.name,e.value,e.range)})),a=r.map(e=>({name:p(e.name),value:`${e.value} ${e.unit}`,range:`${e.range} ${e.unit}`}));return{summary:t.length>0?"전반적으로 건강 상태는 양호하지만, 일부 수치에 대해 주의 깊은 관찰이 필요합니다. 수의사 선생님과 상담하여 추가적인 관리에 대해 논의해 보세요.":"모든 검사 수치가 정상 범위 내에 있어 전반적으로 건강한 상태로 보입니다. 정기적인 건강검진을 통해 계속 관리해 주세요.",watchList:n,normalSigns:a,fullReport:e}}function p(e){return({BUN:"혈액요소질소",CREA:"크레아티닌",ALT:"ALT",AST:"AST","Total Protein":"총 단백질",WBC:"백혈구",RBC:"적혈구"})[e]||e}let h=new a.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/analyze-health/route",pathname:"/api/analyze-health",filename:"route",bundlePath:"app/api/analyze-health/route"},resolvedPagePath:"/Users/doheekong/Downloads/spf_cursor_test/app/api/analyze-health/route.ts",nextConfigOutput:"",userland:n}),{requestAsyncStorage:f,staticGenerationAsyncStorage:g,serverHooks:R,headerHooks:L,staticGenerationBailout:A}=h,C="/api/analyze-health/route";function T(){return(0,i.patchFetch)({serverHooks:R,staticGenerationAsyncStorage:g})}}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),n=t.X(0,[1638,6206],()=>r(8578));module.exports=n})();