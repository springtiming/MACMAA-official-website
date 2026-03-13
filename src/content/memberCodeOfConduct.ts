export type MemberCodeItem = {
  zh: string;
  en: string;
};

export type MemberCodeSection = {
  titleZh: string;
  titleEn: string;
  items: MemberCodeItem[];
};

export type MemberCodeOfConduct = {
  associationZh: string;
  associationEn: string;
  titleZh: string;
  titleEn: string;
  lastUpdatedZh: string;
  lastUpdatedEn: string;
  sections: MemberCodeSection[];
};

export const MEMBER_CODE_OF_CONDUCT: MemberCodeOfConduct = {
  associationZh: "维州多元文化社区促进会",
  associationEn: "Victoria Multicultural Community Promotion Association Inc",
  titleZh: "会员守则",
  titleEn: "Member Code of Conduct",
  lastUpdatedZh: "2025年8月",
  lastUpdatedEn: "August 2025",
  sections: [
    {
      titleZh: "一、总则",
      titleEn: "I. General Principles",
      items: [
        {
          zh: "本守则适用于所有正式会员及临时会员。",
          en: "This Code applies to all full members and temporary members.",
        },
        {
          zh: "加入本会即视为认同并承诺遵守协会章程及本守则。",
          en: "By joining the Association, members acknowledge and commit to comply with the Constitution and this Code.",
        },
      ],
    },
    {
      titleZh: "二、会员权利",
      titleEn: "II. Member Rights",
      items: [
        {
          zh: "享有选举权与被选举权。",
          en: "Members have the right to vote and to stand for election.",
        },
        {
          zh: "参加协会组织的各类活动、会议及培训。",
          en: "Members may participate in activities, meetings, and training sessions organized by the Association.",
        },
        {
          zh: "对协会事务提出建议和意见。",
          en: "Members may make suggestions and provide feedback on Association matters.",
        },
        {
          zh: "享有自愿退会的权利。",
          en: "Members have the right to resign voluntarily.",
        },
      ],
    },
    {
      titleZh: "三、会员义务",
      titleEn: "III. Member Responsibilities",
      items: [
        {
          zh: "遵守协会章程及本守则。",
          en: "Members must comply with the Association Constitution and this Code.",
        },
        {
          zh: "按时缴纳年度会费（2025年 AUD 20，2026年起 AUD 30，周期为每年1月1日至12月31日）。",
          en: "Members must pay annual membership fees on time (AUD 20 in 2025, AUD 30 from 2026, for the period 1 January to 31 December each year).",
        },
        {
          zh: "留学生会员享受长期免费资格，须提供有效证明（签证、学生卡或入学证明），证明失效后按普通会员标准缴费。",
          en: "International student members are eligible for long-term fee waiver upon valid proof (visa, student ID, or enrolment letter). Standard fees apply once proof is no longer valid.",
        },
        {
          zh: "不得以协会名义谋取个人利益。",
          en: "Members must not use the Association's name for personal gain.",
        },
      ],
    },
    {
      titleZh: "四、行为规范",
      titleEn: "IV. Code of Conduct",
      items: [
        {
          zh: "尊重不同文化背景、民族、宗教信仰及生活方式，不得有任何形式的歧视或排斥行为。",
          en: "Respect different cultural backgrounds, ethnicities, religions, and lifestyles. Any form of discrimination or exclusion is prohibited.",
        },
        {
          zh: "在协会活动中保持友善、包容、互助的态度。",
          en: "Maintain a friendly, inclusive, and supportive attitude during Association activities.",
        },
        {
          zh: "积极参与社区服务和志愿活动，尤其是长者关怀项目。",
          en: "Actively participate in community service and volunteering, especially programs supporting seniors.",
        },
        {
          zh: "爱护协会财产及活动场所公共设施。",
          en: "Protect Association property and public facilities at event venues.",
        },
      ],
    },
    {
      titleZh: "五、违规处理",
      titleEn: "V. Breach Handling",
      items: [
        {
          zh: "违反本守则者，理事会有权视情节采取口头提醒、书面警告、暂停权利直至取消会员资格等措施。当事人有权在决定前申辩。",
          en: "For breaches of this Code, the Committee may issue verbal reminders, written warnings, suspension of rights, or cancellation of membership depending on severity. The member has the right to respond before a decision is made.",
        },
      ],
    },
    {
      titleZh: "六、附则",
      titleEn: "VI. Supplementary Provisions",
      items: [
        {
          zh: "本守则由理事会负责解释和修订。",
          en: "This Code is interpreted and amended by the Committee.",
        },
        {
          zh: "本守则经会员大会通过后生效。",
          en: "This Code takes effect after approval by the General Meeting of Members.",
        },
      ],
    },
  ],
};
