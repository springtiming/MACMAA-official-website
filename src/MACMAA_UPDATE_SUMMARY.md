# MACMAA 网站更新总结

## 更新日期

2025年11月25日

## 主要更新内容

### 1. 品牌更新

- ✅ 组织名称从 VMCA 更改为 MACMAA（澳洲万年市华人互助会 / Manningham Australian Chinese Mutual Aid Association Inc.）
- ✅ Logo 已更新为新提供的 MACMAA 标志
- ✅ 所有页面的组织名称、简称和标识已全面更新

### 2. 联系信息更新

- **地址**: 293-297 Manningham Rd, Templestowe Lower VIC 3107
- **电话**: 0451 727 631
- **活动地点**: Lower Templestowe Community Centre
- **活动时间**: 每周四上午 9:30 至下午 3:30

### 3. 使命与服务更新

#### 使命（中文）

澳洲万年市华人互助会（MACMAA）的使命，是为万年市及周边地区的华人社区提供支持与关怀，促进文化交流、长者福祉、多元文化融合，并通过各种活动增强社区成员之间的联系。

#### 使命（英文）

Manningham Australian Chinese Mutual Aid Association Inc. is committed to serving Chinese seniors in the Manningham community, fostering a caring, inclusive, and harmonious environment through cultural exchange, wellbeing programs, and diverse activities.

#### 核心服务

1. **多元活动**: 太极、舞蹈、广场舞、麻将、唱歌、书法、乒乓球等
2. **健康养生**: 定期举办健康讲座、健身活动、体检服务
3. **文化传承**: 弘扬中华优秀传统文化，茶道、书会等文化活动

### 4. 会员申请表单更新

会员申请表单已按照 MACMAA 的要求更新，包括：

- 中文姓名 / 英文姓名
- 性别
- 出生日期
- 电话
- 电子邮箱（可选）
- 地址
- 紧急联络人信息
- 同意条款
- 会员费：$20/年（会员年度为1月1日至12月31日）

### 5. 新闻和活动内容更新

所有模拟新闻和活动数据已更新，以反映 MACMAA 的实际活动内容：

- MACMAA 2023年成功成立
- 每周四社区活动
- 年度超过30场社区活动
- 健康养生讲座
- 文化庆祝活动
- 茶艺文化体验
- 社区郊游活动

### 6. 组织历史

- 成立时间：2023年
- 发起人：陈雅女士
- 发展：从最初几十人发展到如今数百人规模
- 认可：获得 Manningham 市府、多元文化部门、社区团体以及中国驻墨尔本总领馆的一致认可

### 7. 每周活动内容

**每周四活动项目**：

- 太极、八段锦
- 舞蹈、广场舞
- 玩麻将、打牌
- 唱歌、唱K
- 英文课
- 书法
- 乒乓球

## 技术更新

- ✅ 更新了所有中英文翻译文件
- ✅ 更新了 Header 和 Footer 组件
- ✅ 更新了会员申请表单字段
- ✅ 更新了模拟数据以反映实际活动
- ✅ Logo 引用已更新到新的图片资源

## 文件更新列表

1. `/contexts/LanguageContext.tsx` - 所有中英文文本内容
2. `/components/Header.tsx` - Logo 和组织名称
3. `/components/Footer.tsx` - 联系信息和 Logo
4. `/pages/Membership.tsx` - 会员申请表单字段
5. `/data/mockData.ts` - 新闻和活动模拟数据

## 下一步建议

1. 替换 Logo 图片文件为实际的 MACMAA 标志（当前使用占位符路径）
2. 根据实际需求添加更多活动和新闻内容
3. 连接后端 API 以管理实际的会员数据
4. 添加在线支付功能以支持会员费缴纳
5. 集成邮件服务以发送确认和通知

## 注意事项

- 所有原型数据为模拟数据，实际系统需要对接真实的后端 API
- 会员费支付功能需要集成支付网关
- 需要实现 CMS 后台以管理新闻和活动内容
