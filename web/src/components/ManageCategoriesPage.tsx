import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
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

const DEFAULT_COLORS = [
  "#EF4444", // red
  "#F97316", // orange
  "#F59E0B", // amber
  "#EAB308", // yellow
  "#84CC16", // lime
  "#22C55E", // green
  "#10B981", // emerald
  "#14B8A6", // teal
  "#06B6D4", // cyan
  "#0EA5E9", // sky
  "#3B82F6", // blue
  "#6366F1", // indigo
  "#8B5CF6", // violet
  "#A855F7", // purple
  "#D946EF", // fuchsia
  "#EC4899", // pink
];

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category_type: "expense" as "income" | "expense",
    icon: "🍕",
    color: DEFAULT_COLORS[0]
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
      toast.error('Не удалось загрузить категории');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!formData.name.trim()) {
      toast.error("Введите название категории");
      return;
    }

    try {
      setActionLoading(true);
      await categoriesService.create({
        name: formData.name.trim(),
        category_type: formData.category_type,
        icon: formData.icon,
        color: formData.color
      });

      await loadCategories();
      resetForm();
      setIsAddDialogOpen(false);
      toast.success("Категория создана!");
    } catch (error: any) {
      console.error('Failed to create category:', error);
      const errorMessage = error?.response?.data?.errors?.[0] || "Не удалось создать категорию";
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !formData.name.trim()) {
      toast.error("Введите название категории");
      return;
    }

    try {
      setActionLoading(true);
      await categoriesService.update(editingCategory.id.toString(), {
        name: formData.name.trim(),
        category_type: formData.category_type,
        icon: formData.icon,
        color: formData.color
      });

      await loadCategories();
      resetForm();
      setIsEditDialogOpen(false);
      setEditingCategory(null);
      toast.success("Категория обновлена!");
    } catch (error: any) {
      console.error('Failed to update category:', error);
      const errorMessage = error?.response?.data?.errors?.[0] || "Не удалось обновить категорию";
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
      toast.success("Категория удалена!");
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      const errorMessage = error?.response?.data?.error || "Не удалось удалить категорию";
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category_type: "expense",
      icon: "🍕",
      color: DEFAULT_COLORS[0]
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
      icon: category.icon,
      color: category.color
    });
    setIsEditDialogOpen(true);
  };

  const expenseCategories = categories.filter(c => c.category_type === 'expense');
  const incomeCategories = categories.filter(c => c.category_type === 'income');

  if (loading) {
    return (
      <div className="min-h-full bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 mx-auto text-purple-600 animate-spin" />
          <p className="text-slate-600">Загрузка категорий...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-purple-50 via-white to-blue-50 relative overflow-hidden">
      {/* Header */}
      <OptimizedMotion className="bg-gradient-to-br from-purple-500 to-pink-600 px-4 py-6 relative overflow-hidden">
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
              <h1 className="text-white font-medium">Категории</h1>
              <Sparkles className="w-5 h-5 text-yellow-300" />
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
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 rounded-xl shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Добавить категорию
          </Button>
        </LightMotion>

        {/* Expense Categories */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <h2 className="font-medium text-sm uppercase tracking-wide bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              Расходы ({expenseCategories.length})
            </h2>
          </div>
          <Card className="border-purple-200 bg-gradient-to-br from-white to-purple-50/30 shadow-sm">
            <CardContent className="p-0">
              {expenseCategories.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  Нет категорий расходов
                </div>
              ) : (
                expenseCategories.map((category) => (
                  <CategoryItem
                    key={category.id}
                    category={category}
                    onEdit={openEditDialog}
                    onDelete={handleDeleteCategory}
                    actionLoading={actionLoading}
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
              Доходы ({incomeCategories.length})
            </h2>
          </div>
          <Card className="border-purple-200 bg-gradient-to-br from-white to-purple-50/30 shadow-sm">
            <CardContent className="p-0">
              {incomeCategories.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  Нет категорий доходов
                </div>
              ) : (
                incomeCategories.map((category) => (
                  <CategoryItem
                    key={category.id}
                    category={category}
                    onEdit={openEditDialog}
                    onDelete={handleDeleteCategory}
                    actionLoading={actionLoading}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="border-purple-200 bg-gradient-to-br from-white to-purple-50/30">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Новая категория
            </DialogTitle>
            <DialogDescription>
              Создайте новую категорию для классификации операций
            </DialogDescription>
          </DialogHeader>

          <CategoryForm
            formData={formData}
            setFormData={setFormData}
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={actionLoading}
              className="border-purple-300"
            >
              Отмена
            </Button>
            <Button
              onClick={handleAddCategory}
              disabled={actionLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Создание...
                </>
              ) : (
                "Создать"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="border-purple-200 bg-gradient-to-br from-white to-purple-50/30">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Редактировать категорию
            </DialogTitle>
            <DialogDescription>
              Измените параметры категории
            </DialogDescription>
          </DialogHeader>

          <CategoryForm
            formData={formData}
            setFormData={setFormData}
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={actionLoading}
              className="border-purple-300"
            >
              Отмена
            </Button>
            <Button
              onClick={handleEditCategory}
              disabled={actionLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                "Сохранить"
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
}

function CategoryItem({ category, onEdit, onDelete, actionLoading }: CategoryItemProps) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-purple-50/50 transition-colors duration-200 border-b last:border-b-0 border-purple-100/50">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
          style={{ backgroundColor: category.color + '20' }}
        >
          <span className="text-xl">{category.icon}</span>
        </div>
        <div>
          <h3 className="font-medium text-slate-800">{category.name}</h3>
          <p className="text-xs text-slate-500">
            {category.category_type === 'expense' ? 'Расход' : 'Доход'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <LightMotion whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(category)}
            disabled={actionLoading}
            className="text-purple-600 hover:bg-purple-100"
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
                Удалить категорию "{category.name}"?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-red-600">
                Это действие нельзя отменить. Категория будет удалена навсегда.
                {category.category_type === 'expense' && (
                  <p className="mt-2 text-sm">
                    Если к этой категории привязаны транзакции, удаление будет невозможно.
                  </p>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-red-300">
                Отмена
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(category)}
                className="bg-red-600 hover:bg-red-700"
              >
                Удалить
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
    color: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    category_type: "income" | "expense";
    icon: string;
    color: string;
  }>>;
}

function CategoryForm({ formData, setFormData }: CategoryFormProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <div className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="category-name">Название *</Label>
        <Input
          id="category-name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Название категории"
          className="border-purple-200 focus:border-purple-400"
        />
      </div>

      {/* Type */}
      <div className="space-y-2">
        <Label>Тип категории *</Label>
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
            Расход
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
            Доход
          </Button>
        </div>
      </div>

      {/* Icon */}
      <div className="space-y-2">
        <Label>Иконка *</Label>
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="w-full p-3 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors flex items-center gap-3"
        >
          <span className="text-2xl">{formData.icon}</span>
          <span className="text-slate-600">Выберите иконку</span>
        </button>

        {showEmojiPicker && (
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-40 overflow-y-auto p-2 border border-purple-200 rounded-lg bg-white shadow-lg">
            {DEFAULT_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-lg sm:text-xl transition-all ${
                  formData.icon === emoji
                    ? 'bg-purple-200 ring-2 ring-purple-500'
                    : 'hover:bg-purple-100'
                }`}
                onClick={() => {
                  setFormData({ ...formData, icon: emoji });
                  setShowEmojiPicker(false);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Color */}
      <div className="space-y-2">
        <Label>Цвет *</Label>
        <button
          type="button"
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="w-full p-3 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors flex items-center gap-3"
        >
          <div
            className="w-8 h-8 rounded-lg"
            style={{ backgroundColor: formData.color }}
          />
          <span className="text-slate-600">Выберите цвет</span>
        </button>

        {showColorPicker && (
          <div className="grid grid-cols-8 gap-1.5 p-2 border border-purple-200 rounded-lg bg-white shadow-lg">
            {DEFAULT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`w-8 h-8 rounded-lg transition-all ${
                  formData.color === color
                    ? 'ring-2 ring-purple-500 ring-offset-1'
                    : 'hover:scale-110'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => {
                  setFormData({ ...formData, color });
                  setShowColorPicker(false);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
