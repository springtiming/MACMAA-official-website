// Mock data for prototype demonstration

export interface NewsItem {
  id: number;
  title: { zh: string; en: string };
  summary: { zh: string; en: string };
  content: { zh: string; en: string };
  date: string;
  image: string;
}

export interface Event {
  id: number;
  title: { zh: string; en: string };
  description: { zh: string; en: string };
  date: string;
  location: { zh: string; en: string };
  fee: number;
  capacity: number;
  registered: number;
  image: string;
}

export const mockNews: NewsItem[] = [
  {
    id: 1,
    title: {
      zh: '2025年春节联欢晚会圆满成功',
      en: '2025 Chinese New Year Gala Successfully Concluded',
    },
    summary: {
      zh: '近500名社区成员齐聚一堂，共庆新春佳节，现场节目精彩纷呈。',
      en: 'Nearly 500 community members gathered to celebrate the Chinese New Year with spectacular performances.',
    },
    content: {
      zh: `2025年2月10日，VMCA在维多利亚会议中心成功举办了年度春节联欢晚会。近500名社区成员齐聚一堂，共庆新春佳节。

晚会节目精彩纷呈，包括传统舞蹈、武术表演、儿童合唱以及现代歌舞等多个节目。社区志愿者们为活动准备了丰富的传统美食，让参与者们品尝到家乡的味道。

VMCA主席在致辞中表示："这是一个团结社区、传承文化的重要时刻。感谢所有参与者和志愿者的支持。"

本次活动得到了维多利亚市政府和多家本地企业的大力支持。我们期待在未来举办更多精彩的文化活动，促进多元文化交流。

**注：本原型使用模拟数据，实际系统将通过CMS后台发布和管理新闻内容。**`,
      en: `On February 10, 2025, VMCA successfully hosted its annual Chinese New Year Gala at the Victoria Convention Center. Nearly 500 community members gathered to celebrate the festive occasion.

The evening featured spectacular performances including traditional dances, martial arts demonstrations, children's choir, and contemporary performances. Community volunteers prepared abundant traditional delicacies, allowing participants to taste the flavors of home.

The VMCA President stated in the opening speech: "This is a significant moment for uniting our community and preserving our culture. Thank you to all participants and volunteers for your support."

The event was strongly supported by the City of Victoria and several local businesses. We look forward to hosting more exciting cultural activities in the future to promote multicultural exchange.

**Note: This prototype uses mock data. The production system will publish and manage news content through a CMS backend.**`,
    },
    date: '2025-02-10',
    image: 'chinese celebration culture',
  },
  {
    id: 2,
    title: {
      zh: 'VMCA启动新移民安居服务计划',
      en: 'VMCA Launches Newcomer Settlement Program',
    },
    summary: {
      zh: '为帮助新移民更好地融入社区，我们推出了全新的安居服务计划。',
      en: 'To help newcomers better integrate into the community, we have launched a new settlement service program.',
    },
    content: {
      zh: `VMCA很荣幸地宣布，我们的新移民安居服务计划正式启动。该计划旨在为新抵达维多利亚的移民家庭提供全方位的支持服务。

服务内容包括：
- 住房信息咨询
- 就业指导和培训
- 语言学习资源
- 法律咨询服务
- 文化适应辅导

我们的专业团队将为每个家庭提供一对一的个性化服务。如果您或您认识的人需要帮助，请联系我们的办公室。

该计划得到了BC省多元文化基金的资助，我们将持续为社区服务。

**注：实际系统将集成在线预约系统和服务跟踪功能。**`,
      en: `VMCA is proud to announce the official launch of our Newcomer Settlement Program. This initiative aims to provide comprehensive support services for immigrant families newly arriving in Victoria.

Services include:
- Housing information consultation
- Employment guidance and training
- Language learning resources
- Legal consultation services
- Cultural adaptation counseling

Our professional team will provide personalized one-on-one services for each family. If you or someone you know needs assistance, please contact our office.

This program is funded by the BC Multicultural Fund, and we will continue to serve our community.

**Note: The production system will integrate online booking and service tracking features.**`,
    },
    date: '2025-01-15',
    image: 'community support people',
  },
  {
    id: 3,
    title: {
      zh: '多元文化艺术展览即将开幕',
      en: 'Multicultural Art Exhibition Opening Soon',
    },
    summary: {
      zh: '3月将举办大型艺术展览，展示社区成员的多元文化艺术作品。',
      en: 'A large-scale art exhibition will be held in March, showcasing multicultural artworks from community members.',
    },
    content: {
      zh: `VMCA将于3月15日至30日在维多利亚艺术馆举办"多元文化之美"艺术展览。此次展览将展出来自20多个不同文化背景的艺术家作品。

展览将包括绘画、雕塑、摄影、传统手工艺等多种艺术形式。我们希望通过艺术这一普世语言，促进不同文化之间的理解和欣赏。

开幕式将于3月15日下午2点举行，届时将有艺术家现场演示和互动活动。展览对公众免费开放。

欢迎社区成员踊跃参观，共同感受多元文化的魅力。

**注：展览报名和作品提交将通过专门的在线系统管理。**`,
      en: `VMCA will host the "Beauty of Multiculturalism" art exhibition at the Victoria Art Gallery from March 15 to 30. This exhibition will feature works from over 20 artists from diverse cultural backgrounds.

The exhibition will include paintings, sculptures, photography, traditional handicrafts, and more. We hope to promote understanding and appreciation between different cultures through the universal language of art.

The opening ceremony will be held at 2 PM on March 15, featuring live artist demonstrations and interactive activities. The exhibition is free and open to the public.

We welcome all community members to visit and experience the charm of multiculturalism together.

**Note: Exhibition registration and artwork submissions will be managed through a dedicated online system.**`,
    },
    date: '2025-02-20',
    image: 'art exhibition gallery',
  },
];

export const mockEvents: Event[] = [
  {
    id: 1,
    title: {
      zh: '元宵节庆祝活动',
      en: 'Lantern Festival Celebration',
    },
    description: {
      zh: '与家人一起参加传统元宵节庆祝活动，包括灯谜竞猜、汤圆制作和舞龙表演。活动适合全家参与，现场还将提供传统小吃和茶点。',
      en: 'Join us for a traditional Lantern Festival celebration featuring lantern riddles, tangyuan making, and dragon dance performances. Family-friendly event with traditional snacks and refreshments.',
    },
    date: '2025-02-24T14:00:00',
    location: {
      zh: '维多利亚社区中心',
      en: 'Victoria Community Center',
    },
    fee: 15,
    capacity: 100,
    registered: 67,
    image: 'lantern festival traditional',
  },
  {
    id: 2,
    title: {
      zh: '职业发展研讨会',
      en: 'Career Development Workshop',
    },
    description: {
      zh: '专业的职业顾问将分享在加拿大求职的技巧、简历撰写要点和面试准备。研讨会包括小组讨论和一对一咨询环节。',
      en: 'Professional career counselors will share job hunting tips in Canada, resume writing essentials, and interview preparation. Workshop includes group discussions and one-on-one consultation sessions.',
    },
    date: '2025-03-05T18:30:00',
    location: {
      zh: 'VMCA办公室',
      en: 'VMCA Office',
    },
    fee: 0,
    capacity: 30,
    registered: 18,
    image: 'business workshop professional',
  },
  {
    id: 3,
    title: {
      zh: '春季郊游野餐',
      en: 'Spring Picnic Outing',
    },
    description: {
      zh: '在美丽的春日阳光下，与社区朋友们一起享受户外野餐。活动包括团队游戏、野餐和自然漫步。请自备野餐垫和食物。',
      en: 'Enjoy an outdoor picnic with community friends under the beautiful spring sun. Activities include team games, picnicking, and nature walks. Please bring your own picnic blanket and food.',
    },
    date: '2025-03-15T11:00:00',
    location: {
      zh: '比肯山公园',
      en: 'Beacon Hill Park',
    },
    fee: 0,
    capacity: 80,
    registered: 45,
    image: 'park picnic outdoor',
  },
  {
    id: 4,
    title: {
      zh: '传统美食烹饪课',
      en: 'Traditional Cooking Class',
    },
    description: {
      zh: '学习制作地道的亚洲传统美食。本期课程将教授饺子和春卷的制作技巧。所有食材和工具将由我们提供。',
      en: 'Learn to prepare authentic Asian traditional cuisine. This session will teach dumpling and spring roll making techniques. All ingredients and tools will be provided.',
    },
    date: '2025-03-20T17:00:00',
    location: {
      zh: '维多利亚烹饪学校',
      en: 'Victoria Culinary School',
    },
    fee: 25,
    capacity: 20,
    registered: 14,
    image: 'cooking food asian',
  },
];
