class CategorySerializer < ActiveModel::Serializer
  attributes :id, :name, :category_type, :icon, :color, :created_at
end