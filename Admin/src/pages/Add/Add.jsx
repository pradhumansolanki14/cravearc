import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiPlus, FiCamera, FiTrash2, FiTag, FiClock, FiActivity, FiEye, FiCheck } from "react-icons/fi";
import { Card, Button, Input, Select } from "../../components/ui";

const CATEGORIES = ["Salad", "Rolls", "Deserts", "Sandwich", "Cake", "Pure Veg", "Pasta", "Noodles"];

const categoryEmoji = {
  Salad: "🥗", Rolls: "🌯", Deserts: "🍰", Sandwich: "🥪",
  Cake: "🎂", "Pure Veg": "🥦", Pasta: "🍝", Noodles: "🍜",
};

const Add = ({ url }) => {
  const [image, setImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ 
    name: "", 
    description: "", 
    price: "", 
    category: "Salad",
    preparationTime: "20",
    isVeg: false,
    calories: "",
    tags: ""
  });

  const onChangeHandler = (e) => {
    const { name, value, type, checked } = e.target;
    setData(d => ({ 
      ...d, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (!image) {
      toast.error("Dish photo is required");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", Number(data.price));
    formData.append("category", data.category);
    formData.append("image", image);
    
    // Add additional backend fields
    formData.append("preparationTime", Number(data.preparationTime));
    formData.append("isVeg", data.isVeg);
    if (data.calories) formData.append("calories", Number(data.calories));
    if (data.tags) {
      const parsedTags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
      parsedTags.forEach(t => formData.append("tags", t));
    }

    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.post(`${url}/api/food/add`, formData, { headers: { token } });
      if (response.data.success) {
        setData({ 
          name: "", 
          description: "", 
          price: "", 
          category: "Salad",
          preparationTime: "20",
          isVeg: false,
          calories: "",
          tags: ""
        });
        setImage(false);
        toast.success(response.data.message || "Dish successfully created!");
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      toast.error("Could not add new food item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl animate-fadeUp">
      
      {/* ── Page Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100/35 flex items-center justify-center text-emerald-600">
            <FiPlus size={18} />
          </div>
          <div>
            <h1 className="font-poppins font-extrabold text-2xl text-slate-900 tracking-tight">Add New Dish</h1>
            <p className="text-slate-400 text-xs font-semibold">Expose new items to your restaurant catalog</p>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmitHandler} className="space-y-6">
        
        {/* Image upload */}
        <Card variant="default" radius="2xl" padding="lg" className="border border-slate-100 shadow-sm">
          <label className="text-[10px] font-bold text-slate-405 uppercase tracking-widest block mb-4">Dish Photo *</label>
          
          <label htmlFor="image" className="cursor-pointer block">
            <div className={`relative w-full h-48 rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden group ${
              image ? 'border-emerald-305 bg-emerald-50/5' : 'border-slate-205 hover:border-emerald-450 bg-slate-50/50 hover:bg-emerald-50/10'
            }`}>
              {image ? (
                <>
                  <img src={URL.createObjectURL(image)} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-bold uppercase tracking-wider">Change photo</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                  <div className="w-12 h-12 rounded-xl bg-slate-100/50 flex items-center justify-center text-slate-400 border border-slate-200/50">
                    <FiCamera size={20} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Drop photo or browse</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">PNG, JPG or WEBP up to 5MB</p>
                  </div>
                </div>
              )}
            </div>
          </label>
          <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden accept="image/*" />
          
          {image && (
            <button 
              type="button" 
              onClick={() => setImage(false)}
              className="mt-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-500 hover:text-rose-700 transition-colors p-1"
            >
              <FiTrash2 size={12} />
              <span>Remove photo</span>
            </button>
          )}
        </Card>

        {/* Basic description */}
        <Card variant="default" radius="2xl" padding="lg" className="border border-slate-100 shadow-sm space-y-4">
          <h2 className="font-poppins font-bold text-slate-850 text-sm uppercase tracking-wider pb-2 border-b border-slate-50">Dish Details</h2>
          
          <Input
            label="Dish Name"
            name="name"
            required
            onChange={onChangeHandler}
            value={data.name}
            placeholder="e.g. Grilled Caesar Salad"
          />

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Description *</label>
            <textarea 
              name="description"
              required
              onChange={onChangeHandler}
              value={data.description}
              rows={3} 
              className="w-full px-4 py-3 bg-white border-2 border-slate-100 focus:border-emerald-455 rounded-2xl text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-300 resize-none"
              placeholder="Describe the ingredients, flavor profile, and portion sizing..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              name="category"
              value={data.category}
              onChange={onChangeHandler}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{categoryEmoji[cat] || "🍔"} {cat}</option>
              ))}
            </Select>
            <Input
              label="Price (USD)"
              name="price"
              required
              type="number"
              min="0.5"
              step="0.01"
              onChange={onChangeHandler}
              value={data.price}
              placeholder="0.00"
            />
          </div>
        </Card>

        {/* Exposing Additional details */}
        <Card variant="default" radius="2xl" padding="lg" className="border border-slate-100 shadow-sm space-y-4">
          <h2 className="font-poppins font-bold text-slate-850 text-sm uppercase tracking-wider pb-2 border-b border-slate-50">Additional Attributes</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Prep Time (minutes)"
              name="preparationTime"
              type="number"
              min="1"
              leftIcon={<FiClock size={14} />}
              onChange={onChangeHandler}
              value={data.preparationTime}
            />
            <Input
              label="Calories (kcal)"
              name="calories"
              type="number"
              min="0"
              leftIcon={<FiActivity size={14} />}
              onChange={onChangeHandler}
              value={data.calories}
              placeholder="e.g. 350"
            />
          </div>

          <Input
            label="Tags (comma-separated)"
            name="tags"
            leftIcon={<FiTag size={14} />}
            onChange={onChangeHandler}
            value={data.tags}
            placeholder="e.g. Spicy, Recommended, Chef Special"
          />

          {/* Veg/Non-veg toggle selector */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-150/45 rounded-2xl">
            <div>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">Pure Vegetarian Indicator</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Is this dish fully vegetarian-compliant?</p>
            </div>
            <button 
              type="button"
              onClick={() => setData(d => ({ ...d, isVeg: !d.isVeg }))}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border ${
                data.isVeg 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                  : "bg-slate-100 border-slate-200 text-slate-500"
              }`}
            >
              <div className={`relative w-8 h-4 rounded-full transition-colors ${data.isVeg ? "bg-emerald-500" : "bg-slate-350"}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${data.isVeg ? "translate-x-4.5" : "translate-x-0.5"}`} />
              </div>
              <span>{data.isVeg ? "Veg" : "Non-Veg"}</span>
            </button>
          </div>
        </Card>

        {/* Submit */}
        <Button 
          type="submit" 
          disabled={loading}
          variant="primary"
          size="lg"
          className="w-full font-bold shadow-emerald-lg h-12.5"
        >
          {loading ? "Adding to Menu..." : "Add to Catalog Menu"}
        </Button>
      </form>
    </div>
  );
};

export default Add;
