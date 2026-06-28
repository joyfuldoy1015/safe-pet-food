'use client'

import { useState } from 'react'
import Link from 'next/link'

type PetType = 'dog' | 'cat' | 'both'

export default function BetaLandingPage() {
  const [form, setForm] = useState({ name: '', email: '', petType: '' as PetType | '', interestedProducts: [] as string[] })

  const toggleProduct = (product: string) => {
    setForm(prev => ({
      ...prev,
      interestedProducts: prev.interestedProducts.includes(product)
        ? prev.interestedProducts.filter(p => p !== product)
        : [...prev.interestedProducts, product]
    }))
  }
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.petType) { setErrorMsg('반려동물 종류를 선택해주세요.'); return }
    setStatus('loading')
    setErrorMsg('')

    const res = await fetch('/api/beta-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, petType: form.petType, interestedProducts: form.interestedProducts }),
    })
    const data = await res.json()

    if (res.ok) {
      setStatus('success')
    } else {
      setStatus('error')
      setErrorMsg(data.error || '신청 중 오류가 발생했습니다.')
    }
  }

  const scrollToSignup = () => {
    document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* 미니 내비 */}
      <nav className="sticky top-0 z-50 bg-yellow-400">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-lg font-bold text-black tracking-tight">Safe Pet Food</span>
          <button
            onClick={scrollToSignup}
            className="px-4 py-1.5 text-base font-semibold bg-black text-yellow-400 rounded-full hover:bg-gray-800 transition-colors"
          >
            베타 신청하기
          </button>
        </div>
      </nav>

      {/* 1. Hero */}
      <section className="bg-gradient-to-b from-yellow-50 to-white pt-20 pb-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full">
            베타테스터 모집 중
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-5">
            우리 아이에게<br />
            정말 괜찮은 제품,<br />
            <span className="text-yellow-500">함께 기록하고 함께 안심해요.</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8">
            반려인들의 실제 장기 급여 후기를 통해<br />
            걱정 없이 안심하고 사료, 간식 등을 선택해 보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={scrollToSignup}
              className="px-7 py-3.5 bg-yellow-400 text-black font-semibold rounded-xl hover:bg-yellow-500 transition-all hover:scale-105 shadow-md shadow-yellow-400/40"
            >
              베타테스터 신청하기
            </button>
          </div>
        </div>
      </section>

      {/* 2. 문제 제기 */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">
            어떤 사료가 진짜 안전한지,<br />사실 먹여보기 전에는 모르잖아요.
          </h2>
          <p className="text-center text-gray-500 mb-12">반려인이라면 누구나 한 번쯤 느끼는 불안함이에요.</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                icon: '📋',
                title: '성분표만으론 부족해요',
                desc: '원재료가 좋아도 실제 급여 후 어떤 반응이 나타나는지는 먹여봐야 알 수 있어요.',
              },
              {
                icon: '⏱️',
                title: '장기 후기는 찾기 어려워요',
                desc: '온라인 리뷰 대부분은 1~2주 구매 후기 위주의 단기 경험이에요. 6개월·1년 이상의 데이터는 거의 없죠.',
              },
              {
                icon: '🐾',
                title: '동물마다 반응이 달라요',
                desc: '주변에 물어봐도 우리 아이 품종·나이·건강 상태가 달라 그대로 믿기가 어려워요.',
              },
            ].map((item) => (
              <div key={item.title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. 솔루션 */}
      <section className="py-20 px-6 bg-yellow-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">
            직접 기록하고, 함께 나눠요.
          </h2>
          <p className="text-center text-gray-500 mb-12">실제 급여 데이터가 모일수록 모두가 더 안전해져요.</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: '📋',
                title: '기록',
                desc: '급여 시작일·종료일·만족도를 간단히 남기세요. 장기 급여일수록 더 가치 있는 데이터가 돼요.',
              },
              {
                step: '02',
                icon: '📊',
                title: '공유',
                desc: '장기 급여 데이터가 랭킹과 커뮤니티로 공개돼요. 내 기록이 다른 반려인의 기준이 돼요.',
              },
              {
                step: '03',
                icon: '🛡️',
                title: '안심',
                desc: '누적된 실제 데이터로 새로운 반려인이 믿고 선택할 수 있어요. 함께 만드는 신뢰예요.',
              },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-2xl p-6 border border-yellow-100 shadow-sm text-center">
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-xs font-bold text-yellow-600 mb-1">{item.step}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. 베타 혜택 */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">
            베타테스터로 먼저 경험해보세요.
          </h2>
          <p className="text-center text-gray-500 mb-12">서비스 초기를 함께하는 분들께 특별한 혜택을 드려요.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: '📣', title: '피드백 반영 우선권', desc: '개선 요청·의견을 직접 전달하고 반려인들을 위한 서비스에 반영할 수 있어요.' },
              { icon: '🐾', title: '반려동물 사용 제품 우선 등록', desc: '사료·용품 DB에 우리 아이가 급여/사용하는 제품 관련 정보를 우선 등록해드려요.' },
              { icon: '💬', title: '전용 채널 초대', desc: '운영자와 직접 소통하는 베타 채널에 초대돼요.' },
              { icon: '🎁', title: '소정의 선물', desc: '베타테스터로 참여해주신 분들께 감사의 마음을 담아 소정의 선물을 보내드려요.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-5 bg-yellow-50 rounded-2xl border border-yellow-100">
                <div className="text-2xl flex-shrink-0">{item.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 대상 */}
      <section className="py-20 px-6 bg-yellow-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">이런 분을 찾고 있어요.</h2>
          <p className="text-gray-500 mb-10">많은 조건이 필요하지 않아요. 관심과 의지면 충분해요.</p>
          <ul className="text-left space-y-4 max-w-md mx-auto">
            {[
              '반려견 또는 반려묘를 키우고 있는 분',
              '사료·간식·영양제·화장실 용품에 관심이 많은 분',
              '실제 사용 경험을 기록하고 나누는 것에 거부감이 없는 분',
              '서비스 초기 성장에 함께하고 싶은 분',
            ].map((text) => (
              <li key={text} className="flex items-start gap-3 bg-white rounded-xl px-5 py-4 border border-yellow-100 shadow-sm">
                <span className="text-yellow-500 mt-0.5 flex-shrink-0 font-bold">✓</span>
                <span className="text-gray-800 text-sm sm:text-base">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 6. 신청 폼 */}
      <section id="signup" className="py-24 px-6 bg-yellow-400">
        <div className="max-w-md mx-auto text-center">
          {status === 'success' ? (
            <div className="py-8">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-black mb-3">신청 완료!</h2>
              <p className="text-yellow-800 text-base">
                베타 초대 이메일로 가장 먼저 연락드릴게요.<br />
                함께해주셔서 감사해요 🐾
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2">
                지금 신청하면 가장 먼저 초대드려요.
              </h2>
              <p className="text-yellow-800 mb-10 text-sm">소수 정예 베타테스터를 모집하고 있어요.</p>
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-semibold text-yellow-900 mb-1.5">이름</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="홍길동"
                    className="w-full px-4 py-3 rounded-xl bg-white/60 border border-yellow-600/30 text-black placeholder-yellow-700 text-base focus:outline-none focus:border-yellow-700 focus:bg-white/80 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-yellow-900 mb-1.5">이메일</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="hello@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/60 border border-yellow-600/30 text-black placeholder-yellow-700 text-base focus:outline-none focus:border-yellow-700 focus:bg-white/80 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-yellow-900 mb-1.5">관심 제품 <span className="font-normal">(복수 선택 가능)</span></label>
                  <div className="flex gap-3 flex-wrap">
                    {(['사료', '간식', '영양제', '모래'] as const).map((product) => (
                      <button
                        key={product}
                        type="button"
                        onClick={() => toggleProduct(product)}
                        className={`px-4 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                          form.interestedProducts.includes(product)
                            ? 'bg-black text-yellow-400 border-black'
                            : 'bg-transparent text-black border-black/30 hover:border-black/60'
                        }`}
                      >
                        {product}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-yellow-900 mb-1.5">반려동물 종류</label>
                  <div className="flex gap-3">
                    {([['dog', '🐕 강아지'], ['cat', '🐱 고양이'], ['both', '둘 다']] as const).map(([val, label]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setForm({ ...form, petType: val })}
                        className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                          form.petType === val
                            ? 'bg-black text-yellow-400 border-black'
                            : 'bg-transparent text-black border-black/30 hover:border-black/60'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                {errorMsg && (
                  <p className="text-sm text-red-700 bg-red-100 rounded-lg px-4 py-2">{errorMsg}</p>
                )}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-4 bg-black text-yellow-400 font-bold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-60 text-base mt-2"
                >
                  {status === 'loading' ? '신청 중...' : '베타 신청하기'}
                </button>
              </form>
            </>
          )}
        </div>
      </section>

      {/* 7. 미니 푸터 */}
      <footer className="py-8 px-6 bg-gray-900 text-center">
        <p className="text-sm text-gray-500">
          © 2026 SafePetFood ·{' '}
          <Link href="/privacy" className="hover:text-gray-400 transition-colors">개인정보처리방침</Link>
        </p>
      </footer>
    </div>
  )
}
