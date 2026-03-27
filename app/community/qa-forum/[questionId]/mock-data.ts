import { Question } from '@/app/components/qa-forum/QuestionCard'
import { Comment } from '@/app/components/qa-forum/CommentThread'

export const mockQuestionsData = [
  {
    id: '1',
    title: '강아지가 사료를 잘 안 먹어요. 어떻게 해야 할까요?',
    content: '3살 골든리트리버인데 최근에 사료를 잘 안 먹습니다. 건강에는 문제가 없어 보이는데 식욕이 떨어진 것 같아요.\n\n평소에는 잘 먹던 아이인데 2주 전부터 갑자기 사료를 남기기 시작했어요. 간식은 잘 먹는데 사료만 안 먹어서 걱정입니다.\n\n혹시 비슷한 경험 있으신 분들 조언 부탁드려요. 병원에 가봐야 할까요?',
    author: { name: '반려인초보', level: 'beginner' },
    category: '🍖 사료 & 영양',
    categoryEmoji: '🍖',
    votes: 15,
    answerCount: 3,
    views: 234,
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-20T14:20:00Z',
    status: 'answered'
  },
  {
    id: '2',
    title: '고양이 모래 추천 부탁드립니다',
    content: '털 빠짐이 심한 장모종 고양이를 키우고 있는데, 모래가 털에 잘 붙지 않는 제품이 있을까요?\n\n현재는 일반 벤토나이트 모래를 사용하고 있는데, 털에 많이 붙어서 청소가 힘들어요. 클레이 모래나 다른 종류의 모래를 추천해주시면 감사하겠습니다!',
    author: { name: '냥집사5년차', level: 'experienced' },
    category: '💬 자유토론',
    categoryEmoji: '💬',
    votes: 8,
    answerCount: 2,
    views: 156,
    createdAt: '2024-01-19T15:45:00Z',
    status: 'answered'
  },
  {
    id: '3',
    title: '강아지 영양제 급여 시기가 궁금해요',
    content: '6개월 된 강아지인데 언제부터 영양제를 급여하는 게 좋을까요? 필수 영양제가 있다면 추천해주세요.\n\n현재는 사료만 먹이고 있는데, 주변에서 영양제를 먹여야 한다는 말을 들어서 궁금합니다. 어떤 영양제가 필요한지, 언제부터 시작하는 게 좋은지 알려주세요!',
    author: { name: '퍼피맘', level: 'beginner' },
    category: '❤️ 건강',
    categoryEmoji: '❤️',
    votes: 22,
    answerCount: 5,
    views: 312,
    createdAt: '2024-01-18T09:15:00Z',
    updatedAt: '2024-01-19T11:30:00Z',
    status: 'answered'
  },
  {
    id: '4',
    title: '강아지 산책 시 다른 강아지와 싸워요',
    content: '1살 된 믹스견을 키우고 있는데, 산책할 때 다른 강아지를 만나면 짖거나 공격적인 행동을 보여요.\n\n사회화가 부족한 것 같은데, 어떻게 훈련해야 할까요? 전문 훈련사에게 맡겨야 할까요?',
    author: { name: '댕댕이집사', level: 'beginner' },
    category: '🎓 훈련 & 행동',
    categoryEmoji: '🎓',
    votes: 12,
    answerCount: 4,
    views: 189,
    createdAt: '2024-01-17T13:20:00Z',
    status: 'answered'
  },
  {
    id: '5',
    title: '고양이 화장실 훈련 방법',
    content: '새로 입양한 3개월 고양이인데, 화장실을 제대로 사용하지 못해요.\n\n모래는 어디에 두는 게 좋고, 어떻게 훈련해야 할까요?',
    author: { name: '고양이초보', level: 'beginner' },
    category: '🎓 훈련 & 행동',
    categoryEmoji: '🎓',
    votes: 18,
    answerCount: 6,
    views: 267,
    createdAt: '2024-01-16T16:10:00Z',
    updatedAt: '2024-01-17T10:45:00Z',
    status: 'answered'
  },
  {
    id: '6',
    title: '강아지 사료 브랜드 추천해주세요',
    content: '골든리트리버 2살을 키우고 있는데, 어떤 사료 브랜드가 좋을까요?\n\n알레르기가 있어서 곡물 없는 사료를 찾고 있어요. 가격대는 중간 정도면 좋겠습니다.',
    author: { name: '골든맘', level: 'experienced' },
    category: '🍖 사료 & 영양',
    categoryEmoji: '🍖',
    votes: 25,
    answerCount: 8,
    views: 445,
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-16T14:30:00Z',
    status: 'answered'
  }
] as Question[]

export const mockComments: Record<string, Comment[]> = {
  '1': [
    {
      id: 'c1',
      content: `안녕하세요. 수의사입니다.

먼저 건강검진을 받아보시는 것을 권합니다. 갑작스러운 식욕 저하는 여러 원인이 있을 수 있어요:

1. **스트레스**: 환경 변화, 새로운 가족 구성원 등
2. **치아 문제**: 잇몸 염증이나 치석
3. **소화기 문제**: 위장 불편감
4. **사료 자체의 문제**: 상한 사료나 맛의 변화

**임시 해결책:**
- 사료에 따뜻한 물을 조금 부어서 향을 높여보세요
- 평소 좋아하는 토핑을 조금 올려주세요 (삶은 닭가슴살, 단호박 등)
- 사료 그릇을 깨끗이 씻어보세요

그래도 계속 안 먹으면 꼭 병원에 가보세요.`,
      author: {
        name: '수의사김선생',
        level: 'expert'
      },
      votes: 12,
      isBestAnswer: true,
      createdAt: '2024-01-20T12:00:00Z',
      replies: [
        {
          id: 'r1',
          content: '정말 자세한 답변 감사합니다! 내일 병원 예약하겠어요.',
          author: {
            name: '반려인초보',
            level: 'beginner'
          },
          votes: 3,
          createdAt: '2024-01-20T14:30:00Z'
        }
      ]
    },
    {
      id: 'c2',
      content: `저희 아이도 비슷한 경험이 있었어요.

사료를 바꿔보니까 잘 먹더라구요. 혹시 같은 사료를 오래 먹여서 질린 걸 수도 있어요.

다른 브랜드로 천천히 바꿔보시는 것도 방법이에요. 단, 갑자기 바꾸면 설사할 수 있으니까 기존 사료와 7:3, 5:5, 3:7 이런 식으로 점진적으로 바꿔주세요.`,
      author: {
        name: '골든맘5년차',
        level: 'experienced'
      },
      votes: 8,
      createdAt: '2024-01-21T09:15:00Z'
    },
    {
      id: 'c3',
      content: `운동량은 어떠신가요? 운동 부족으로도 식욕이 떨어질 수 있어요.

산책 시간을 늘려보시거나, 집에서 놀아주는 시간을 늘려보세요. 에너지를 충분히 소모하면 배가 고파서 사료도 잘 먹을 거예요.

그리고 사료 주는 시간을 일정하게 맞춰주시는 것도 중요해요.`,
      author: {
        name: '댕댕이훈련사',
        level: 'experienced'
      },
      votes: 5,
      createdAt: '2024-01-21T11:20:00Z'
    }
  ]
}
