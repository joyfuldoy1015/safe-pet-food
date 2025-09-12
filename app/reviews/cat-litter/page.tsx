export default function CatLitterReviewsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            고양이 모래 후기 모음 🐱
          </h1>
          <p className="text-lg text-gray-600">
            실제 집사들의 솔직한 고양이 모래 사용 후기를 모아서 제공해드려요
          </p>
        </div>

        {/* Coming Soon Content */}
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-6">🚧</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">곧 오픈 예정입니다</h2>
          <p className="text-gray-600 mb-6">
            더 나은 서비스를 위해 열심히 준비하고 있어요.<br />
            조금만 기다려주세요!
          </p>
          <div className="text-sm text-gray-500">
            예상 오픈: 2024년 1월
          </div>
        </div>
      </div>
    </div>
  )
} 