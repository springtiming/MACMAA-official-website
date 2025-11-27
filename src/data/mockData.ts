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
  memberFee: number; // Member-exclusive price
  capacity: number;
  registered: number;
  image: string;
  accessType: "members-only" | "all-welcome"; // Event access type
}

export const mockNews: NewsItem[] = [
  {
    id: 1,
    title: {
      zh: "2025年MACMAA春节联欢晚会圆满成功",
      en: "2025 MACMAA Chinese New Year Gala Successfully Concluded",
    },
    summary: {
      zh: "澳洲万年市华人互助会在Templestowe社区中心举办春节晚会,社区成员欢聚一堂,共庆蛇年新春。",
      en: "MACMAA hosted a successful Chinese New Year celebration at Templestowe Community Center, bringing together community members to celebrate the Year of the Snake.",
    },
    content: {
      zh: `2025年2月8日,澳洲万年市华人互助会(MACMAA)在Templestowe社区中心成功举办了蛇年春节联欢晚会。超过300名社区成员齐聚一堂,共庆新春佳节。

晚会节目精彩纷呈,包括协艺术团的传统舞蹈、太极表演、儿童合唱、书法展示以及现代歌舞等多个节目。社区志愿者们精心准备了丰富的传统美食,让参与者们品尝到家乡的味道。

MACMAA会长陈雅女士在致辞中表示:"这是一个团结社区、传承文化的重要时刻。MACMAA成立两年多来,已经成为万年市华人社区的温暖家园。感谢所有参与者和志愿者的支持。"

本次活动得到了Manningham市政府、多元文化部门以及本地企业的大力支持。我们期待在未来举办更多精彩的文化活动,促进多元文化交流。

**注:本原型使用模拟数据,实际系统将通过CMS后台发布和管理新闻内容。**`,
      en: `On February 8, 2025, the Manningham Australian Chinese Mutual Aid Association (MACMAA) successfully hosted its Year of the Snake Chinese New Year Gala at Templestowe Community Center. Over 300 community members gathered to celebrate the festive occasion.

The evening featured spectacular performances including traditional dances by the association's art troupe, Tai Chi demonstrations, children's choir, calligraphy exhibitions, and contemporary performances. Community volunteers carefully prepared abundant traditional delicacies, allowing participants to taste the flavors of home.

MACMAA President Ms. Ya Chen stated in her opening speech: "This is a significant moment for uniting our community and preserving our culture. Since MACMAA's establishment over two years ago, it has become a warm home for the Chinese community in Manningham. Thank you to all participants and volunteers for your support."

The event was strongly supported by Manningham Council, multicultural departments, and local businesses. We look forward to hosting more exciting cultural activities in the future to promote multicultural exchange.

**Note: This prototype uses mock data. The production system will publish and manage news content through a CMS backend.**`,
    },
    date: "2025-02-08",
    image: "chinese celebration community",
  },
  {
    id: 2,
    title: {
      zh: "MACMAA居家养老服务讲座成功举办",
      en: "MACMAA Aged Care Services Seminar Successfully Held",
    },
    summary: {
      zh: "协会邀请专业顾问为社区长者和家庭讲解澳洲居家养老服务体系和政府补助政策。",
      en: "The association invited professional consultants to explain Australia's aged care service system and government subsidy policies to seniors and families.",
    },
    content: {
      zh: `2025年1月25日,MACMAA在协会活动中心举办了"居家养老服务与政府补助"专题讲座,吸引了近80名社区成员参加。

本次讲座邀请了经验丰富的养老服务顾问,详细讲解了澳洲居家养老服务体系、申请流程、政府补助政策以及如何选择合适的服务提供商。讲座还特别介绍了针对华人长者的中文服务资源。

参与者表示讲座内容实用,解答了许多关于养老服务的疑问。讲座结束后,还提供了一对一咨询服务,帮助有需要的家庭了解具体申请步骤。

MACMAA致力于为社区提供各类公益讲座,帮助华人更好地了解和享受澳洲的社会福利服务。下一期讲座将聚焦健康管理主题,敬请期待。

**注:实际系统将提供在线报名和活动回顾功能。**`,
      en: `On January 25, 2025, MACMAA held a seminar on "Aged Care Services and Government Subsidies" at the association's activity center, attracting nearly 80 community members.

The seminar invited an experienced aged care consultant to explain in detail Australia's aged care service system, application processes, government subsidy policies, and how to choose appropriate service providers. The seminar also specifically introduced Chinese language service resources for Chinese seniors.

Participants found the seminar content practical and helpful in answering many questions about aged care services. After the seminar, one-on-one consultation services were provided to help families in need understand specific application procedures.

MACMAA is committed to providing various public welfare seminars to the community, helping Chinese people better understand and enjoy Australia's social welfare services. The next seminar will focus on health management topics, so stay tuned.

**Note: The production system will provide online registration and event review features.**`,
    },
    date: "2025-01-25",
    image: "seniors health care",
  },
  {
    id: 3,
    title: {
      zh: "MACMAA艺术团参加Manningham市多元文化节",
      en: "MACMAA Arts Troupe Participates in Manningham Multicultural Festival",
    },
    summary: {
      zh: "协会艺术团受邀参加Manningham市政府举办的多元文化节,展示中华文化魅力。",
      en: "The association's arts troupe was invited to participate in the Manningham Council Multicultural Festival, showcasing the charm of Chinese culture.",
    },
    content: {
      zh: `2025年3月10日,MACMAA艺术团受邀参加了Manningham市政府举办的年度多元文化节,在主舞台上呈现了精彩的中华文化表演。

艺术团成员表演了传统舞蹈《茉莉花》、太极扇和民族歌曲演唱等节目,赢得了现场观众的热烈掌声。协会还在展位上展示了书法、中国结等传统手工艺,并提供中文教学体验活动。

Manningham市长在活动中特别感谢MACMAA为促进社区多元文化融合所做的贡献,并表示市政府将继续支持协会的各项活动。

此次参与不仅展示了华人社区的文化风采,也加强了MACMAA与本地政府及其他族裔社区的联系,为未来更多合作奠定了基础。

**注:活动照片和视频将通过会员专区分享。**`,
      en: `On March 10, 2025, the MACMAA Arts Troupe was invited to participate in the annual Manningham Council Multicultural Festival, presenting spectacular Chinese cultural performances on the main stage.

The arts troupe performed traditional dance "Jasmine Flower," Tai Chi fan, and folk song performances, receiving warm applause from the audience. The association also showcased traditional handicrafts such as calligraphy and Chinese knots at their booth, and provided Chinese language learning experience activities.

The Manningham Mayor specifically thanked MACMAA for its contributions to promoting multicultural integration in the community and stated that the council will continue to support the association's activities.

This participation not only showcased the cultural vitality of the Chinese community but also strengthened MACMAA's connections with local government and other ethnic communities, laying the foundation for future collaborations.

**Note: Event photos and videos will be shared through the members' area.**`,
    },
    date: "2025-03-10",
    image: "cultural performance festival",
  },
];

export const mockEvents: Event[] = [
  {
    id: 1,
    title: {
      zh: "每周四社区活动日",
      en: "Thursday Community Activity Day",
    },
    description: {
      zh: "MACMAA每周四定期活动日,包括太极、舞蹈、乒乓球、书法等课程。欢迎所有社区成员参加,活动免费对会员开放。现场还有茶点和社交时间。",
      en: "MACMAA's regular Thursday activity day featuring Tai Chi, dance, table tennis, calligraphy, and more. All community members welcome. Free for members. Tea and social time included.",
    },
    date: "2025-03-27T10:00:00",
    location: {
      zh: "MACMAA活动中心 - 293-297 Manningham Rd, Templestowe Lower",
      en: "MACMAA Activity Center - 293-297 Manningham Rd, Templestowe Lower",
    },
    fee: 0,
    memberFee: 0,
    capacity: 80,
    registered: 52,
    image: "tai chi senior activity",
    accessType: "all-welcome",
  },
  {
    id: 2,
    title: {
      zh: "端午节传统文化体验活动",
      en: "Dragon Boat Festival Cultural Experience",
    },
    description: {
      zh: "与家人一起参加端午节庆祝活动,包括包粽子教学、传统游戏、端午文化讲解。活动适合全家参与,现场将提供传统粽子品尝。",
      en: "Join us for Dragon Boat Festival celebrations featuring zongzi making tutorial, traditional games, and cultural presentations. Family-friendly event with traditional zongzi tasting.",
    },
    date: "2025-05-31T14:00:00",
    location: {
      zh: "MACMAA活动中心 - 293-297 Manningham Rd, Templestowe Lower",
      en: "MACMAA Activity Center - 293-297 Manningham Rd, Templestowe Lower",
    },
    fee: 10,
    memberFee: 5,
    capacity: 100,
    registered: 68,
    image: "dragon boat festival traditional",
    accessType: "all-welcome",
  },
  {
    id: 3,
    title: {
      zh: "健康养生专题讲座",
      en: "Health and Wellness Seminar",
    },
    description: {
      zh: "专业医疗顾问将分享澳洲医疗体系、常见健康问题预防、长者健康管理等实用知识。讲座包括问答环节和免费健康咨询。",
      en: "Professional health consultants will share practical knowledge about the Australian healthcare system, common health issue prevention, and senior health management. Q&A session and free health consultation included.",
    },
    date: "2025-04-10T14:00:00",
    location: {
      zh: "MACMAA活动中心 - 293-297 Manningham Rd, Templestowe Lower",
      en: "MACMAA Activity Center - 293-297 Manningham Rd, Templestowe Lower",
    },
    fee: 0,
    memberFee: 0,
    capacity: 60,
    registered: 35,
    image: "health wellness senior",
    accessType: "all-welcome",
  },
  {
    id: 4,
    title: {
      zh: "书法与国画工作坊",
      en: "Calligraphy and Chinese Painting Workshop",
    },
    description: {
      zh: "由专业书画老师教授中国传统书法和国画技巧。适合初学者和有基础的学员。所有笔墨纸砚等材料将由协会提供。",
      en: "Professional instructors will teach traditional Chinese calligraphy and painting techniques. Suitable for beginners and experienced learners. All materials (brushes, ink, paper) will be provided by the association.",
    },
    date: "2025-04-17T15:00:00",
    location: {
      zh: "MACMAA活动中心 - 293-297 Manningham Rd, Templestowe Lower",
      en: "MACMAA Activity Center - 293-297 Manningham Rd, Templestowe Lower",
    },
    fee: 15,
    memberFee: 10,
    capacity: 25,
    registered: 18,
    image: "chinese calligraphy art",
    accessType: "all-welcome",
  },
  {
    id: 5,
    title: {
      zh: "会员专属茶艺体验工作坊",
      en: "Members-Only Tea Ceremony Workshop",
    },
    description: {
      zh: "专为MACMAA会员举办的中国茶艺体验活动。资深茶艺师将讲解茶文化历史、品茶技巧，并指导学员亲手泡茶。活动包含精选茶叶品鉴和茶点。会员免费参加，名额有限。",
      en: "Exclusive Chinese tea ceremony workshop for MACMAA members. Experienced tea master will introduce tea culture history, tea tasting techniques, and guide participants to prepare tea. Includes premium tea tasting and tea snacks. Free for members, limited spots available.",
    },
    date: "2025-04-24T14:00:00",
    location: {
      zh: "MACMAA活动中心 - 293-297 Manningham Rd, Templestowe Lower",
      en: "MACMAA Activity Center - 293-297 Manningham Rd, Templestowe Lower",
    },
    fee: 0,
    memberFee: 0,
    capacity: 20,
    registered: 12,
    image: "chinese tea ceremony",
    accessType: "members-only",
  },
];
