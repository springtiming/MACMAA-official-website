import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Eye, Check, X, UserCheck, UserX, Users, ArrowLeft, Trash2, AlertTriangle, RotateCcw, Download } from 'lucide-react';
import { ProcessingOverlay, ProcessingState } from '../components/ProcessingOverlay';
import { toast } from 'sonner@2.0.3';

interface Member {
  id: string;
  chineseName: string;
  englishName: string;
  gender: 'male' | 'female';
  birthday: string;
  phone: string;
  email: string;
  address: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelation: string;
  applyDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Mock data
const mockMembers: Member[] = [
  {
    id: '1',
    chineseName: '李伟',
    englishName: 'Wei Li',
    gender: 'male',
    birthday: '1965-03-15',
    phone: '0412 345 678',
    email: 'wei.li@email.com',
    address: '123 Main St, Templestowe VIC 3106',
    emergencyName: '李娜',
    emergencyPhone: '0423 456 789',
    emergencyRelation: '配偶',
    applyDate: '2024-11-20',
    status: 'pending',
  },
  {
    id: '2',
    chineseName: '王芳',
    englishName: 'Fang Wang',
    gender: 'female',
    birthday: '1970-08-22',
    phone: '0434 567 890',
    email: 'fang.wang@email.com',
    address: '45 Park Ave, Doncaster VIC 3108',
    emergencyName: '王明',
    emergencyPhone: '0445 678 901',
    emergencyRelation: '子女',
    applyDate: '2024-11-18',
    status: 'approved',
  },
  {
    id: '3',
    chineseName: '张华',
    englishName: 'Hua Zhang',
    gender: 'male',
    birthday: '1968-12-10',
    phone: '0456 789 012',
    email: 'hua.zhang@email.com',
    address: '78 River Rd, Bulleen VIC 3105',
    emergencyName: '张丽',
    emergencyPhone: '0467 890 123',
    emergencyRelation: '配偶',
    applyDate: '2024-11-15',
    status: 'approved',
  },
  {
    id: '4',
    chineseName: '刘敏',
    englishName: 'Min Liu',
    gender: 'female',
    birthday: '1972-05-28',
    phone: '0478 901 234',
    email: '',
    address: '12 Oak St, Templestowe Lower VIC 3107',
    emergencyName: '刘强',
    emergencyPhone: '0489 012 345',
    emergencyRelation: '子女',
    applyDate: '2024-11-22',
    status: 'pending',
  },
  {
    id: '5',
    chineseName: '陈静',
    englishName: 'Jing Chen',
    gender: 'female',
    birthday: '1975-09-15',
    phone: '0491 234 567',
    email: 'jing.chen@email.com',
    address: '56 High St, Doncaster East VIC 3109',
    emergencyName: '陈刚',
    emergencyPhone: '0402 345 678',
    emergencyRelation: '配偶',
    applyDate: '2024-10-08',
    status: 'rejected',
  },
];

export function AdminMembers() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showRejectedNote, setShowRejectedNote] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    type: 'approve' | 'reject' | 'revoke' | 'delete' | 'reopen';
    memberId: string;
    memberName: string;
  } | null>(null);
  
  // 处理状态
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [processingMessage, setProcessingMessage] = useState({ title: '', message: '' });
  
  // 用于回滚的备份数据
  const [backupMembers, setBackupMembers] = useState<Member[]>([]);

  // Filter members
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.chineseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const openConfirmDialog = (type: 'approve' | 'reject' | 'revoke' | 'delete' | 'reopen', memberId: string, memberName: string) => {
    setConfirmDialog({ type, memberId, memberName });
  };

  // 模拟 API 调用
  const simulateApiCall = (duration = 1500): Promise<{ success: boolean }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟 95% 成功率
        const success = Math.random() > 0.05;
        resolve({ success });
      }, duration);
    });
  };

  const handleConfirm = async () => {
    if (!confirmDialog) return;

    const { type, memberId, memberName } = confirmDialog;

    // 关闭确认对话框
    setConfirmDialog(null);

    // 设置处理状态消息
    const messages = {
      approve: {
        title: language === 'zh' ? '正在审核通过...' : 'Approving...',
        message: language === 'zh' ? `正在处理 ${memberName} 的会员申请` : `Processing application for ${memberName}`,
        successTitle: language === 'zh' ? '审核成功' : 'Approved Successfully',
        successMessage: language === 'zh' ? `${memberName} 已成为正式会员` : `${memberName} is now an official member`,
        errorTitle: language === 'zh' ? '审核失败' : 'Approval Failed',
        errorMessage: language === 'zh' ? '操作失败，请重试' : 'Operation failed, please try again',
      },
      reject: {
        title: language === 'zh' ? '正在拒绝申请...' : 'Rejecting...',
        message: language === 'zh' ? `正在处理 ${memberName} 的申请` : `Processing application for ${memberName}`,
        successTitle: language === 'zh' ? '已拒绝申请' : 'Application Rejected',
        successMessage: language === 'zh' ? `已拒绝 ${memberName} 的会员申请` : `Application for ${memberName} has been rejected`,
        errorTitle: language === 'zh' ? '操作失败' : 'Operation Failed',
        errorMessage: language === 'zh' ? '操作失败，请重试' : 'Operation failed, please try again',
      },
      revoke: {
        title: language === 'zh' ? '正在撤销会员资格...' : 'Revoking Membership...',
        message: language === 'zh' ? `正在撤销 ${memberName} 的会员资格` : `Revoking membership for ${memberName}`,
        successTitle: language === 'zh' ? '已撤销会员资格' : 'Membership Revoked',
        successMessage: language === 'zh' ? `已撤销 ${memberName} 的会员资格` : `Membership for ${memberName} has been revoked`,
        errorTitle: language === 'zh' ? '操作失败' : 'Operation Failed',
        errorMessage: language === 'zh' ? '操作失败，请重试' : 'Operation failed, please try again',
      },
      reopen: {
        title: language === 'zh' ? '正在重新开启申请...' : 'Reopening Application...',
        message: language === 'zh' ? `正在重新开启 ${memberName} 的申请` : `Reopening application for ${memberName}`,
        successTitle: language === 'zh' ? '已重新开启' : 'Application Reopened',
        successMessage: language === 'zh' ? `${memberName} 的申请已重新开启` : `Application for ${memberName} has been reopened`,
        errorTitle: language === 'zh' ? '操作失败' : 'Operation Failed',
        errorMessage: language === 'zh' ? '操作失败，请重试' : 'Operation failed, please try again',
      },
      delete: {
        title: language === 'zh' ? '正在删除记录...' : 'Deleting Record...',
        message: language === 'zh' ? `正在删除 ${memberName} 的记录` : `Deleting record for ${memberName}`,
        successTitle: language === 'zh' ? '删除成功' : 'Deleted Successfully',
        successMessage: language === 'zh' ? `已删除 ${memberName} 的记录` : `Record for ${memberName} has been deleted`,
        errorTitle: language === 'zh' ? '删除失败' : 'Deletion Failed',
        errorMessage: language === 'zh' ? '操作失败，请重试' : 'Operation failed, please try again',
      },
    };

    const msg = messages[type];

    // 备份当前数据
    setBackupMembers([...members]);

    // 乐观更新 - 立即更新 UI
    let updatedMembers = [...members];
    let updatedSelectedMember = selectedMember;

    switch (type) {
      case 'approve':
        updatedMembers = members.map(m => m.id === memberId ? { ...m, status: 'approved' as const } : m);
        if (selectedMember?.id === memberId) {
          updatedSelectedMember = { ...selectedMember, status: 'approved' };
        }
        break;
      case 'reject':
        updatedMembers = members.map(m => m.id === memberId ? { ...m, status: 'rejected' as const } : m);
        if (selectedMember?.id === memberId) {
          updatedSelectedMember = { ...selectedMember, status: 'rejected' };
        }
        break;
      case 'revoke':
        updatedMembers = members.map(m => m.id === memberId ? { ...m, status: 'rejected' as const } : m);
        if (selectedMember?.id === memberId) {
          updatedSelectedMember = { ...selectedMember, status: 'rejected' };
        }
        break;
      case 'reopen':
        updatedMembers = members.map(m => m.id === memberId ? { ...m, status: 'pending' as const } : m);
        if (selectedMember?.id === memberId) {
          updatedSelectedMember = { ...selectedMember, status: 'pending' };
        }
        break;
      case 'delete':
        updatedMembers = members.filter(m => m.id !== memberId);
        if (selectedMember?.id === memberId) {
          updatedSelectedMember = null;
        }
        break;
    }

    setMembers(updatedMembers);
    setSelectedMember(updatedSelectedMember);

    // 显示处理中状态
    setProcessingState('processing');
    setProcessingMessage({ title: msg.title, message: msg.message });

    try {
      // 模拟 API 调用
      const result = await simulateApiCall();

      if (result.success) {
        // 成功
        setProcessingState('success');
        setProcessingMessage({ title: msg.successTitle, message: msg.successMessage });
        
        // 显示成功 Toast
        toast.success(msg.successTitle, {
          description: msg.successMessage,
          duration: 3000,
        });
      } else {
        // 失败 - 回滚数据
        throw new Error('API call failed');
      }
    } catch (error) {
      // 错误 - 回滚数据
      setProcessingState('error');
      setProcessingMessage({ title: msg.errorTitle, message: msg.errorMessage });
      
      // 回滚到备份数据
      setMembers(backupMembers);
      
      // 回滚 selectedMember
      if (backupMembers.length > 0 && selectedMember) {
        const originalMember = backupMembers.find(m => m.id === memberId);
        if (originalMember) {
          setSelectedMember(originalMember);
        }
      }
      
      // 显示错误 Toast
      toast.error(msg.errorTitle, {
        description: msg.errorMessage,
        duration: 3000,
      });
    }
  };

  const handleExportToExcel = () => {
    // Create CSV content
    const headers = [
      t('admin.members.detail.chineseName'),
      t('admin.members.detail.englishName'),
      t('admin.members.detail.gender'),
      t('admin.members.detail.birthday'),
      t('admin.members.detail.phone'),
      t('admin.members.detail.email'),
      t('admin.members.detail.address'),
      t('admin.members.detail.emergency'),
      t('admin.members.detail.emergencyPhone'),
      t('admin.members.detail.emergencyRelation'),
      t('admin.members.table.applyDate'),
      t('admin.members.table.status')
    ];

    const rows = filteredMembers.map(member => [
      member.chineseName,
      member.englishName,
      t(`membership.form.${member.gender}`),
      member.birthday,
      member.phone,
      member.email || '',
      member.address,
      member.emergencyName,
      member.emergencyPhone,
      member.emergencyRelation,
      member.applyDate,
      t(`admin.members.${member.status}`)
    ]);

    // Convert to CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Add BOM for proper UTF-8 encoding in Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `MACMAA_Members_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-[#EB8C3A] text-white';
      case 'approved': return 'bg-[#6BA868] text-white';
      case 'rejected': return 'bg-gray-400 text-white';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    return t(`admin.members.${status}`);
  };

  return (
    <div className="min-h-screen bg-[#F5EFE6] px-4 sm:px-6 lg:px-8 py-8">
      {/* Processing Overlay */}
      <ProcessingOverlay
        state={processingState}
        title={processingMessage.title}
        message={processingMessage.message}
        onComplete={() => setProcessingState('idle')}
      />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Back Button */}
          <motion.button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-[#2B5F9E] hover:text-[#6BA868] transition-colors mb-4"
            whileHover={{ x: -4 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('admin.backToDashboard')}</span>
          </motion.button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#2B5F9E] to-[#6BA868] rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-[#2B5F9E]">{t('admin.members.title')}</h1>
            </div>

            {/* Export Button */}
            <motion.button
              onClick={handleExportToExcel}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#6BA868] text-white rounded-lg hover:bg-[#5a9157] transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Download className="w-5 h-5" />
              <span>{t('admin.members.export')}</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('admin.members.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              {['all', 'pending', 'approved', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as any)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filterStatus === status
                      ? 'bg-[#2B5F9E] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t(`admin.members.${status}`)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Rejected Members Note - Only show when rejected filter is active */}
        <AnimatePresence>
          {filterStatus === 'rejected' && showRejectedNote && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 overflow-hidden"
            >
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 flex-1">{t('admin.members.rejectedNote')}</p>
              <button
                onClick={() => setShowRejectedNote(false)}
                className="text-amber-600 hover:text-amber-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Members Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#2B5F9E] text-white">
                <tr>
                  <th className="px-4 py-3 text-left">{t('admin.members.table.name')}</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">{t('admin.members.table.phone')}</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">{t('admin.members.table.email')}</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">{t('admin.members.table.applyDate')}</th>
                  <th className="px-4 py-3 text-left">{t('admin.members.table.status')}</th>
                  <th className="px-4 py-3 text-center">{t('admin.members.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMembers.map((member, index) => (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <div>{member.chineseName}</div>
                        <div className="text-sm text-gray-500">{member.englishName}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">{member.phone}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {member.email || <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">{member.applyDate}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs ${getStatusColor(member.status)}`}>
                        {getStatusText(member.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedMember(member)}
                          className="p-2 text-[#2B5F9E] hover:bg-[#2B5F9E] hover:text-white rounded-lg transition-colors"
                          title={t('admin.members.view')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {member.status === 'pending' && (
                          <>
                            <button
                              onClick={() => openConfirmDialog('approve', member.id, member.chineseName)}
                              className="p-2 text-[#6BA868] hover:bg-[#6BA868] hover:text-white rounded-lg transition-colors"
                              title={t('admin.members.approve')}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openConfirmDialog('reject', member.id, member.chineseName)}
                              className="p-2 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                              title={t('admin.members.reject')}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {member.status === 'approved' && (
                          <button
                            onClick={() => openConfirmDialog('revoke', member.id, member.chineseName)}
                            className="p-2 text-orange-500 hover:bg-orange-500 hover:text-white rounded-lg transition-colors"
                            title={t('admin.members.revoke')}
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                        {member.status === 'rejected' && (
                          <>
                            <button
                              onClick={() => openConfirmDialog('reopen', member.id, member.chineseName)}
                              className="p-2 text-[#2B5F9E] hover:bg-[#2B5F9E] hover:text-white rounded-lg transition-colors"
                              title={t('admin.members.reopen')}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openConfirmDialog('delete', member.id, member.chineseName)}
                              className="p-2 text-gray-500 hover:bg-gray-500 hover:text-white rounded-lg transition-colors"
                              title={t('admin.members.delete')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {filteredMembers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                {language === 'zh' ? '没有找到符合条件的会员' : 'No members found'}
              </div>
            )}
          </div>
        </motion.div>

        {/* Confirm Dialog */}
        <AnimatePresence>
          {confirmDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setConfirmDialog(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
              >
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center ${
                      confirmDialog.type === 'delete' || confirmDialog.type === 'revoke' || confirmDialog.type === 'reject'
                        ? 'bg-red-50'
                        : 'bg-blue-50'
                    }`}
                  >
                    <AlertTriangle className={`w-10 h-10 ${
                      confirmDialog.type === 'delete' || confirmDialog.type === 'revoke' || confirmDialog.type === 'reject'
                        ? 'text-red-500'
                        : 'text-amber-500'
                    }`} />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-gray-900 text-center mb-3">
                  {t(`admin.members.confirm.${confirmDialog.type}.title`)}
                </h3>
                
                {/* Message */}
                <p className="text-gray-600 text-center mb-8 text-sm leading-relaxed">
                  {t(`admin.members.confirm.${confirmDialog.type}.message`)}
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    onClick={() => setConfirmDialog(null)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t('admin.members.confirm.cancel')}
                  </motion.button>
                  <motion.button
                    onClick={handleConfirm}
                    className={`flex-1 px-6 py-3 rounded-xl transition-colors ${
                      confirmDialog.type === 'delete' || confirmDialog.type === 'revoke' || confirmDialog.type === 'reject'
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-[#6BA868] text-white hover:bg-[#5a9157]'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t('admin.members.confirm.confirm')}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Member Detail Modal */}
        <AnimatePresence>
          {selectedMember && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedMember(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              >
                {/* Fixed Header */}
                <div className="sticky top-0 bg-gradient-to-r from-[#2B5F9E] to-[#6BA868] text-white p-6 rounded-t-2xl flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl">{t('admin.members.detail.title')}</h2>
                    <button
                      onClick={() => setSelectedMember(null)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {/* Status Badge and Actions */}
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className={`px-4 py-2 rounded-full text-sm ${getStatusColor(selectedMember.status)}`}>
                      {getStatusText(selectedMember.status)}
                    </span>
                    
                    {selectedMember.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openConfirmDialog('approve', selectedMember.id, selectedMember.chineseName)}
                          className="flex items-center gap-2 px-4 py-2 bg-[#6BA868] text-white rounded-lg hover:bg-[#5a9157] transition-colors"
                        >
                          <UserCheck className="w-4 h-4" />
                          {t('admin.members.approve')}
                        </button>
                        <button
                          onClick={() => openConfirmDialog('reject', selectedMember.id, selectedMember.chineseName)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <UserX className="w-4 h-4" />
                          {t('admin.members.reject')}
                        </button>
                      </div>
                    )}

                    {selectedMember.status === 'approved' && (
                      <button
                        onClick={() => openConfirmDialog('revoke', selectedMember.id, selectedMember.chineseName)}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        <UserX className="w-4 h-4" />
                        {t('admin.members.revoke')}
                      </button>
                    )}

                    {selectedMember.status === 'rejected' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openConfirmDialog('reopen', selectedMember.id, selectedMember.chineseName)}
                          className="flex items-center gap-2 px-4 py-2 bg-[#2B5F9E] text-white rounded-lg hover:bg-[#234a7e] transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" />
                          {t('admin.members.reopen')}
                        </button>
                        <button
                          onClick={() => openConfirmDialog('delete', selectedMember.id, selectedMember.chineseName)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          {t('admin.members.delete')}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Personal Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoField label={t('admin.members.detail.chineseName')} value={selectedMember.chineseName} />
                    <InfoField label={t('admin.members.detail.englishName')} value={selectedMember.englishName} />
                    <InfoField label={t('admin.members.detail.gender')} value={t(`membership.form.${selectedMember.gender}`)} />
                    <InfoField label={t('admin.members.detail.birthday')} value={selectedMember.birthday} />
                    <InfoField label={t('admin.members.detail.phone')} value={selectedMember.phone} />
                    <InfoField 
                      label={t('admin.members.detail.email')} 
                      value={selectedMember.email || (language === 'zh' ? '未提供' : 'Not provided')} 
                    />
                  </div>

                  <InfoField label={t('admin.members.detail.address')} value={selectedMember.address} fullWidth />

                  {/* Emergency Contact */}
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-[#2B5F9E] mb-3">{t('membership.form.emergency')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InfoField label={t('admin.members.detail.emergency')} value={selectedMember.emergencyName} />
                      <InfoField label={t('admin.members.detail.emergencyPhone')} value={selectedMember.emergencyPhone} />
                      <InfoField label={t('admin.members.detail.emergencyRelation')} value={selectedMember.emergencyRelation} />
                      <InfoField label={t('admin.members.table.applyDate')} value={selectedMember.applyDate} />
                    </div>
                  </div>
                </div>

                {/* Fixed Footer */}
                <div className="p-6 bg-gray-50 rounded-b-2xl flex-shrink-0">
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    {t('admin.members.close')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function InfoField({ label, value, fullWidth = false }: { label: string; value: string; fullWidth?: boolean }) {
  return (
    <div className={fullWidth ? 'col-span-full' : ''}>
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className="text-gray-900">{value}</div>
    </div>
  );
}