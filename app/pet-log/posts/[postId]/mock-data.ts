import { DetailedPetLogPost } from './types'

export const mockDetailedPosts: Record<string, DetailedPetLogPost> = {
  'post-1': {
    id: 'post-1',
    petName: '뽀미',
    petBreed: '골든 리트리버',
    petAge: '3세',
    petWeight: '28kg',
    ownerName: '김집사',
    ownerId: 'owner-1',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    totalRecords: 9,
    feedingRecords: [
      // 사료
      {
        id: 'record-1',
        productName: '힐스 어덜트 라지 브리드',
        category: '사료',
        brand: '힐스',
        startDate: '2024-01-16',
        status: '급여중',
        duration: '5일',
        palatability: 4,
        satisfaction: 4,
        repurchaseIntent: true,
        comment: '로얄캐닌에서 바꿨는데 적응 기간이 필요해 보여요. 그래도 잘 먹고 있어요.',
        price: '89,000원 (15kg)',
        purchaseLocation: '온라인 펫샵',
        benefits: ['털 윤기 개선', '소화 잘됨']
      },
      {
        id: 'record-2',
        productName: '로얄캐닌 골든 리트리버 어덜트',
        category: '사료',
        brand: '로얄캐닌',
        startDate: '2023-10-01',
        endDate: '2024-01-15',
        status: '급여완료',
        duration: '3개월 15일',
        palatability: 5,
        satisfaction: 5,
        repurchaseIntent: true,
        comment: '우리 뽀미가 정말 잘 먹어요. 털도 윤기가 좋아졌고 변 상태도 완벽해요!',
        price: '95,000원 (12kg)',
        purchaseLocation: '동물병원',
        benefits: ['기호성 우수', '털 윤기', '변 상태 좋음']
      },
      // 간식
      {
        id: 'record-3',
        productName: '네츄럴발란스 트레이닝 트릿',
        category: '간식',
        brand: '네츄럴발란스',
        startDate: '2024-01-10',
        status: '급여중',
        duration: '11일',
        palatability: 5,
        satisfaction: 4,
        repurchaseIntent: true,
        comment: '훈련용으로 사용 중인데 정말 좋아해요. 크기도 적당하고 부드러워요.',
        price: '12,000원 (200g)',
        purchaseLocation: '펫샵',
        benefits: ['훈련 효과', '소화 잘됨']
      },
      {
        id: 'record-4',
        productName: '덴탈케어 껌',
        category: '간식',
        brand: '그린리스',
        startDate: '2023-12-01',
        endDate: '2024-01-05',
        status: '급여완료',
        duration: '1개월 5일',
        palatability: 3,
        satisfaction: 4,
        repurchaseIntent: false,
        comment: '치석 제거에는 도움이 되는 것 같은데 너무 딱딱해서 잘 안 먹어요.',
        price: '25,000원 (30개)',
        purchaseLocation: '온라인',
        benefits: ['치석 제거'],
        sideEffects: ['기호성 낮음']
      },
      {
        id: 'record-9',
        productName: '프리미엄 육포 간식',
        category: '간식',
        brand: '네이처스',
        startDate: '2023-12-15',
        endDate: '2023-12-25',
        status: '급여중지',
        duration: '10일',
        palatability: 2,
        satisfaction: 1,
        repurchaseIntent: false,
        comment: '처음엔 잘 먹었는데 갑자기 설사를 해서 중단했어요. 아마 소화가 안 되는 것 같아요.',
        price: '18,000원 (150g)',
        purchaseLocation: '펫마트',
        benefits: [],
        sideEffects: ['설사', '소화불량']
      },
      // 영양제
      {
        id: 'record-5',
        productName: '관절 건강 글루코사민',
        category: '영양제',
        brand: '뉴트리벳',
        startDate: '2023-11-01',
        status: '급여중',
        duration: '2개월 20일',
        palatability: 4,
        satisfaction: 5,
        repurchaseIntent: true,
        comment: '대형견이라 관절 건강이 걱정되어 시작했어요. 활동량이 늘어난 것 같아요.',
        price: '45,000원 (60정)',
        purchaseLocation: '동물병원',
        benefits: ['관절 건강', '활동량 증가']
      },
      {
        id: 'record-6',
        productName: '오메가3 피쉬오일',
        category: '영양제',
        brand: '펫헬스',
        startDate: '2023-08-01',
        endDate: '2023-10-31',
        status: '급여완료',
        duration: '3개월',
        palatability: 2,
        satisfaction: 4,
        repurchaseIntent: false,
        comment: '털 윤기에는 도움이 되었지만 비린내 때문에 잘 안 먹으려고 해요.',
        price: '35,000원 (90정)',
        purchaseLocation: '온라인',
        benefits: ['털 윤기 개선'],
        sideEffects: ['비린내', '기호성 낮음']
      },
      // 화장실
      {
        id: 'record-7',
        productName: '벤토나이트 고양이모래',
        category: '화장실',
        brand: '에버클린',
        startDate: '2024-01-01',
        status: '급여중',
        duration: '20일',
        palatability: 5,
        satisfaction: 4,
        repurchaseIntent: true,
        comment: '응고력이 좋고 냄새 차단도 잘 되네요. 먼지가 조금 있지만 만족해요.',
        price: '18,000원 (10L)',
        purchaseLocation: '대형마트',
        benefits: ['응고력 우수', '냄새 차단']
      },
      {
        id: 'record-8',
        productName: '두부 모래',
        category: '화장실',
        brand: '네이처코어',
        startDate: '2023-09-01',
        endDate: '2023-12-31',
        status: '급여완료',
        duration: '4개월',
        palatability: 3,
        satisfaction: 3,
        repurchaseIntent: false,
        comment: '친환경이라 좋긴 한데 응고력이 아쉽고 자주 갈아줘야 해요.',
        price: '22,000원 (7L)',
        purchaseLocation: '펫샵',
        benefits: ['친환경', '먼지 적음'],
        sideEffects: ['응고력 부족', '교체 빈도 높음']
      }
    ],
    comments: [
      {
        id: 'comment-1',
        userId: 'user-1',
        userName: '박집사',
        content: '우와 정말 자세하게 기록하셨네요! 저도 골든 리트리버 키우는데 로얄캐닌 어떠셨나요? 저희 아이는 알레르기가 있어서 고민이에요.',
        createdAt: '2024-01-21T10:30:00Z',
        likes: 3,
        isLiked: false,
        replies: [
          {
            id: 'reply-1',
            userId: 'owner-1',
            userName: '김집사',
            content: '로얄캐닌 정말 좋았어요! 알레르기가 있으시다면 수의사와 상담 후 처방식을 추천드려요. 저희 뽀미도 처음엔 알레르기 때문에 처방식부터 시작했거든요.',
            createdAt: '2024-01-21T14:20:00Z',
            likes: 2,
            isLiked: false
          }
        ]
      },
      {
        id: 'comment-2',
        userId: 'user-2',
        userName: '이집사',
        content: '영양제 정보 감사해요! 관절 건강 글루코사민 효과가 정말 있나요? 저희 13살 골든도 관절이 안좋아져서 고민중이에요.',
        createdAt: '2024-01-22T09:15:00Z',
        likes: 1,
        isLiked: false,
        replies: []
      },
      {
        id: 'comment-3',
        userId: 'user-3',
        userName: '최집사',
        content: '모래 후기도 도움이 되네요. 벤토나이트 모래 먼지 정말 많이 날리나요? 아이가 호흡기가 약해서 걱정이에요.',
        createdAt: '2024-01-22T16:45:00Z',
        likes: 0,
        isLiked: false,
        replies: []
      }
    ],
    totalComments: 6
  }
}
