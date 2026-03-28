import Link from 'next/link'
import { Heart, MessageSquare, Eye } from 'lucide-react'
import { Question } from '@/app/components/qa-forum/QuestionCard'

interface RelatedQuestionsListProps {
  relatedQuestions: Question[]
  formatTimeAgo: (date: string) => string
}

export default function RelatedQuestionsList({
  relatedQuestions,
  formatTimeAgo,
}: RelatedQuestionsListProps) {
  if (relatedQuestions.length === 0) return null

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
      <h3 className="text-base font-bold text-gray-900 mb-4">관련 질문</h3>
      <div className="space-y-3">
        {relatedQuestions.map((q) => (
          <Link
            key={q.id}
            href={`/community/qa-forum/${q.id}`}
            className="block p-3 rounded-xl hover:bg-gray-50 transition-colors group border border-gray-100"
          >
            <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
              {q.title}
            </h4>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="inline-flex items-center gap-1">
                <span className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center">
                  <Heart className="h-3 w-3 text-red-400" />
                </span>
                <span className="text-gray-600">{q.votes}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
                  <MessageSquare className="h-3 w-3 text-blue-400" />
                </span>
                <span className="text-gray-600">{q.answerCount || 0}</span>
              </span>
              {q.views !== undefined && (
                <span className="inline-flex items-center gap-1">
                  <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                    <Eye className="h-3 w-3 text-gray-400" />
                  </span>
                  <span className="text-gray-600">{q.views}</span>
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
