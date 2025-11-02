import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Tags,
  Sparkles,
  Loader2,
  TrendingUp,
  TrendingDown
} from "./icons";
import { toast } from "sonner";
import { OptimizedMotion } from "./ui/OptimizedMotion";
import { LightMotion } from "./ui/LightMotion";
import categoriesService, { Category } from "../services/categories.service";

interface ManageCategoriesPageProps {
  onBack: () => void;
}

// Цвета для фона иконок категорий
const CATEGORY_COLORS = {
  expense: "#FCA5A5", // светло-красный для расходов
  income: "#86EFAC",  // светло-зелёный для доходов
};

const DEFAULT_EMOJIS = [
  "🍕", "🍔", "🍟", "🍿", "🥗", "🍜", "🍱", "🍛", "☕", "🍰",
  "🚗", "🚕", "🚌", "🚇", "✈️", "🚲", "⛽", "🚦",
  "🏠", "🏡", "🏢", "🏪", "🏦", "🏥", "🏫", "🏛️",
  "💼", "💰", "💳", "💵", "💸", "💎", "🎁", "🛍️",
  "⚡", "💡", "🔥", "💧", "📱", "💻", "🎮", "📚",
  "❤️", "💊", "🏥", "🩺", "💪", "🧘", "🏃",
  "🎓", "✏️", "📝", "🎨", "🎭", "🎪", "🎬", "🎵"
];

export function ManageCategoriesPage({ onBack }: ManageCategoriesPageProps) {
  const { t } = useTranslation('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category_type: "expense" as "income" | "expense",
    icon: "🍕"
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error(t('messages.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!formData.name.trim()) {
      toast.error(t('messages.enterName'));
      return;
    }

    try {
      setActionLoading(true);
      await categoriesService.create({
        name: formData.name.trim(),
        category_type: formData.category_type,
        icon: formData.icon,
        color: CATEGORY_COLORS[formData.category_type]
      });

      await loadCategories();
      resetForm();
      setIsAddDialogOpen(false);
      toast.success(t('messages.created'));
    } catch (error: any) {
      console.error('Failed to create category:', error);
      const errorMessage = error?.response?.data?.errors?.[0] || t('messages.failedToCreate');
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !formData.name.trim()) {
      toast.error(t('messages.enterName'));
      return;
    }

    try {
      setActionLoading(true);
      await categoriesService.update(editingCategory.id.toString(), {
        name: formData.name.trim(),
        category_type: formData.category_type,
        icon: formData.icon,
        color: CATEGORY_COLORS[formData.category_type]
      });

      await loadCategories();
      resetForm();
      setIsEditDialogOpen(false);
      setEditingCategory(null);
      toast.success(t('messages.updated'));
    } catch (error: any) {
      console.error('Failed to update category:', error);
      const errorMessage = error?.response?.data?.errors?.[0] || t('messages.failedToUpdate');
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    try {
      setActionLoading(true);
      await categoriesService.delete(category.id.toString());
      await loadCategories();
      toast.success(t('messages.deleted'));
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      const errorMessage = error?.response?.data?.error || t('messages.failedToDelete');
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category_type: "expense",
      icon: "🍕"
    });
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      category_type: category.category_type,
      icon: category.icon
    });
    setIsEditDialogOpen(true);
  };

  const expenseCategories = categories.filter(c => c.category_type === 'expense');
  const incomeCategories = categories.filter(c => c.category_type === 'income');

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center" style={{ background: 'var(--bg-page-dashboard)' }}>
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 mx-auto text-purple-600 animate-spin" />
          <p className="text-slate-600">{t('loading.categories')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full relative overflow-hidden" style={{ background: 'var(--bg-page-dashboard)' }}>
      {/* Header */}
      <OptimizedMotion className="px-4 py-6 relative overflow-hidden" style={{ background: 'var(--bg-header)' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-y-12 translate-y-8"></div>

        <div className="max-w-md mx-auto relative">
          <div className="flex items-center justify-between">
            <LightMotion whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </LightMotion>
            <div className="flex items-center gap-2">
              <Tags className="w-6 h-6 text-yellow-300" />
              <h1 className="text-white font-medium">{t('categories')}</h1>
            </div>
            <div className="w-8" />
          </div>
        </div>
      </OptimizedMotion>

      <div className="px-4 py-6 max-w-md mx-auto space-y-6 relative z-10">
        {/* Add Button */}
        <LightMotion whileTap={{ scale: 0.98 }}>
          <Button
            onClick={openAddDialog}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 rounded-xl shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('addCategory')}
          </Button>
        </LightMotion>

        {/* Expense Categories */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <h2 className="font-medium text-sm uppercase tracking-wide bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              {t('sections.expenses', { count: expenseCategories.length })}
            </h2>
          </div>
          <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50/30 shadow-sm">
            <CardContent className="p-0">
              {expenseCategories.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  {t('sections.noExpenses')}
                </div>
              ) : (
                expenseCategories.map((category) => (
                  <CategoryItem
                    key={category.id}
                    category={category}
                    onEdit={openEditDialog}
                    onDelete={handleDeleteCategory}
                    actionLoading={actionLoading}
                    t={t}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Income Categories */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h2 className="font-medium text-sm uppercase tracking-wide bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {t('sections.income', { count: incomeCategories.length })}
            </h2>
          </div>
          <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50/30 shadow-sm">
            <CardContent className="p-0">
              {incomeCategories.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  {t('sections.noIncome')}
                </div>
              ) : (
                incomeCategories.map((category) => (
                  <CategoryItem
                    key={category.id}
                    category={category}
                    onEdit={openEditDialog}
                    onDelete={handleDeleteCategory}
                    actionLoading={actionLoading}
                    t={t}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="border-blue-200 bg-gradient-to-br from-white to-blue-50/30">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {t('newCategory')}
            </DialogTitle>
            <DialogDescription>
              {t('dialogs.addDescription')}
            </DialogDescription>
          </DialogHeader>

          <CategoryForm
            formData={formData}
            setFormData={setFormData}
            t={t}
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={actionLoading}
              className="border-blue-300"
            >
              {t('actions.cancel')}
            </Button>
            <Button
              onClick={handleAddCategory}
              disabled={actionLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('actions.creating')}
                </>
              ) : (
                t('actions.create')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="border-blue-200 bg-gradient-to-br from-white to-blue-50/30">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {t('editCategory')}
            </DialogTitle>
            <DialogDescription>
              {t('dialogs.editDescription')}
            </DialogDescription>
          </DialogHeader>

          <CategoryForm
            formData={formData}
            setFormData={setFormData}
            t={t}
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={actionLoading}
              className="border-blue-300"
            >
              {t('actions.cancel')}
            </Button>
            <Button
              onClick={handleEditCategory}
              disabled={actionLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('actions.saving')}
                </>
              ) : (
                t('actions.save')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Компонент элемента категории
interface CategoryItemProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  actionLoading: boolean;
  t: (key: string, params?: any) => string;
}

function CategoryItem({ category, onEdit, onDelete, actionLoading, t }: CategoryItemProps) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-blue-50/50 transition-colors duration-200 border-b last:border-b-0 border-blue-100/50">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm flex-shrink-0"
          style={{ backgroundColor: category.color + '20' }}
        >
          <span className="text-xl">{category.icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-slate-800 truncate">{category.name}</h3>
          <p className="text-xs text-slate-500">
            {category.category_type === 'expense' ? t('types.expense') : t('types.income')}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <LightMotion whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(category)}
            disabled={actionLoading}
            className="text-blue-600 hover:bg-blue-100"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </LightMotion>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <LightMotion whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                disabled={actionLoading}
                className="text-red-600 hover:bg-red-100"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </LightMotion>
          </AlertDialogTrigger>
          <AlertDialogContent className="border-red-200 bg-gradient-to-br from-white to-red-50/30">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-700">
                {t('dialogs.deleteTitle', { name: category.name })}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-red-600">
                {t('dialogs.deleteDescription')}
                {category.category_type === 'expense' && (
                  <p className="mt-2 text-sm">
                    {t('dialogs.hasTransactionsWarning')}
                  </p>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-red-300">
                {t('actions.cancel')}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(category)}
                className="bg-red-600 hover:bg-red-700"
              >
                {t('actions.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// Компонент формы категории
interface CategoryFormProps {
  formData: {
    name: string;
    category_type: "income" | "expense";
    icon: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    category_type: "income" | "expense";
    icon: string;
  }>>;
  t: (key: string, params?: any) => string;
}

function CategoryForm({ formData, setFormData, t }: CategoryFormProps) {
  return (
    <div className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="category-name">{t('fields.nameRequired')}</Label>
        <Input
          id="category-name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={t('placeholders.categoryName')}
          className="border-blue-200 focus:border-blue-400"
        />
      </div>

      {/* Type */}
      <div className="space-y-2">
        <Label>{t('fields.typeRequired')}</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={formData.category_type === 'expense' ? 'default' : 'outline'}
            className={`flex-1 ${
              formData.category_type === 'expense'
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : 'border-red-300 text-red-600'
            }`}
            onClick={() => setFormData({ ...formData, category_type: 'expense' })}
          >
            <TrendingDown className="w-4 h-4 mr-2" />
            {t('types.expense')}
          </Button>
          <Button
            type="button"
            variant={formData.category_type === 'income' ? 'default' : 'outline'}
            className={`flex-1 ${
              formData.category_type === 'income'
                ? 'bg-gradient-to-r from-green-500 to-green-600'
                : 'border-green-300 text-green-600'
            }`}
            onClick={() => setFormData({ ...formData, category_type: 'income' })}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            {t('types.income')}
          </Button>
        </div>
      </div>

      {/* Icon */}
      <div className="space-y-2">
        <Label htmlFor="category-icon">{t('fields.iconRequired')}</Label>
        <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
          <SelectTrigger className="border-purple-200 focus:border-purple-400">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span className="text-xl">{formData.icon}</span>
                <span>{t('fields.icon')}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {DEFAULT_EMOJIS.map((emoji) => (
              <SelectItem key={emoji} value={emoji} className="cursor-pointer justify-center">
                <span className="text-2xl">{emoji}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
