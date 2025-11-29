import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Shield,
  User,
  Plus,
  Trash2,
  Search,
  Mail,
  Calendar,
  Crown,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  fetchAdminAccounts,
  createAdminAccount,
  deleteAdminAccount,
  type AdminAccountRecord,
} from "../lib/supabaseApi";

export function AdminAccounts() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] =
    useState<AdminAccountRecord | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [accounts, setAccounts] = useState<AdminAccountRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Current user role (from sessionStorage)
  const currentUserRole =
    (sessionStorage.getItem("adminRole") as "owner" | "admin") || "admin";

  // Form state for creating new account
  const [newAccount, setNewAccount] = useState({
    username: "",
    email: "",
    password: "",
    role: "admin" as "admin" | "owner",
  });

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchAdminAccounts()
      .then((data) => {
        if (active) setAccounts(data);
      })
      .catch(() => {
        if (active) setError(t("common.error"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [t]);

  const filteredAccounts = accounts.filter(
    (account) =>
      account.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteAccount = async () => {
    if (!selectedAccount) return;
    setError(null);
    try {
      await deleteAdminAccount(selectedAccount.id);
      setAccounts((prev) => prev.filter((a) => a.id !== selectedAccount.id));
      setSuccess(t("admin.accounts.deleteDialog.confirm"));
    } catch (err) {
      const msg =
        (err as Error).message === "forbidden"
          ? language === "zh"
            ? "无法删除站长账号"
            : "Cannot delete owner account"
          : t("common.error");
      setError(msg);
    } finally {
      setDeleteDialogOpen(false);
      setSelectedAccount(null);
      setTimeout(() => setSuccess(null), 2500);
    }
  };

  const handleCreateAccount = async () => {
    setError(null);
    try {
      const account = await createAdminAccount({
        username: newAccount.username,
        email: newAccount.email,
        password: newAccount.password,
        role: newAccount.role,
      });
      setAccounts((prev) => [...prev, account]);
      setSuccess(t("admin.accounts.createDialog.create"));
      setCreateDialogOpen(false);
      setNewAccount({ username: "", email: "", password: "", role: "admin" });
    } catch (err) {
      const duplicateMsg =
        language === "zh"
          ? "用户名或邮箱已存在"
          : "Username or email already exists";
      const msg =
        (err as Error).message === "duplicate"
          ? duplicateMsg
          : t("common.error");
      setError(msg);
    } finally {
      setTimeout(() => setSuccess(null), 2500);
    }
  };

  const canManageAccount = (account: AdminAccountRecord) => {
    // Owner can manage all accounts except themselves
    // Admin cannot manage any accounts
    if (currentUserRole !== "owner") return false;
    if (account.role === "owner") return false; // Cannot delete owner accounts
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/admin/dashboard")}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("common.back")}
              </Button>
              <h1 className="text-[#2B5F9E]">{t("admin.accounts.title")}</h1>
            </div>
            {currentUserRole === "owner" && (
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="bg-[#2B5F9E] hover:bg-[#234a7e] gap-2"
              >
                <Plus className="w-4 h-4" />
                {t("admin.accounts.createAccount")}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <p className="text-gray-600 mb-4">{t("common.loading")}</p>
        )}
        {error && (
          <p className="text-red-600 mb-4" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="text-green-700 mb-4" role="status">
            {success}
          </p>
        )}

        {/* Permission Notice */}
        {currentUserRole !== "owner" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 text-amber-800">
              <Lock className="w-5 h-5" />
              <p className="text-sm">{t("admin.accounts.viewOnlyNotice")}</p>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#2B5F9E]/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#2B5F9E]" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">
                  {t("admin.accounts.totalAccounts")}
                </p>
                <p className="text-3xl text-[#2B5F9E]">{accounts.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#EB8C3A]/20 flex items-center justify-center">
                <Crown className="w-6 h-6 text-[#EB8C3A]" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">
                  {t("admin.accounts.owners")}
                </p>
                <p className="text-3xl text-[#EB8C3A]">
                  {accounts.filter((a) => a.role === "owner").length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#6BA868]/20 flex items-center justify-center">
                <User className="w-6 h-6 text-[#6BA868]" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">
                  {t("admin.accounts.admins")}
                </p>
                <p className="text-3xl text-[#6BA868]">
                  {accounts.filter((a) => a.role === "admin").length}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder={t("admin.accounts.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Accounts Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">
                    {t("admin.accounts.table.username")}
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">
                    {t("admin.accounts.table.email")}
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">
                    {t("admin.accounts.table.role")}
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">
                    {t("admin.accounts.table.createdAt")}
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">
                    {t("admin.accounts.table.lastLogin")}
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">
                    {t("admin.accounts.table.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <AnimatePresence mode="popLayout">
                  {filteredAccounts.map((account) => (
                    <motion.tr
                      key={account.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {account.role === "owner" ? (
                            <Crown className="w-4 h-4 text-[#EB8C3A]" />
                          ) : (
                            <User className="w-4 h-4 text-[#6BA868]" />
                          )}
                          <span className="text-gray-900">
                            {account.username}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>{account.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            account.role === "owner"
                              ? "bg-[#EB8C3A]/20 text-[#EB8C3A]"
                              : "bg-[#6BA868]/20 text-[#6BA868]"
                          }`}
                        >
                          {account.role === "owner"
                            ? t("admin.accounts.role.owner")
                            : t("admin.accounts.role.admin")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>{account.created_at?.slice(0, 10) ?? "-"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {account.last_login_at?.slice(0, 10) ?? "-"}
                      </td>
                      <td className="px-6 py-4">
                        {canManageAccount(account) ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAccount(account);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {filteredAccounts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {t("admin.accounts.noResults")}
            </div>
          )}
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6"
        >
          <h3 className="text-[#2B5F9E] mb-3">
            {t("admin.accounts.permissionInfo.title")}
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• {t("admin.accounts.permissionInfo.owner1")}</li>
            <li>• {t("admin.accounts.permissionInfo.owner2")}</li>
            <li>• {t("admin.accounts.permissionInfo.admin1")}</li>
            <li>• {t("admin.accounts.permissionInfo.admin2")}</li>
          </ul>
        </motion.div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("admin.accounts.deleteDialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.accounts.deleteDialog.description").replace(
                "{username}",
                selectedAccount?.username || ""
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("admin.members.confirm.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700"
            >
              {t("admin.accounts.deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Account Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("admin.accounts.createDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("admin.accounts.createDialog.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">
                {t("admin.accounts.form.username")}
              </Label>
              <Input
                id="username"
                placeholder={t("admin.accounts.form.usernamePlaceholder")}
                value={newAccount.username}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, username: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("admin.accounts.form.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("admin.accounts.form.emailPlaceholder")}
                value={newAccount.email}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                {t("admin.accounts.form.password")}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("admin.accounts.form.passwordPlaceholder")}
                  value={newAccount.password}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                {t("admin.accounts.form.passwordHelp")}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">{t("admin.accounts.form.role")}</Label>
              <Select
                value={newAccount.role}
                onValueChange={(value: "admin" | "owner") =>
                  setNewAccount({ ...newAccount, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    {t("admin.accounts.role.admin")}
                  </SelectItem>
                  <SelectItem value="owner">
                    {t("admin.accounts.role.owner")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false);
                setNewAccount({
                  username: "",
                  email: "",
                  password: "",
                  role: "admin",
                });
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleCreateAccount}
              disabled={
                !newAccount.username ||
                !newAccount.email ||
                !newAccount.password
              }
              className="bg-[#2B5F9E] hover:bg-[#234a7e]"
            >
              {t("admin.accounts.createDialog.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
