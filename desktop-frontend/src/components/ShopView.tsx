import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ShoppingBag, 
  Star, 
  Heart, 
  Filter,
  Search,
  ArrowLeft,
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
import { Input } from './ui/Input';

interface ShopViewProps {
  onNavigate: (view: string) => void;
}

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

export const ShopView: React.FC<ShopViewProps> = ({ onNavigate }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'products' | 'services'>('products');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');

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
    {
      id: '4',
      name: 'Professional Grooming Kit',
      price: 89.99,
      rating: 4.5,
      reviews: 456,
      image: 'https://images.pexels.com/photos/6568461/pexels-photo-6568461.jpeg',
      category: 'grooming',
      brand: 'Andis',
      inStock: false,
      description: 'Complete grooming kit with clippers, brushes, and accessories.',
      features: ['Professional Grade', 'Multiple Attachments', 'Quiet Motor', 'Easy Maintenance']
    },
    {
      id: '5',
      name: 'Orthopedic Dog Bed',
      price: 79.99,
      originalPrice: 99.99,
      rating: 4.9,
      reviews: 1823,
      image: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg',
      category: 'accessories',
      brand: 'PetFusion',
      inStock: true,
      description: 'Memory foam bed designed for joint support and comfort.',
      features: ['Memory Foam', 'Waterproof', 'Machine Washable', 'Joint Support']
    },
    {
      id: '6',
      name: 'Dental Care Chews',
      price: 19.99,
      rating: 4.4,
      reviews: 723,
      image: 'https://images.pexels.com/photos/1254140/pexels-photo-1254140.jpeg',
      category: 'health',
      brand: 'Greenies',
      inStock: true,
      description: 'Dental chews that help clean teeth and freshen breath naturally.',
      features: ['Dental Health', 'Natural Ingredients', 'Vet Approved', 'Multiple Sizes']
    }
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
    {
      id: '3',
      name: 'Canine Academy Training',
      provider: 'Ivan Georgiev',
      price: 80,
      rating: 4.8,
      reviews: 267,
      image: 'https://images.pexels.com/photos/1254140/pexels-photo-1254140.jpeg',
      category: 'training',
      location: 'Varna, Bulgaria',
      phone: '+359 52 456 7890',
      hours: 'Mon-Sun: 7AM-7PM',
      description: 'Professional dog training with positive reinforcement methods.',
      services: ['Basic Obedience', 'Advanced Training', 'Behavioral Issues', 'Puppy Classes', 'Agility Training']
    },
    {
      id: '4',
      name: 'Happy Tails Boarding',
      provider: 'Petya Stoyanova',
      price: 25,
      rating: 4.6,
      reviews: 156,
      image: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg',
      category: 'boarding',
      location: 'Burgas, Bulgaria',
      phone: '+359 56 234 5678',
      hours: '24/7 Drop-off: 8AM-6PM',
      description: 'Safe and comfortable boarding facility with 24/7 supervision.',
      services: ['Overnight Boarding', 'Daycare', 'Exercise Programs', 'Medication Administration', 'Special Diets']
    },
    {
      id: '5',
      name: 'Pawsome Photography',
      provider: 'Nikolay Petrov',
      price: 120,
      rating: 4.9,
      reviews: 98,
      image: 'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg',
      category: 'photography',
      location: 'Sofia, Bulgaria',
      phone: '+359 88 123 4567',
      hours: 'By Appointment',
      description: 'Professional pet photography sessions to capture your dog\'s personality.',
      services: ['Studio Sessions', 'Outdoor Shoots', 'Action Photography', 'Portrait Sessions', 'Event Photography']
    }
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
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-3 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-white/50 transition-all duration-200"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl font-bold gradient-text">Shop & Services</h2>
            <p className="text-gray-600">Everything your dog needs, delivered to your door</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products & services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 p-2 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30">
        <button
          onClick={() => setActiveTab('products')}
          className={`tab-button flex items-center space-x-2 ${activeTab === 'products' ? 'active' : ''}`}
        >
          <ShoppingBag size={16} />
          <span>Products</span>
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`tab-button flex items-center space-x-2 ${activeTab === 'services' ? 'active' : ''}`}
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
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-200 ${
              selectedCategory === category.id
                ? 'bg-gradient-to-r from-primary-500 to-blue-500 text-white shadow-lg'
                : 'bg-white/60 text-gray-700 hover:bg-white/80 border border-white/30'
            }`}
          >
            <category.icon size={16} />
            <span className="text-sm font-medium">{category.name}</span>
          </button>
        ))}
      </div>

      {/* Filters & Sort */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" icon={<Filter size={16} />}>
            Filters
          </Button>
          <span className="text-sm text-gray-600">
            {currentItems.length} {activeTab === 'products' ? 'products' : 'services'} found
          </span>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="popular">Most Popular</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {/* Content */}
      {activeTab === 'products' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} variant="gradient" className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-xl mb-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.originalPrice && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    SALE
                  </div>
                )}
                <button className="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                  <Heart size={16} className="text-gray-600 hover:text-red-500" />
                </button>
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500">{product.brand}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({product.reviews})</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">${product.price}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    disabled={!product.inStock}
                    icon={<ShoppingBag size={14} />}
                  >
                    {product.inStock ? 'Add to Cart' : 'Sold Out'}
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {product.features.slice(0, 2).map((feature, index) => (
                    <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredServices.map((service) => (
            <Card key={service.id} variant="gradient" className="group cursor-pointer">
              <div className="flex space-x-4">
                <div className="relative flex-shrink-0">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-24 h-24 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center border-2 border-white">
                    <Shield size={12} className="text-white" />
                  </div>
                </div>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-sm text-gray-600">{service.provider}</p>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < Math.floor(service.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                        />
                      ))}
                      <span className="ml-1">({service.reviews})</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin size={12} className="mr-1" />
                      {service.location}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Phone size={12} className="mr-1" />
                      {service.phone}
                    </div>
                    <div className="flex items-center">
                      <Clock size={12} className="mr-1" />
                      {service.hours}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700">{service.description}</p>
                  
                  <div className="flex flex-wrap gap-1">
                    {service.services.slice(0, 3).map((serviceItem, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {serviceItem}
                      </span>
                    ))}
                    {service.services.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{service.services.length - 3} more
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-gray-900">
                      ${service.price}<span className="text-sm font-normal text-gray-500">/session</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Contact
                      </Button>
                      <Button size="sm">
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Featured Banner */}
      <Card variant="gradient" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">🎉 Special Offer!</h3>
            <p className="text-white/90 mb-4">
              Get 20% off your first order with code <span className="font-bold">EDOG20</span>
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <Truck size={16} className="mr-1" />
                Free Delivery
              </div>
              <div className="flex items-center">
                <Shield size={16} className="mr-1" />
                Quality Guaranteed
              </div>
              <div className="flex items-center">
                <CreditCard size={16} className="mr-1" />
                Secure Payment
              </div>
            </div>
          </div>
          <Button variant="glass" size="lg">
            Shop Now
          </Button>
        </div>
      </Card>

      {/* Empty State */}
      {currentItems.length === 0 && (
        <Card className="text-center py-16">
          <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">
            No {activeTab === 'products' ? 'products' : 'services'} found matching your criteria
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