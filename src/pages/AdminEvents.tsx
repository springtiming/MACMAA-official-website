import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Edit, Trash2, Calendar, X, Save, Upload, Image as ImageIcon, ArrowLeft, Users, Download } from 'lucide-react';
import { ImageCropper } from '../components/ImageCropper';
import * as XLSX from 'xlsx';

interface Event {
  id: string;
  title: { zh: string; en: string };
  description: { zh: string; en: string };
  date: string;
  time: string;
  location: string;
  fee: number;
  memberFee?: number;
  capacity: number | null; // null means unlimited
  imageType: 'unsplash' | 'upload';
  imageKeyword?: string; // for Unsplash search
  imageUrl?: string; // for uploaded image
  accessType: 'members-only' | 'all-welcome';
}

interface Registration {
  id: string;
  eventId: string;
  name: string;
  phone: string;
  email: string;
  tickets: number;
  paymentMethod: 'card' | 'cash' | 'transfer';
  registrationDate: string;
}

// Mock data
const mockEvents: Event[] = [
  {
    id: '1',
    title: {
      zh: '春节联欢晚会',
      en: 'Chinese New Year Gala',
    },
    description: {
      zh: '欢度春节，共享欢乐时光。精彩节目、美食分享。',
      en: 'Celebrate Chinese New Year with performances and food sharing.',
    },
    date: '2025-01-25',
    time: '18:00 - 21:00',
    location: 'Lower Templestowe Community Centre',
    fee: 25,
    memberFee: 15,
    capacity: 100,
    imageType: 'unsplash',
    imageKeyword: 'chinese,new,year,celebration',
    accessType: 'all-welcome',
  },
  {
    id: '2',
    title: {
      zh: '会员专享：健康讲座',
      en: 'Members Only: Health Seminar',
    },
    description: {
      zh: '专业医生讲解老年健康知识，仅限会员参加。',
      en: 'Professional health seminar for senior wellbeing, members only.',
    },
    date: '2025-02-10',
    time: '14:00 - 16:00',
    location: 'Lower Templestowe Community Centre',
    fee: 0,
    capacity: 50,
    imageType: 'unsplash',
    imageKeyword: 'health,seminar,seniors',
    accessType: 'members-only',
  },
];

// Mock registration data
const mockRegistrations: Registration[] = [
  {
    id: 'r1',
    eventId: '1',
    name: '张伟',
    phone: '0412 345 678',
    email: 'zhang.wei@email.com',
    tickets: 2,
    paymentMethod: 'card',
    registrationDate: '2024-11-20',
  },
  {
    id: 'r2',
    eventId: '1',
    name: '李娜',
    phone: '0423 456 789',
    email: 'li.na@email.com',
    tickets: 1,
    paymentMethod: 'transfer',
    registrationDate: '2024-11-21',
  },
  {
    id: 'r3',
    eventId: '1',
    name: 'John Smith',
    phone: '0434 567 890',
    email: 'john.smith@email.com',
    tickets: 3,
    paymentMethod: 'cash',
    registrationDate: '2024-11-22',
  },
  {
    id: 'r4',
    eventId: '2',
    name: '王芳',
    phone: '0445 678 901',
    email: 'wang.fang@email.com',
    tickets: 1,
    paymentMethod: 'card',
    registrationDate: '2024-11-18',
  },
  {
    id: 'r5',
    eventId: '2',
    name: '陈明',
    phone: '0456 789 012',
    email: 'chen.ming@email.com',
    tickets: 1,
    paymentMethod: 'transfer',
    registrationDate: '2024-11-19',
  },
];

export function AdminEvents() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [registrations, setRegistrations] = useState<Registration[]>(mockRegistrations);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewingRegistrations, setViewingRegistrations] = useState<string | null>(null);

  // Filter events
  const filteredEvents = events.filter(event =>
    event.title.zh.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.title.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingEvent(null);
    setShowForm(true);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('admin.events.deleteConfirm'))) {
      setEvents(events.filter(e => e.id !== id));
    }
  };

  const handleSave = (event: Event) => {
    if (editingEvent) {
      setEvents(events.map(e => e.id === event.id ? event : e));
    } else {
      setEvents([...events, { ...event, id: Date.now().toString() }]);
    }
    setShowForm(false);
    setEditingEvent(null);
  };

  const handleViewRegistrations = (eventId: string) => {
    setViewingRegistrations(eventId);
  };

  const getEventRegistrations = (eventId: string) => {
    return registrations.filter(r => r.eventId === eventId);
  };

  const handleExportRegistrations = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    const eventRegs = getEventRegistrations(eventId);
    
    if (!event || eventRegs.length === 0) return;

    // Prepare data for Excel
    const headers = [
      t('admin.events.registrations.name'),
      t('admin.events.registrations.phone'),
      t('admin.events.registrations.email'),
      t('admin.events.registrations.tickets'),
      t('admin.events.registrations.payment'),
      t('admin.events.registrations.registrationDate')
    ];

    const data = eventRegs.map(reg => [
      reg.name,
      reg.phone,
      reg.email,
      reg.tickets,
      t(`admin.events.payment.${reg.paymentMethod}`),
      reg.registrationDate
    ]);

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, // Name
      { wch: 15 }, // Phone
      { wch: 25 }, // Email
      { wch: 10 }, // Tickets
      { wch: 20 }, // Payment
      { wch: 15 }, // Date
    ];

    // Style the header row
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = {
        fill: { fgColor: { rgb: "2B5F9E" } },
        font: { bold: true, color: { rgb: "FFFFFF" } },
        alignment: { horizontal: "left", vertical: "center" }
      };
    }

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, language === 'zh' ? '报名信息' : 'Registrations');

    // Generate filename
    const filename = `${event.title[language]}_${language === 'zh' ? '报名信息' : 'Registrations'}_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Download file
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="min-h-screen bg-[#F5EFE6] px-4 sm:px-6 lg:px-8 py-8">
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
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-[#2B5F9E]">{t('admin.events.title')}</h1>
            </div>
            <motion.button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#6BA868] text-white rounded-lg hover:bg-[#5a9157] transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5" />
              <span>{t('admin.events.add')}</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('admin.events.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
            />
          </div>
        </motion.div>

        {/* Events List */}
        <div className="space-y-4">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Event Info */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-[#2B5F9E] text-lg sm:text-xl">
                      {event.title[language]}
                    </h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs ${
                      event.accessType === 'members-only' 
                        ? 'bg-[#EB8C3A] text-white' 
                        : 'bg-[#7BA3C7] text-white'
                    }`}>
                      {event.accessType === 'members-only' 
                        ? t('events.memberOnly') 
                        : t('events.allWelcome')}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{event.description[language]}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">{t('events.date')}:</span>
                      <div className="text-gray-900">{event.date} {event.time}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">{t('events.location')}:</span>
                      <div className="text-gray-900">{event.location}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">{t('events.fee')}:</span>
                      <div className="text-gray-900">
                        ${event.fee}
                        {event.memberFee !== undefined && event.accessType !== 'members-only' && (
                          <span className="text-[#6BA868] ml-2">
                            ({t('events.memberFee')}: ${event.memberFee})
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">{t('events.capacity')}:</span>
                      <div className="text-gray-900">
                        {event.capacity ? event.capacity : t('admin.events.unlimited')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2 lg:justify-center">
                  <button
                    onClick={() => handleViewRegistrations(event.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-[#2B5F9E] text-white rounded-lg hover:bg-[#234a7e] transition-colors flex-1 lg:flex-initial"
                    title={t('admin.events.viewRegistrations')}
                  >
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {t('admin.events.viewRegistrations')} ({getEventRegistrations(event.id).length})
                    </span>
                    <span className="sm:hidden">
                      {getEventRegistrations(event.id).length}
                    </span>
                  </button>
                  <button
                    onClick={() => handleEdit(event)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-[#6BA868] text-white rounded-lg hover:bg-[#5a9157] transition-colors flex-1 lg:flex-initial"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('admin.events.edit')}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex-1 lg:flex-initial"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('admin.events.delete')}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredEvents.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {language === 'zh' ? '没有找到活动' : 'No events found'}
            </div>
          )}
        </div>

        {/* Event Form Modal */}
        {showForm && (
          <EventFormModal
            event={editingEvent}
            onSave={handleSave}
            onClose={() => {
              setShowForm(false);
              setEditingEvent(null);
            }}
          />
        )}

        {/* Registrations Modal */}
        {viewingRegistrations && (
          <RegistrationsModal
            event={events.find(e => e.id === viewingRegistrations)!}
            registrations={getEventRegistrations(viewingRegistrations)}
            onClose={() => setViewingRegistrations(null)}
            onExport={() => handleExportRegistrations(viewingRegistrations)}
          />
        )}
      </div>
    </div>
  );
}

// Event Form Modal Component
function EventFormModal({ event, onSave, onClose }: {
  event: Event | null;
  onSave: (event: Event) => void;
  onClose: () => void;
}) {
  const { language, t } = useLanguage();
  const [formData, setFormData] = useState<Event>(event || {
    id: '',
    title: { zh: '', en: '' },
    description: { zh: '', en: '' },
    date: '',
    time: '',
    location: '',
    fee: 0,
    memberFee: undefined,
    capacity: 50,
    imageType: 'unsplash',
    imageKeyword: '',
    imageUrl: '',
    accessType: 'all-welcome',
  });

  const [showCropper, setShowCropper] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    setFormData({ ...formData, imageUrl: croppedImage, imageType: 'upload' });
    setShowCropper(false);
    setUploadedImage(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Fixed Header */}
        <div className="bg-gradient-to-r from-[#2B5F9E] to-[#6BA868] text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl">
              {event ? t('admin.events.edit') : t('admin.events.add')}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Titles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  {t('admin.events.form.titleZh')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title.zh}
                  onChange={(e) => setFormData({
                    ...formData,
                    title: { ...formData.title, zh: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  {t('admin.events.form.titleEn')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title.en}
                  onChange={(e) => setFormData({
                    ...formData,
                    title: { ...formData.title, en: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                />
              </div>
            </div>

            {/* Descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  {t('admin.events.form.descZh')} *
                </label>
                <textarea
                  required
                  value={formData.description.zh}
                  onChange={(e) => setFormData({
                    ...formData,
                    description: { ...formData.description, zh: e.target.value }
                  })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  {t('admin.events.form.descEn')} *
                </label>
                <textarea
                  required
                  value={formData.description.en}
                  onChange={(e) => setFormData({
                    ...formData,
                    description: { ...formData.description, en: e.target.value }
                  })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                />
              </div>
            </div>

            {/* Date, Time, Location */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  {t('admin.events.form.date')} *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  {t('admin.events.form.time')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="14:00 - 16:00"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  {t('admin.events.form.capacity')}
                </label>
                <input
                  type="number"
                  placeholder={t('admin.events.form.unlimited')}
                  value={formData.capacity || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    capacity: e.target.value ? parseInt(e.target.value) : null
                  })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-gray-700 mb-2">
                {t('admin.events.form.location')} *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
              />
            </div>

            {/* Access Type */}
            <div>
              <label className="block text-gray-700 mb-2">
                {t('admin.events.form.accessType')} *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="accessType"
                    value="all-welcome"
                    checked={formData.accessType === 'all-welcome'}
                    onChange={(e) => setFormData({
                      ...formData,
                      accessType: e.target.value as 'all-welcome' | 'members-only',
                      memberFee: e.target.value === 'all-welcome' ? formData.fee : undefined
                    })}
                    className="w-4 h-4 text-[#2B5F9E]"
                  />
                  <span>{t('admin.events.form.allWelcome')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="accessType"
                    value="members-only"
                    checked={formData.accessType === 'members-only'}
                    onChange={(e) => setFormData({
                      ...formData,
                      accessType: e.target.value as 'all-welcome' | 'members-only',
                      memberFee: undefined
                    })}
                    className="w-4 h-4 text-[#2B5F9E]"
                  />
                  <span>{t('admin.events.form.membersOnly')}</span>
                </label>
              </div>
            </div>

            {/* Fee - Conditional based on accessType */}
            {formData.accessType === 'members-only' ? (
              // Members only - single price
              <div>
                <label className="block text-gray-700 mb-2">
                  {t('admin.events.form.price')} *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.fee}
                  onChange={(e) => setFormData({ ...formData, fee: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                />
              </div>
            ) : (
              // All welcome - member and non-member prices
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">
                    {t('admin.events.form.nonMemberPrice')} *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.fee}
                    onChange={(e) => setFormData({ ...formData, fee: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    {t('admin.events.form.memberPrice')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={formData.fee.toString()}
                    value={formData.memberFee || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      memberFee: e.target.value ? parseFloat(e.target.value) : undefined
                    })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                  />
                </div>
              </div>
            )}

            {/* Image Type Selection */}
            <div>
              <label className="block text-gray-700 mb-2">
                {t('admin.events.form.imageLabel')}
              </label>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="imageType"
                    value="unsplash"
                    checked={formData.imageType === 'unsplash'}
                    onChange={() => setFormData({ ...formData, imageType: 'unsplash' })}
                    className="w-4 h-4 text-[#2B5F9E]"
                  />
                  <span>{t('admin.events.form.unsplash')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="imageType"
                    value="upload"
                    checked={formData.imageType === 'upload'}
                    onChange={() => setFormData({ ...formData, imageType: 'upload' })}
                    className="w-4 h-4 text-[#2B5F9E]"
                  />
                  <span>{t('admin.events.form.uploadImage')}</span>
                </label>
              </div>

              {formData.imageType === 'unsplash' ? (
                <div>
                  <input
                    type="text"
                    placeholder="chinese,new,year,celebration"
                    value={formData.imageKeyword || ''}
                    onChange={(e) => setFormData({ ...formData, imageKeyword: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('admin.events.form.imageHint')}</p>
                </div>
              ) : (
                <div>
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#2B5F9E] transition-colors">
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">{t('admin.events.form.upload')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {formData.imageUrl && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">{t('admin.events.form.imagePreview')}</p>
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Fixed Footer with Buttons */}
          <div className="sticky bottom-0 bg-white pt-6 mt-6 border-t flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('admin.events.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-[#6BA868] text-white rounded-lg hover:bg-[#5a9157] transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {t('admin.events.save')}
            </button>
          </div>
        </form>

        {/* Image Cropper Modal */}
        {showCropper && uploadedImage && (
          <div className="absolute inset-0 bg-white z-10">
            <ImageCropper
              image={uploadedImage}
              onCropComplete={handleCropComplete}
              onCancel={() => {
                setShowCropper(false);
                setUploadedImage(null);
              }}
              aspectRatio={2}
            />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// Registrations Modal Component
function RegistrationsModal({ event, registrations, onClose, onExport }: {
  event: Event;
  registrations: Registration[];
  onClose: () => void;
  onExport: () => void;
}) {
  const { language, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter registrations based on search
  const filteredRegistrations = registrations.filter(reg =>
    reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Fixed Header */}
        <div className="bg-gradient-to-r from-[#2B5F9E] to-[#6BA868] text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl sm:text-2xl">{t('admin.events.registrations.title')}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-white/90">{event.title[language]}</p>
          <p className="text-white/80 text-sm mt-1">
            {t('admin.events.registrations.count')}: {registrations.length}
          </p>
        </div>

        {/* Search and Export Bar */}
        <div className="p-4 border-b bg-gray-50 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('admin.events.registrations.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E] text-sm"
            />
          </div>
          
          {/* Export Button */}
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-[#6BA868] text-white rounded-lg hover:bg-[#5a9157] transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{t('admin.events.registrations.export')}</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredRegistrations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm text-gray-600">
                      {t('admin.events.registrations.name')}
                    </th>
                    <th className="px-4 py-3 text-left text-sm text-gray-600 hidden sm:table-cell">
                      {t('admin.events.registrations.phone')}
                    </th>
                    <th className="px-4 py-3 text-left text-sm text-gray-600 hidden md:table-cell">
                      {t('admin.events.registrations.email')}
                    </th>
                    <th className="px-4 py-3 text-left text-sm text-gray-600">
                      {t('admin.events.registrations.tickets')}
                    </th>
                    <th className="px-4 py-3 text-left text-sm text-gray-600 hidden lg:table-cell">
                      {t('admin.events.registrations.payment')}
                    </th>
                    <th className="px-4 py-3 text-left text-sm text-gray-600 hidden lg:table-cell">
                      {t('admin.events.registrations.registrationDate')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRegistrations.map((reg, index) => (
                    <motion.tr
                      key={reg.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">{reg.name}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">{reg.phone}</td>
                      <td className="px-4 py-3 hidden md:table-cell">{reg.email}</td>
                      <td className="px-4 py-3">{reg.tickets}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className={`px-2.5 py-1 rounded-full text-xs ${
                          reg.paymentMethod === 'card' ? 'bg-blue-100 text-blue-700' :
                          reg.paymentMethod === 'cash' ? 'bg-green-100 text-green-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {t(`admin.events.payment.${reg.paymentMethod}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">{reg.registrationDate}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              {searchTerm ? (
                language === 'zh' ? '没有找到匹配的报名记录' : 'No matching registrations found'
              ) : (
                language === 'zh' ? '暂无报名记录' : 'No registrations yet'
              )}
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="p-6 bg-gray-50 rounded-b-2xl flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            {t('admin.events.registrations.close')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}