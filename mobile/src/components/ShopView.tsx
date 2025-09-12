import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ShoppingBag, 
  Star, 
  Heart, 
  Filter,
  Search,
  MapPin,
  Phone,
  Clock,
  Award,
  Truck,
  Shield,
  CreditCard,
  Package,
  Scissors,
  Stethoscope,
  GraduationCap,
  Home,
  Camera,
  Utensils
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  brand: string;
  inStock: boolean;
  description: string;
  features: string[];
}

interface Service {
  id: string;
  name: string;
  provider: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  location: string;
  phone: string;
  hours: string;
  description: string;
  services: string[];
}

export const ShopView: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'products' | 'services'>('products');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const productCategories = [
    { id: 'all', name: 'All Products', icon: Package },
    { id: 'food', name: 'Food & Treats', icon: Utensils },
    { id: 'toys', name: 'Toys & Play', icon: Heart },
    { id: 'health', name: 'Health & Care', icon: Shield },
    { id: 'accessories', name: 'Accessories', icon: Award },
    { id: 'grooming', name: 'Grooming', icon: Scissors },
  ];

  const serviceCategories = [
    { id: 'all', name: 'All Services', icon: Package },
    { id: 'veterinary', name: 'Veterinary', icon: Stethoscope },
    { id: 'grooming', name: 'Grooming', icon: Scissors },
    { id: 'training', name: 'Training', icon: GraduationCap },
    { id: 'boarding', name: 'Boarding', icon: Home },
    { id: 'photography', name: 'Photography', icon: Camera },
  ];

  const products: Product[] = [
    {
      id: '1',
      name: 'Premium Dog Food - Chicken & Rice',
      price: 45.99,
      originalPrice: 52.99,
      rating: 4.8,
      reviews: 1247,
      image: 'https://images.pexels.com/photos/1254140/pexels-photo-1254140.jpeg',
      category: 'food',
      brand: 'Royal Canin',
      inStock: true,
      description: 'High-quality nutrition for adult dogs with real chicken as the first ingredient.',
      features: ['Real Chicken', 'No Fillers', 'Grain-Free', 'Vet Recommended']
    },
    {
      id: '2',
      name: 'Interactive Puzzle Toy',
      price: 24.99,
      rating: 4.6,
      reviews: 892,
      image: 'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg',
      category: 'toys',
      brand: 'Nina Ottosson',
      inStock: true,
      description: 'Mental stimulation puzzle toy to keep your dog engaged and entertained.',
      features: ['Mental Stimulation', 'Durable', 'Easy to Clean', 'Multiple Difficulty Levels']
    },
    {
      id: '3',
      name: 'GPS Dog Collar Tracker',
      price: 129.99,
      originalPrice: 149.99,
      rating: 4.7,
      reviews: 634,
      image: 'https://images.pexels.com/photos/1629781/pexels-photo-1629781.jpeg',
      category: 'accessories',
      brand: 'Whistle',
      inStock: true,
      description: 'Real-time GPS tracking with health monitoring and activity tracking.',
      features: ['GPS Tracking', 'Health Monitoring', 'Waterproof', 'Long Battery Life']
    },
  ];

  const services: Service[] = [
    {
      id: '1',
      name: 'Sofia Veterinary Clinic',
      provider: 'Dr. Maria Petrova',
      price: 50,
      rating: 4.9,
      reviews: 342,
      image: 'https://images.pexels.com/photos/6235663/pexels-photo-6235663.jpeg',
      category: 'veterinary',
      location: 'Sofia Center, Bulgaria',
      phone: '+359 2 123 4567',
      hours: 'Mon-Fri: 8AM-8PM, Sat: 9AM-5PM',
      description: 'Full-service veterinary clinic with modern equipment and experienced staff.',
      services: ['General Checkups', 'Vaccinations', 'Surgery', 'Emergency Care', 'Dental Care']
    },
    {
      id: '2',
      name: 'Paws & Claws Grooming',
      provider: 'Elena Dimitrova',
      price: 35,
      rating: 4.7,
      reviews: 189,
      image: 'https://images.pexels.com/photos/6568461/pexels-photo-6568461.jpeg',
      category: 'grooming',
      location: 'Plovdiv, Bulgaria',
      phone: '+359 32 987 6543',
      hours: 'Tue-Sat: 9AM-6PM',
      description: 'Professional dog grooming with personalized care for every breed.',
      services: ['Full Grooming', 'Nail Trimming', 'Ear Cleaning', 'Teeth Brushing', 'Flea Treatment']
    },
  ];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.provider.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const currentCategories = activeTab === 'products' ? productCategories : serviceCategories;
  const currentItems = activeTab === 'products' ? filteredProducts : filteredServices;

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blueblue-600 to-light-bluelight-blue-600 bg-clip-text text-transparent">
          Shop & Services
        </h2>
        <p className="text-gray-600">Everything your dog needs</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search products & services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blueblue-500 bg-white/80 backdrop-blur-sm"
        />
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
            activeTab === 'products'
              ? 'bg-white text-blueblue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ShoppingBag size={16} />
          <span>Products</span>
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
            activeTab === 'services'
              ? 'bg-white text-blueblue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Stethoscope size={16} />
          <span>Services</span>
        </button>
      </div>

      {/* Categories */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {currentCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-xl whitespace-nowrap transition-all duration-200 ${
              selectedCategory === category.id
                ? 'bg-gradient-to-r from-blueblue-500 to-light-bluelight-blue-500 text-white shadow-lg'
                : 'bg-white/60 text-gray-700 hover:bg-white/80 border border-white/30'
            }`}
          >
            <category.icon size={14} />
            <span className="text-sm font-medium">{category.name}</span>
          </button>
        ))}
      </div>

      {/* Special Offer Banner */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
        <div className="relative">
          <h3 className="text-lg font-bold mb-2">🎉 Special Offer!</h3>
          <p className="text-white/90 mb-3 text-sm">
            Get 20% off your first order with code <span className="font-bold">EDOG20</span>
          </p>
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center">
              <Truck size={12} className="mr-1" />
              Free Delivery
            </div>
            <div className="flex items-center">
              <Shield size={12} className="mr-1" />
              Quality Guaranteed
            </div>
          </div>
        </div>
      </Card>

      {/* Content */}
      {activeTab === 'products' ? (
        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="flex space-x-4">
                <div className="relative flex-shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-xl"
                  />
                  {product.originalPrice && (
                    <div className="absolute top-1 left-1 bg-red-500 text-white px-1 py-0.5 rounded text-xs font-bold">
                      SALE
                    </div>
                  )}
                  <button className="absolute top-1 right-1 w-6 h-6 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Heart size={12} className="text-gray-600" />
                  </button>
                </div>
                
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{product.name}</h3>
                    <p className="text-xs text-gray-500">{product.brand}</p>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">({product.reviews})</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <span className="text-lg font-bold text-gray-900">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-xs text-gray-500 line-through">${product.originalPrice}</span>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      disabled={!product.inStock}
                      className="bg-gradient-to-r from-blueblue-500 to-light-bluelight-blue-500"
                    >
                      {product.inStock ? 'Add to Cart' : 'Sold Out'}
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {product.features.slice(0, 2).map((feature, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredServices.map((service) => (
            <Card key={service.id} className="overflow-hidden">
              <div className="flex space-x-4">
                <div className="relative flex-shrink-0">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-20 h-20 object-cover rounded-xl"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center border-2 border-white">
                    <Shield size={8} className="text-white" />
                  </div>
                </div>
                
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{service.name}</h3>
                    <p className="text-xs text-gray-600">{service.provider}</p>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < Math.floor(service.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">({service.reviews})</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-xs text-gray-600">
                    <div className="flex items-center">
                      <MapPin size={10} className="mr-1" />
                      {service.location}
                    </div>
                    <div className="flex items-center">
                      <Phone size={10} className="mr-1" />
                      {service.phone}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-gray-900">
                      ${service.price}<span className="text-xs font-normal text-gray-500">/session</span>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="outline" size="sm" className="text-xs px-2 py-1">
                        Contact
                      </Button>
                      <Button size="sm" className="bg-gradient-to-r from-blueblue-500 to-light-bluelight-blue-500 text-xs px-2 py-1">
                        Book
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {service.services.slice(0, 2).map((serviceItem, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        {serviceItem}
                      </span>
                    ))}
                    {service.services.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{service.services.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {currentItems.length === 0 && (
        <Card className="text-center py-12">
          <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">
            No {activeTab === 'products' ? 'products' : 'services'} found
          </p>
          <Button onClick={() => {
            setSearchTerm('');
            setSelectedCategory('all');
          }}>
            Clear Filters
          </Button>
        </Card>
      )}
    </div>
  );
};